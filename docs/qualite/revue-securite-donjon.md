# Revue de sécurité du Donjon : dissimulation d'informations et intégrité du jeu

- Date : 2026-10-20
- Périmètre : API du module Donjon, canal temps réel des expéditions, tirages au sort.
- Références : OWASP Top 10 (A01 Broken Access Control, A04 Insecure Design).

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| D1 | La vue d'une expédition ne contient ni la graine ni le contenu des salles non explorées | Test « ne transmet ni la graine ni le contenu des salles suivantes » | Le test réussit : la vue, convertie en JSON comme par l'API, ne contient ni la graine ni les salles suivantes. La vue est construite champ par champ dans `view.ts` : un champ ajouté à l'état n'y apparaît pas par défaut. Vérifié aussi dans le navigateur : la réponse de `GET /api/dungeon/games/<id>` ne contient pas le mot `seed`. | Conforme |
| D2 | L'action choisie par un héros n'est connue que de son joueur jusqu'à la résolution de la manche | Tests « cache l'action choisie par les autres héros » et « ne révèle pas l'action d'un héros aux autres joueurs » ; outils de développement | Les tests réussissent. Vérifié à deux joueurs : après le choix « soigner » d'Alice, Bob voit la mention « prêt » sans l'action, et sa réponse `GET /api/dungeon/games/<id>` ne contient pas `heal`. Le flux de Bob contient l'événement `ActionSubmitted` avec `"data":{}`. Les trois protections sont en place : vue filtrée (domaine), seule la vue renvoyée (API), canal réservé aux membres et discret (temps réel). | Conforme |
| D3 | Le canal d'une expédition n'est accessible qu'à ses membres | Test « réserve le canal d'une expédition à ses membres (403) » | Le test réussit. Vérifié aussi dans le navigateur : un joueur connecté non membre reçoit une erreur 403 en ouvrant `/api/stream/dungeon-<id>`. | Conforme |
| D4 | Le canal d'une expédition ne transmet aucune donnée d'événement, ni par le flux, ni par la route de repli | Tests du bloc « Canal discret » et « signale l'action d'un héros sans la révéler » | Les tests réussissent : sur un canal discret, le flux et la route de repli ne transmettent que le flux, la version et le type, avec `data: {}`. Constaté dans le flux réel d'une expédition (événements `GameCreated` à `ActionSubmitted`, tous avec `"data":{}`). | Conforme |
| D5 | Un joueur ne peut agir qu'en son propre nom | Lecture de `api.ts` : aucune route n'accepte d'identifiant de joueur | Dans `api.ts`, toutes les routes lisent l'identifiant et le nom du joueur dans `c.var.userId` et `c.var.userName`, renseignés par `requireUser` ; le corps des requêtes ne contient que la manche et l'action (`SubmitActionInput`). | Conforme |
| D6 | Seul l'hôte lance l'expédition, et seul le héros dont c'est le tour ouvre une porte | Tests « ne laisse que l'hôte lancer l'expédition » et « fait ouvrir les portes à tour de rôle » | Les tests réussissent, dans le domaine comme à travers l'API (`NOT_HOST`, 403). | Conforme |
| D7 | Un joueur ne peut ni choisir ni prévoir le résultat d'un tirage au sort | Lecture de `dungeon-service.ts` : graine tirée par le serveur ; exigence D1 | Dans `dungeon-service.ts`, la graine est tirée par le serveur (`crypto.getRandomValues`) à l'ouverture de l'expédition, et l'identifiant par `crypto.randomUUID` ; aucun des deux ne provient de la requête. La graine n'est jamais transmise (D1). | Conforme |
| D8 | L'échéance d'une manche est appréciée par l'horloge du serveur | Commande d'échéance envoyée avant l'échéance | Commande `POST /api/dungeon/games/<id>/deadline` envoyée depuis la console d'un membre avant la fin du compte à rebours : réponse 200, la vue reste à la manche 1, rien n'est enregistré. La manche est résolue à la fin du compte à rebours. | Conforme |
| D9 | Une action destinée à une manche déjà résolue est refusée | Test « refuse un choix pour une manche déjà résolue » | Le test réussit : l'erreur `ROUND_OVER` indique la manche en cours. | Conforme |
| D10 | Connaître l'adresse d'une expédition ne permet pas d'y agir sans en être membre | Action envoyée par un joueur qui n'est pas membre | Action envoyée depuis la console d'un joueur connecté non membre : erreur 403 `NOT_A_MEMBER`. Ce joueur peut en revanche consulter l'expédition, dont il connaît l'adresse : ce choix est volontaire, puisqu'il permet de rejoindre une expédition à partir de son adresse. La vue consultée ne contient que des informations publiques, et l'identifiant, un UUID tiré au hasard, ne peut pas être deviné. Risque accepté pour la consultation. | Risque accepté |

## Synthèse

Sur dix exigences : neuf sont conformes, une est en risque accepté (D10, pour la seule
consultation d'une expédition par un joueur qui n'en est pas membre, justifiée ci-dessus).
Aucune exigence n'est non conforme.

Actions décidées :

- appliquer à tout futur canal d'un module le même examen : règle d'accès, canal discret
  si les événements contiennent des informations secrètes, et tests associés ;
- évaluer le risque résiduel lié au rythme des notifications du canal discret (l'instant de
  chaque événement `ActionSubmitted` reste visible des membres).
