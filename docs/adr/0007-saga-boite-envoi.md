# ADR-0007 - Les opérations qui concernent plusieurs modules sont des sagas orchestrées, dont les messages transitent par une boîte d'envoi transactionnelle

- Statut : accepté
- Date : 2026-10-20

## Contexte

Un échange du Marché modifie les données de trois flux : celui de l'offre, qui appartient
au Marché, et ceux des villages du vendeur et de l'acheteur, qui appartiennent au Village.
Il ne doit ni créer ni perdre de ressources, même en cas de panne, de conflit de version ou
d'interruption d'une fonction Vercel.

La règle d'encapsulation des modules (TD2) réserve au Village toute décision sur un
village : le Marché ne peut ni écrire dans ses flux ni dupliquer ses règles de stock. Le
TD11 étudiera l'extraction d'un module dans un service doté de sa propre base de données,
ce qu'une transaction couvrant les données de deux modules rendrait impossible.

L'hébergement ne permet aucun processus permanent (ADR 0004) : aucun processus de fond ne
peut transmettre des messages en continu, et les tâches planifiées de l'offre gratuite ne
s'exécutent qu'une fois par jour.

## Décision

- Une transaction ne modifie jamais les données que d'un seul module.
- Une opération qui concerne plusieurs modules est une saga : une suite de transactions
  locales, dont les étapes sont identifiées comme compensables (mise en séquestre des
  ressources du vendeur), pivot (prélèvement des ressources de l'acheteur) ou reprises
  jusqu'au succès (versements et restitution).
- La saga est orchestrée par le module qui porte l'opération, ici le Marché
  (`src/modules/market/domain/saga.ts`). Les participants ne connaissent pas la saga : le
  Village prélève et verse des ressources à la demande, et répond au sujet indiqué dans le
  champ `replyTo` de chaque demande (adresse de retour).
- Les messages sont enregistrés dans la boîte d'envoi de la plateforme
  (`platform.outbox`), dans la même transaction que les événements qui les déclenchent
  (paramètre `messages` de `EventStore.append`).
- La distribution est garantie au moins une fois : bail de trente secondes, réservation
  par `FOR UPDATE SKIP LOCKED`, nouvel essai avec recul exponentiel (2, 4, 8 secondes...,
  plafonné à une heure), abandon après dix tentatives.
- Chaque gestionnaire est idempotent, grâce à une clé d'idempotence choisie par le
  demandeur (`transferId`, de la forme `<offre>:reserve`, `<offre>:pay-<n>`,
  `<offre>:refund`) ; un refus de prélèvement est enregistré comme un fait.
- La distribution a lieu après chaque commande et à chaque consultation du Marché, et
  chaque jour à 4 heures UTC par une tâche planifiée de Vercel, qui appelle
  `/api/outbox/dispatch` avec le secret `CRON_SECRET` ; sans secret configuré, la route
  refuse toute requête.

## Conséquences

### Positives

- Aucun module n'écrit dans les données d'un autre : le Marché n'importe du Village que ses
  contrats.
- Une panne à n'importe quel moment ne perd ni ne duplique aucune ressource : un message
  n'est jamais perdu, et un message remis deux fois n'a d'effet qu'une fois.
- Le Village peut servir d'autres demandeurs, par exemple un impôt ou une récompense, sans
  modification.
- La boîte d'envoi sert aussi de minuterie : l'échéance des offres repose sur un message
  différé, sans mécanisme supplémentaire.
- Le déroulement de la saga se lit en un seul endroit, la fonction `requestsFor`.
- Les messages traités sont conservés : le déroulement d'une saga peut être reconstitué
  après coup.

### Négatives

- Des états intermédiaires sont visibles des joueurs, comme une offre en réservation ou en
  règlement, et l'interface doit les présenter.
- La latence dépend de l'activité : une saga interrompue ne reprend qu'à la consultation
  suivante du Marché, ou au plus tard le lendemain avec la tâche planifiée ; une offre
  échue reste en séquestre jusque-là.
- Chaque gestionnaire doit être idempotent, et ses doublons doivent être testés.
- Les messages abandonnés ne peuvent encore être ni examinés ni relancés (dette DT-007) :
  une offre dont un message est abandonné reste bloquée, ses ressources en séquestre.
- La table de la boîte d'envoi grandit sans limite, les messages traités étant conservés.
- La relation entre le Marché et le Village passe par des messages que dependency-cruiser
  ne voit pas : elle doit être décrite dans le document d'architecture.

## Alternatives écartées

- **Transaction unique englobant les données des deux modules** : le Marché devrait
  connaître les événements et les règles du Village, contre la règle d'encapsulation ;
  l'extraction d'un module deviendrait impossible, et les deux villages resteraient
  verrouillés pendant l'échange.
- **Transaction distribuée par validation en deux phases** : peu disponible dans les
  services hébergés, elle rend chaque base dépendante de la disponibilité des autres et
  maintient des verrous pendant toute la coordination.
- **Appel direct du Village par le Marché, sans boîte d'envoi** : problème de la double
  écriture ; une panne entre l'enregistrement de l'offre et l'appel laisse l'offre en
  réservation ou fait disparaître les ressources du vendeur.
- **Saga chorégraphiée** : le Village devrait réagir aux événements du Marché, et donc les
  connaître ; le déroulement serait réparti entre les participants.
- **Journal d'événements utilisé comme boîte d'envoi** : un message est une commande
  adressée à un destinataire, et non un fait, et la distribution doit suivre message par
  message le nombre de tentatives et la dernière erreur, ce qu'un point de reprise ne
  permet pas.

## Réexamen

Cette décision devra être réexaminée si un module est extrait dans un service distinct,
ce qui demanderait une boîte d'envoi par base et un transport entre services ; si le volume
de messages justifie un courtier de messages dédié ; ou si un besoin de latence apparaît que
la distribution déclenchée par les requêtes ne satisfait plus.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR à partir des éléments imposés par le support du TD9,
et a vérifié sa cohérence avec le code de la boîte d'envoi, des modules Village et Marché,
et avec leurs tests.
