# ADR-0005 - Une intelligence artificielle déterministe, exécutée dans le domaine, sans tâche de fond

- Statut : accepté
- Date : 2026-10-20

## Contexte

Le Donjon a besoin de personnages pilotés par l'ordinateur : des monstres dont le
comportement dépend d'un niveau de difficulté choisi par l'hôte, et des compagnons, héros
sans joueur, qui permettent de jouer une expédition seul.

L'hébergement ne permet aucun processus permanent : aucune boucle de jeu ne peut
s'exécuter entre deux requêtes, et les échéances des manches sont déjà paresseuses
(ADR 0004).

L'état d'une expédition est reconstruit à partir de ses événements (ADR 0002), et une
manche échue peut être calculée lors d'une lecture sans être enregistrée (ADR 0004) :
toute décision doit pouvoir être recalculée à l'identique.

## Décision

Les décisions de l'intelligence artificielle sont des fonctions pures du domaine
(`monster-strategies.ts`, `companion.ts`), appelées uniquement au moment de la résolution
d'une manche, dans `resolveRound`.

Elles ne tirent au sort qu'au moyen du générateur pseudo-aléatoire de la manche, dont la
graine est dérivée de celle de l'expédition et du numéro de manche.

Leurs résultats sont enregistrés dans l'événement `RoundResolved`, y compris les actions
des compagnons : la relecture d'une expédition n'exécute jamais l'intelligence
artificielle.

Le choix de la cible d'un monstre est isolé derrière un port de stratégie
(`MonsterStrategy`), dont chaque niveau de difficulté fournit une mise en œuvre : au hasard
au niveau facile, en concentrant les attaques au niveau difficile, qui reçoit en outre un
bonus d'attaque.

Un compagnon n'agit que si au moins un joueur a choisi une action pour la manche ; sinon,
il se défend.

L'équilibre du jeu est mesuré par la simulation d'expéditions complètes
(`simulation.ts`, `scripts/simulate-dungeon.ts`), et protégé par des tests statistiques
sur des graines fixées (`simulation.test.ts`).

## Conséquences

### Positives

- Aucune nouvelle brique d'architecture : ni boucle de jeu, ni tâche de fond, ni processus
  permanent ; l'intelligence artificielle s'insère dans le calcul existant de la
  résolution des manches.
- Une même manche produit toujours les mêmes décisions, qu'elle soit calculée lors d'une
  lecture ou enregistrée par une commande.
- Une modification de l'intelligence artificielle ne change pas les parties déjà jouées,
  puisque ses décisions sont enregistrées.
- Les décisions se testent exactement, sans base de données ni attente : tests exacts,
  tests d'invariant et tests statistiques reproductibles, qui ne peuvent pas devenir
  instables.
- Ajouter un niveau de difficulté consiste à écrire une stratégie ; la vérification des
  types refuse un niveau sans stratégie.
- Des milliers d'expéditions peuvent être simulées en quelques secondes pour régler le jeu
  à partir de mesures.

### Négatives

- Un personnage piloté par l'ordinateur ne peut agir qu'à la résolution d'une manche : il
  ne peut ni réagir entre deux échéances, ni prendre une initiative.
- La qualité de l'équilibre dépend de la règle suivie par les joueurs simulés, qui ne
  représente qu'imparfaitement les joueurs réels (ils ne soignent jamais, par exemple).
- La simulation et les tests statistiques ralentissent légèrement la vérification, et
  leurs seuils doivent être revus à chaque rééquilibrage.
- Les nouveaux champs des événements doivent rester facultatifs et être lus par
  upcasting, ce qui complexifie la fonction `evolve`.
- Les monstres du niveau difficile exploitent les actions des héros de la manche :
  cette règle doit rester confinée au serveur pour ne pas devenir une fuite d'information.

## Alternatives écartées

- **Boucle de jeu exécutée par un processus permanent** : impossible sur des fonctions
  Vercel sans état, et contraire aux échéances paresseuses de l'ADR 0004.
- **Décisions prises par le navigateur d'un joueur** : un joueur pourrait les falsifier,
  et un compagnon dépendrait d'un navigateur ouvert.
- **Recalcul des décisions lors de la relecture, plutôt que leur enregistrement** : toute
  modification de l'intelligence artificielle changerait rétroactivement les parties
  déjà jouées.

## Réexamen

Cette décision devra être réexaminée si un personnage doit agir en temps réel, entre deux
échéances, ou si une intelligence artificielle devient trop coûteuse en calcul pour être
exécutée lors de chaque lecture d'une expédition.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR à partir des éléments imposés par le support du TD7,
et a vérifié sa cohérence avec le code du domaine du Donjon et les mesures du script de
simulation.
