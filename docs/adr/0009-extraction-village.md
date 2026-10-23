# ADR-0009 - Extraire le Village en service autonome, préparé mais non déployé

- Statut : accepté
- Date : 2026-10-23

## Contexte

L'ADR 0001 a retenu un monolithe modulaire, en promettant des frontières entre modules
assez strictes pour qu'un module puisse un jour être extrait en service autonome. Cette
promesse n'avait jamais été vérifiée.

Les raisons habituelles d'extraire un module ne s'appliquent pas aujourd'hui au jeu :
- montée en charge indépendante ;
- autonomie des équipes ;
- cadence de déploiement propre ;
- isolation des pannes ;
- technologie différente.

Royaumes est développé par une seule personne, joué par quelques dizaines de joueurs, et
le test de charge du TD11 montre que le Village respecte son budget de performance.

L'inventaire des dépendances du Village montre que le reste du code n'importe de lui que
ses contrats (`contracts.ts`), et que lui n'importe que la plateforme. Deux dépendances ne
passent cependant pas par le code. Le Classement et le canal temps réel du village lisent
ses événements directement dans le journal commun, selon le langage publié du TD8.
Après une extraction, le journal du service ne serait plus celui de l'application.

## Décision

- Le Village peut s'exécuter dans un service autonome (`src/services/village/`, démarré par
  `scripts/village-service.ts`), avec sa propre base, son propre journal et sa propre boîte
  d'envoi. Il reprend le module Village sans modification.
- L'application devient alors une passerelle. Elle reçoit une version distante du module
  (`src/modules/realm/remote.ts`), de même forme que la version exécutée dans le processus :
  API, règle du canal, gestionnaires de messages, données personnelles et tâche quotidienne.
- Les messages de la saga franchissent la frontière par une boîte de réception
  (`src/platform/outbox/inbox-api.ts`). Un message n'est marqué comme traité qu'à la
  réception d'une réponse de succès, sans modifier les garanties de la boîte d'envoi.
- Un relais recopie le flux d'événements publié par le service (`GET /events`) dans le
  journal de l'application, où le Classement et le canal temps réel continuent de le lire.
  Il est déclenché après chaque commande et chaque message du Village, et chaque jour.
- Les échanges entre les deux processus sont authentifiés par un secret partagé
  (`SERVICE_SECRET`, `src/platform/http/service-auth.ts`), jamais versionné.
- Le service n'est pas déployé. Sans les variables `REALM_SERVICE_URL` et `SERVICE_SECRET`,
  ce qui est le cas sur Vercel, le Village s'exécute dans l'application.

## Conséquences

### Positives

- Les frontières du Village sont démontrées, et non plus supposées : aucune ligne du
  domaine, du service ni de l'API du Village n'a été modifiée pour l'extraction.
- Six tests de contrat (`src/bootstrap/village-service.test.ts`) vérifient ces frontières à
  chaque construction, y compris la reprise de la saga après une panne du service.
- L'extraction est réversible sans migration de données. Le relais dépose une copie
  complète des événements dans le journal de l'application, qui retrouve les villages en
  s'exécutant de nouveau seule.
- La boîte de réception, `forwardTo` et l'authentification entre services ne connaissent
  aucun module : ils serviraient tels quels à l'extraction d'un autre module.
- Le coût réel d'une extraction est connu : environ 150 lignes de module distant, 80 lignes
  de service, une boîte de réception, un relais, et deux processus à démarrer.
- La démonstration a rendu visible l'isolation des pannes. Service arrêté, le Village
  répond par une erreur 500, tandis que la Taverne, le Marché et le Classement continuent
  de répondre.

### Négatives

- Deux chemins d'exécution du Village sont à maintenir, l'un dans le processus, l'autre
  distant. Seuls les tests de contrat exercent le second.
- Les événements du Village sont copiés dans le journal de l'application. La cohérence de
  cette copie est différée, et l'effacement d'un joueur doit réécrire les deux exemplaires.
- Des dettes sont à rembourser avant tout déploiement du service : ses migrations, la
  pagination de son flux publié et la distribution périodique de sa boîte d'envoi.
- Le secret partagé authentifie les deux sens. En cas de fuite, il permettrait de se faire
  passer pour n'importe quel joueur auprès du service.
- Une panne du service rend le Village indisponible pendant que le reste du jeu
  fonctionne, ce qui ne pouvait pas arriver dans le monolithe.

## Alternatives écartées

- **Déployer le service** : aucune des raisons d'extraire ne s'applique, et un second
  déploiement doublerait l'exploitation (hébergement, base, secrets, journaux), sans aucun
  bénéfice pour les joueurs.
- **Ne pas extraire** : les frontières resteraient à l'état d'hypothèse, et le jour où une
  raison d'extraire apparaîtrait, l'effort serait inconnu.
- **La lecture à distance du flux publié, par le Classement et le canal temps réel** : le
  moteur des projections et le canal devraient savoir lire deux sources. Le relais laisse
  ces consommateurs inchangés.
- **Extraire un autre module, comme le Marché** : sa saga lie son sort à celui du Village,
  et il lit des projections de l'application. Le Village, dont le domaine ne dépend de
  rien, était le candidat le plus simple, et celui désigné dès le TD0.
- **Un jeton signé (JWT) ou le TLS mutuel** : plus robustes face à une fuite, ils
  demanderaient une gestion de clés ou de certificats sans objet pour deux processus sur un
  même poste.

## Réexamen

Cette décision devra être réexaminée si l'un des signes suivants apparaît :
- un test de charge du Village dépasse le budget de performance alors que les autres
  modules le respectent ;
- une seconde équipe est chargée du Village ;
- le Village doit être déployé plus souvent que le reste du jeu ;
- une panne ou une faille du Village doit être isolée du reste du jeu.

Le déploiement demanderait alors de rembourser d'abord les dettes de l'extraction, et de
migrer les flux `village-` existants vers la base du service.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR à partir des éléments imposés par le support du TD11,
et a vérifié sa cohérence avec le code du service, du module distant, de la boîte de
réception, avec les tests de contrat et avec la démonstration à deux processus.
