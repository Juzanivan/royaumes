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
| D11 | Aucun joueur ne peut agir au nom d'un compagnon ni écouter le canal en son nom | Test « présente le compagnon comme prêt, et ne le compte pas parmi les membres » ; fonction `isMember` de `rules.ts` | Le test réussit : un joueur dont l'identifiant serait celui d'un compagnon (`companion-1`) n'est pas membre. `isMember` (`rules.ts`) et le champ `isMember` de la vue écartent les héros `companion`, et la règle d'accès au canal s'appuie sur ce champ. Les actions sont toujours attribuées à `c.var.userId` (D5), et les identifiants des joueurs, attribués par Better Auth, ne peuvent pas prendre la forme `companion-<n>`. | Conforme |
| D12 | L'intelligence artificielle ne transmet aux joueurs aucune information qu'ils n'auraient pas autrement | Lecture de `companion.ts` et `monster-strategies.ts` ; vue filtrée inchangée | `chooseCompanionAction` (`companion.ts`) ne reçoit que les héros et les monstres du début de la manche, sans les actions des joueurs. Les stratégies des monstres (`monster-strategies.ts`), qui connaissent ces actions, s'exécutent sur le serveur pendant la résolution ; leurs décisions et l'action des compagnons ne sont transmises qu'une fois la manche résolue, dans l'événement `RoundResolved` et le compte rendu `lastRound` de la vue. `view.ts` ne présente un compagnon que comme « prêt », sans son action, et le canal reste discret. | Conforme |
| D13 | Le canal du classement ne transmet aucune donnée d'événement, en particulier la graine d'une expédition | Test « annonce sur son canal les événements du classement, sans leurs données » | Le test réussit : la règle du canal `ranking` est discrète (`redact: true`, dans `src/modules/ranking/index.ts`), et la réponse de la route de repli ne contient pas le mot `seed`. Les événements `GameCreated`, qui portent la graine, n'y apparaissent qu'avec des données vides. | Conforme |
| D14 | Les informations transmises par le canal du classement sont déjà accessibles à tout joueur connecté | Lecture de la fonction `present` de `stream-api.ts` ; réponse de l'API du classement | `present` ne transmet que la position, le nom du flux, la version et le type de chaque événement. Le nom d'un flux contient l'identifiant d'un joueur (`village-<id>`) ou d'une expédition (`dungeon-<id>`). Les identifiants des joueurs figurent déjà dans la réponse de l'API du classement (`playerId`), mais seulement pour les vingt premiers : le canal révèle aussi ceux des joueurs suivants, sans rien permettre de faire avec eux (chaque joueur n'accède qu'à ses propres données, S11). Le canal révèle aussi les identifiants des expéditions déjà lancées, qui n'apparaissent plus dans la liste des expéditions ouvertes ; un identifiant d'expédition ne permet ni d'y agir (D10) ni d'écouter son canal (D3), seulement de la consulter, ce qui relève du risque déjà accepté en D10. L'écart est faible et sans conséquence sur le jeu : risque accepté. | Risque accepté |

## Synthèse

Sur quatorze exigences : douze sont conformes et deux sont en risque accepté (D10, pour la
seule consultation d'une expédition par un joueur qui n'en est pas membre, et D14, pour les
identifiants transmis par le canal du classement, justifiés ci-dessus). Aucune exigence
n'est non conforme.

Les exigences D11 et D12 ont été ajoutées au TD7, avec les compagnons et l'intelligence
artificielle des monstres, et les exigences D13 et D14 au TD8, avec le canal global du
classement.

Actions décidées :

- appliquer à tout futur canal d'un module le même examen : règle d'accès, canal discret
  si les événements contiennent des informations secrètes, et tests associés ;
- évaluer le risque résiduel lié au rythme des notifications du canal discret (l'instant de
  chaque événement `ActionSubmitted` reste visible des membres) ;
- conserver toute décision de l'intelligence artificielle qui exploite des informations
  secrètes sur le serveur, et ne la transmettre qu'après la résolution de la manche ;
- réexaminer D14 si un identifiant de joueur ou d'expédition devient un jour suffisant pour
  agir, par exemple dans une API qui accepterait un identifiant de joueur.
