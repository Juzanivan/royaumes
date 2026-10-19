# ADR-0002 - L'Event Sourcing comme mode de persistance du Village

- Statut : accepté
- Date : 2026-10-19

## Contexte

L'état d'un village évolue par une suite d'actions successives du joueur : fondation, puis
améliorations de bâtiments. La production de ressources n'est pas enregistrée en continu :
elle se déduit du temps écoulé depuis la dernière action. Le domaine du Village est déjà
modélisé selon le modèle decider : des commandes produisent des événements, et l'état
s'obtient en appliquant ces événements.

La suite du projet annonce deux besoins qui reposent sur l'historique des actions :
la diffusion des changements en temps réel aux navigateurs des joueurs (TD5), et la
construction de vues de lecture, comme le classement, à partir de l'activité des
joueurs (TD8).

L'application est hébergée sur Vercel : plusieurs instances peuvent traiter
simultanément des requêtes pour un même village, par exemple lors d'un double clic ou
d'une utilisation dans deux onglets. Ces instances ne partagent aucune mémoire ; seule la
base de données leur est commune.

## Décision

L'état du village n'est pas stocké : il est reconstruit à chaque chargement en rejouant
ses événements (fonction `replay` du domaine).

Les événements sont enregistrés dans un journal générique de la plateforme, la table
`platform.events` (`src/platform/event-store/`), en ajout seul. Chaque village correspond
à un flux nommé `village-<joueur>`, dans lequel chaque événement porte une version
croissante.

Les écritures concurrentes sont détectées par la contrainte d'unicité sur le couple
(flux, version) : une écriture fondée sur une version périmée est refusée par la base.
La commande est alors rejouée entièrement (chargement, décision, enregistrement), au plus
trois fois (`withOptimisticRetry`).

Un événement porte toutes les informations nécessaires à son application, sans dépendre
de règles susceptibles d'évoluer : l'événement `BuildingUpgraded` contient ainsi le coût
effectivement payé.

Le module accède au journal par un adaptateur de son port de persistance
(`event-store-village-repository.ts`) : le domaine et la couche application ignorent
tout du stockage.

## Conséquences

### Positives

- L'historique complet de chaque village est conservé : il est possible de savoir comment
  un village est arrivé à son état, et de reconstruire son état à n'importe quel moment
  passé.
- Le journal sert de source unique pour les besoins futurs : le temps réel pourra lire les
  nouveaux événements d'un flux, et les vues de lecture pourront être construites ou
  reconstruites à partir de l'ensemble des événements.
- Les écritures concurrentes sont détectées par la base elle-même, sans verrou : deux
  améliorations simultanées ne peuvent pas être payées avec les mêmes ressources.
- Une décision qui produit plusieurs événements est enregistrée entièrement ou pas du tout,
  par une seule instruction `INSERT`.
- Le journal est générique : le Donjon et le Marché pourront l'utiliser sans modification.

### Négatives

- Un événement enregistré ne peut jamais être modifié. Toute évolution de la structure d'un
  événement doit rester compatible avec les événements déjà enregistrés, ou être prise en
  charge à la lecture (adaptation des anciens événements).
- Le coût du chargement d'un village croît avec le nombre de ses événements, puisque
  l'état est reconstruit à chaque commande.
- La reconversion des événements génériques en événements du domaine repose sur des
  assertions de type non vérifiées à l'exécution : une erreur de structure ne serait pas
  détectée par le compilateur.
- Il n'existe pas de table qui présente l'état courant des villages : une requête SQL ne
  permet pas de consulter directement les niveaux ou le stock d'un joueur.
- Le modèle est moins familier qu'un stockage de l'état, ce qui demande un effort de
  compréhension à toute personne qui rejoint le projet.

## Alternatives écartées

- **Stockage de l'état dans une table propre au module** (une ligne par village, mise à
  jour à chaque commande) : plus simple à interroger, mais l'historique des actions serait
  perdu, et le temps réel comme les vues de lecture exigeraient un mécanisme supplémentaire
  pour savoir ce qui a changé. Il faudrait en outre un contrôle de concurrence propre à
  cette table.
- **Verrouillage pessimiste** (verrou posé sur le village pendant le traitement d'une
  commande) : il empêcherait les conflits au lieu de les détecter, mais imposerait une
  transaction ouverte pendant tout le traitement et ralentirait toutes les commandes pour
  un cas rare. Avec des instances sans serveur, un verrou non libéré bloquerait le village.
- **Conservation des événements en mémoire** (adaptateur du TD2) : données perdues à
  chaque redémarrage et non partagées entre les instances de Vercel.

## Réexamen

Cette décision devra être réexaminée si le nombre d'événements par village devient tel
que la reconstruction de l'état rend une commande sensiblement plus lente (de l'ordre de
plusieurs milliers d'événements par flux). La mise en place d'instantanés (snapshots)
serait alors envisagée avant tout abandon de l'Event Sourcing. Elle devra également
l'être si un besoin de requêtes fréquentes sur l'état courant de tous les villages
apparaît, sans pouvoir être couvert par une vue de lecture.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR à partir des éléments imposés par le support du TD3,
et a vérifié sa cohérence avec le code (`src/platform/event-store/`, `src/modules/realm/`)
et avec les tests du journal d'événements.
