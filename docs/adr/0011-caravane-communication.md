# ADR-0011 - La Caravane échange avec le Village par une saga compensable, et partage ses faits avec le Classement par son langage publié

- Statut : accepté
- Date : 2026-10-23

## Contexte

Une caravane déplace des ressources entre deux villages. Le Village est seul à décider de
son stock (règle d'encapsulation du TD2) : la Caravane ne peut ni lire ni écrire ses flux.
Une caravane doit pourtant prélever sa cargaison chez l'expéditeur, puis la verser au
destinataire, ou rendre ce qu'il en reste à l'expéditeur après une attaque, sans jamais créer
ni perdre de ressources (règle 10), y compris en cas de panne entre deux étapes.

Deux autres besoins concernent les modules existants :

- la Caravane doit savoir quels joueurs possèdent un village (règle 1), et sous quel nom ;
- le Classement doit compter les caravanes livrées par chaque joueur (bonus B6).

Le Village sait déjà prélever et verser des ressources à la demande, avec réponse et clé
d'idempotence : c'est le langage publié qu'il offre au Marché depuis le TD9 (ADR 0007).

## Décision

- **Saga orchestrée par la Caravane** (`src/modules/caravan/domain/saga.ts`), par les messages
  de la boîte d'envoi :
  1. à l'envoi, prélèvement de la cargaison et du prix de l'escorte (`realm.withdraw`, clé
     `<caravane>:load`), réponse attendue sur `caravan.transfer-result` ; c'est l'étape
     compensable ;
  2. au départ, rappel différé à l'heure de l'issue (`caravan.resolve`) ;
  3. à la livraison, versement de toute la cargaison au destinataire (`realm.deposit`, clé
     `<caravane>:deliver`) ;
  4. après une attaque, **compensation** : versement du reste à l'expéditeur (`realm.deposit`,
     clé `<caravane>:return`) ;
  5. un refus de prélèvement annule la caravane : rien n'a été prélevé, rien n'est à compenser.
- Le Village n'est pas modifié : ses sujets, ses schémas de validation et ses gestionnaires
  idempotents servent tels quels. La Caravane n'importe de lui que ses contrats
  (`REALM_TOPICS`, `ResourceAmounts`, `VILLAGE_CHANNEL_PREFIX`).
- Les gestionnaires de la Caravane (`messages.ts`) sont idempotents : le domaine ignore une
  réponse dont la clé ne correspond pas à l'étape en cours, et un rappel arrivé après l'issue.
- **Lecture du langage publié du Village** : la projection de la Caravane lit les événements
  `VillageFounded` pour tenir la liste des destinations.
- **Langage publié de la Caravane** : le Classement lit `CaravanSent`, `CaravanDelivered`,
  `CaravanCancelled` et `CaravanAmbushed`. Il retient l'expéditeur à l'envoi, et lui attribue
  la livraison ; sa projection passe en version 3 (`ranking-projection.ts`) et est reconstruite.

## Conséquences

### Positives

- Les garanties de l'ADR 0007 s'appliquent sans mécanisme nouveau : livraison au moins une
  fois, nouvel essai avec recul exponentiel, effet unique grâce aux clés d'idempotence.
- Aucune ressource n'est créée ni perdue : le test de bout en bout compare les stocks
  d'Alice et de Bob à celui de Carol, qui ne participe à aucun échange.
- Le Village a servi un deuxième demandeur sans aucune modification, comme l'ADR 0007 le
  prévoyait.
- La Caravane ignore tout du Classement : elle publie ses faits, et tout lecteur du journal
  peut les exploiter.

### Négatives

- La cohérence n'est que différée : entre le prélèvement et la livraison, les ressources ne
  sont dans aucun village ; une caravane qui arrive pendant une panne n'est livrée qu'à la
  distribution suivante de la boîte d'envoi.
- Les événements de la Caravane deviennent un contrat : renommer un événement ou retirer
  `senderId` de `CaravanSent` casserait le Classement, sans que dependency-cruiser le voie.
- La liste des destinations dépend de l'événement `VillageFounded` : un changement de son
  format par le Village casserait la Caravane, de la même manière.
- Le prix de l'escorte est prélevé avec la cargaison et n'est jamais rendu : il sort du jeu,
  ce qui est voulu (règle 6), mais fait de la règle 10 une égalité sur la seule cargaison.

## Alternatives écartées

- **Appeler directement le service du Village** : la Caravane dépendrait de son code, et
  une panne entre le prélèvement et le versement perdrait des ressources.
- **Une transaction qui couvre les flux de la caravane et des deux villages** : contraire à la
  règle « une transaction, un module » de l'ADR 0007, et impossible avec un Village extrait
  (ADR 0009).
- **Notifier le Classement par un message** : le Classement aurait un gestionnaire de plus et
  la Caravane devrait le connaître ; la lecture du journal suffit, comme pour le Donjon.
- **Demander au Village la liste des villages, à chaque envoi** : le Village devrait exposer
  une route nouvelle, et chaque envoi dépendrait de sa disponibilité.
- **Rendre le prix de l'escorte avec le reste, après une attaque** : l'escorte deviendrait
  gratuite en cas d'échec, ce qui retirerait l'arbitrage voulu par la règle 6.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR et le code de la saga, à partir de la fiche de cadrage et
de l'ADR 0007. Le résultat a été vérifié par les tests de la saga (`caravan.test.ts`), les
tests de l'API (livraison, attaque, rappel différé, conservation des ressources), le test de
la projection du Classement, et une relecture de l'auteur.
