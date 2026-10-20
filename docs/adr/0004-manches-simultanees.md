# ADR-0004 - Des manches simultanées, aux échéances paresseuses, pour les combats du Donjon

- Statut : accepté
- Date : 2026-10-20

## Contexte

Les combats du Donjon réunissent jusqu'à quatre joueurs humains. Ils ne doivent ni
s'attendre indéfiniment les uns les autres, ni être avantagés ou désavantagés par l'ordre
dans lequel ils jouent.

L'hébergement sur Vercel ne permet ni minuteur conservé en mémoire, ni tâche de fond : une
fonction s'arrête après avoir répondu à sa requête, et l'instance qui a démarré une manche
n'est pas nécessairement celle qui traitera la requête suivante. Les tâches planifiées de
l'offre gratuite ne s'exécutent qu'une fois par jour.

L'état d'une expédition est reconstruit à partir de ses événements à chaque requête
(ADR 0002) : tout calcul, y compris un tirage au sort, doit pouvoir être refait à
l'identique.

Les choix des joueurs doivent rester secrets jusqu'à la résolution de la manche, sans quoi
le dernier à jouer retrouverait un avantage.

## Décision

Les héros choisissent leur action simultanément. Une manche est résolue lorsque tous les
héros debout ont choisi, ou lorsque son échéance de trente secondes est atteinte ; un héros
qui n'a rien choisi se défend.

L'échéance est une donnée enregistrée dans les événements (`RoomEntered` pour la première
manche d'un combat, `nextDeadline` de `RoundResolved` pour les suivantes), et non un
minuteur. Une manche échue est résolue à l'instant de son échéance, et non à l'instant où
cette résolution est calculée.

Une lecture calcule la résolution des manches échues sans rien enregistrer (`toView`).
Toute commande commence par enregistrer la résolution des manches échues (`settle`, dans
`decide`), puis traite sa propre demande. Le navigateur envoie une commande d'échéance
(`CheckDeadline`) lorsque son compte à rebours atteint zéro ; le serveur, avec sa propre
horloge, décide seul si l'échéance est atteinte.

Le hasard est tiré dans `decide`, au moyen d'un générateur pseudo-aléatoire à graine
(`random.ts`) : la graine de l'expédition est tirée par le serveur à sa création, et chaque
manche utilise une graine dérivée de son numéro. Les résultats des tirages (salles,
dégâts) sont enregistrés dans les événements ; la graine n'est jamais transmise aux
joueurs.

Une action porte le numéro de la manche visée, et est refusée (`ROUND_OVER`) si cette
manche est déjà résolue.

## Conséquences

### Positives

- La durée d'une manche ne dépend pas du nombre de joueurs, et est plafonnée à trente
  secondes ; aucun joueur n'est avantagé par l'ordre de jeu.
- Aucune infrastructure supplémentaire n'est nécessaire : l'échéance est respectée sans
  minuteur, sans tâche de fond et sans instance permanente.
- La résolution affichée par une lecture est exactement celle que la commande suivante
  enregistrera : même état, même graine, même instant.
- La commande d'échéance est idempotente : plusieurs navigateurs peuvent l'envoyer au même
  instant, la concurrence optimiste n'enregistre qu'une résolution.
- Avec une graine fixée, le contenu du donjon et le résultat des combats sont prévisibles,
  ce qui rend les règles entièrement testables.
- Une action envoyée trop tard ne s'applique jamais à une manche que le joueur n'a pas vue.

### Négatives

- Si plus aucun joueur ne se manifeste, la résolution d'une manche échue n'est jamais
  enregistrée dans le journal : le journal peut être en retard sur ce qu'affichent les
  lectures, et une expédition abandonnée n'enregistre jamais sa fin (`GameEnded`).
- Les notifications temps réel de la résolution dépendent des navigateurs : sans
  navigateur ouvert pour envoyer la commande d'échéance, aucun événement n'est diffusé.
- Chaque fin de manche provoque une rafale de commandes simultanées (une par navigateur),
  et donc des conflits de version rejoués, ce qui impose d'augmenter le nombre de
  tentatives (`MAX_HEROES + 1`).
- Le comportement est contre-intuitif pour qui découvre le code : une lecture affiche une
  manche que le journal ne contient pas encore, et une commande peut ne rien enregistrer.
- La sécurité du hasard repose sur le secret de la graine : un générateur pseudo-aléatoire
  n'est pas cryptographique, et une fuite de la graine révélerait tout le donjon.

## Alternatives écartées

- **Tour par tour strict** : chaque héros agit à son tour, en connaissant les choix
  précédents ; les joueurs s'attendent mutuellement, et le dernier à jouer est avantagé.
- **Minuteur en mémoire ou tâche planifiée** : un minuteur n'a nulle part où s'exécuter
  dans une fonction Vercel, et les tâches planifiées de l'offre gratuite ne s'exécutent
  qu'une fois par jour.
- **Lecture qui enregistre elle-même la résolution** : contraire à la sémantique de `GET`,
  elle provoquerait des écritures, des conflits et des notifications à chaque consultation.
- **Tirage par `Math.random`, dont seul le résultat serait enregistré** : la résolution
  calculée lors d'une lecture ne pourrait pas être reproduite à l'identique par la commande
  qui l'enregistre ensuite.

## Réexamen

Cette décision devra être réexaminée si le projet doit enregistrer la fin des expéditions
abandonnées (par exemple pour le classement du TD8), si l'hébergement offre un service de
planification de tâches compatible et suffisamment fréquent, ou si le nombre de joueurs par
expédition augmente au point que les conflits de fin de manche deviennent coûteux.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR à partir des éléments imposés par le support du TD6,
et a vérifié sa cohérence avec le code du domaine du Donjon (`rules.ts`, `view.ts`,
`random.ts`) et avec ses tests.
