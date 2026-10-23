# Revue de sécurité de la Caravane : intégrité des voyages et secret de leur issue

- Date : 2026-10-23
- Périmètre : API du module Caravane, gestionnaires de ses messages, saga avec le Village,
  canal temps réel `caravan-<caravane>`, projection et données personnelles du module.
- Références : OWASP Top 10 (A01 Broken Access Control, A03 Injection, A04 Insecure Design,
  A08 Software and Data Integrity Failures), revue de sécurité du Marché.

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| C1 | Toutes les routes du module sont réservées aux joueurs connectés | Test « refuse une requête anonyme (401) » (`src/bootstrap/caravan-api.test.ts`) | Le test réussit : les quatre routes (`GET /`, `GET /destinations`, `GET /:id`, `POST /`) répondent 401 sans session. `create-api.ts` protège `/caravans` et `/caravans/*` par `requireUser`. | Conforme |
| C2 | Un joueur n'envoie une caravane qu'en son propre nom | Lecture de `api.ts` et du schéma `SendCaravanInput` | L'expéditeur est lu dans `c.var.userId` et `c.var.userName`, renseignés par `requireUser`. Le corps ne contient que `recipientId`, `cargo` et `escort` : aucun champ ne désigne l'expéditeur. | Conforme |
| C3 | Toutes les entrées sont validées : quantités entières et positives, ressources connues, escorte connue | Test « valide le corps de la requête (400) » ; tests du domaine sur la cargaison | Le test réussit : une quantité négative, une cargaison vide, une ressource inconnue (`iron`), une escorte inconnue et un destinataire vide sont refusés (400). Le schéma `ResourceAmounts` du Village (`.strict()`, entiers positifs) et `z.enum(ESCORTS)` valident le corps ; le domaine vérifie de nouveau la cargaison (`checkSend`). | Conforme |
| C4 | Un joueur ne dépasse ni la capacité d'une caravane, ni trois caravanes en route | Tests « refuse un destinataire sans village, son propre village, et une cargaison trop lourde » et « refuse une quatrième caravane en route » | Les tests réussissent (409 `OVER_CAPACITY`, 409 `TOO_MANY_CARAVANS`). Le nombre de caravanes en route est toutefois lu avant l'envoi, hors de la transaction : deux envois simultanés peuvent dépasser la limite. Aucune ressource n'est créée pour autant : chaque caravane paie sa cargaison. | Risque accepté (DT-016) |
| C5 | Seuls l'expéditeur et le destinataire consultent une caravane, sa vue comme son canal | Test « présente la caravane à l'expéditeur et au destinataire, et à eux seuls » | Le test réussit : Carol reçoit 404 sur la vue, 403 sur le canal `caravan-<id>`, et une liste vide. La règle du canal (`index.ts`) recharge la caravane et compare l'identifiant du joueur à l'expéditeur et au destinataire. | Conforme |
| C6 | La graine des brigands n'est jamais transmise : ni par la vue, ni par le canal, ni par la projection, ni par l'export | Tests « fait partir la caravane… » (vue sans `seed`), « présente la caravane… » (flux sans `seed`), test du contributeur de données personnelles ; lecture de `schema.ts` | Les tests réussissent : la vue n'a pas de propriété `seed`, le flux du canal ne contient pas la chaîne `seed` (canal discret, `redact: true`), l'export est construit à partir de la vue. La table `caravan.caravans` n'a pas de colonne pour la graine : la projection ne la recopie pas. | Conforme |
| C7 | L'issue d'un voyage n'est révélée à aucun joueur avant son heure | Test « rend à l'expéditeur ce que les brigands ont laissé, et ne révèle l'attaque qu'à son heure » ; test du domaine « ne révèle ni la graine, ni l'attaque, avant qu'elle soit constatée » | Les tests réussissent : avant l'heure de l'attaque, la vue indique `travelling`, avec `ambushedAt`, `stolen` et `returned` à `null`. Seules les heures publiques du départ et de l'arrivée prévue sont présentées. | Conforme |
| C8 | Aucun joueur ne peut avancer l'issue d'une caravane | Test du domaine « livre toute la cargaison… et pas avant » (`ResolveDue` refusé avec `NOT_DUE`) ; lecture de `api.ts` | Aucune route n'accepte d'heure ni de commande d'issue : `Resolve` est appelé par les lectures et ne fait rien avant l'heure, `ResolveDue` n'est appelé que par le rappel de la boîte d'envoi, et échoue avant l'heure. L'horloge est celle du serveur. | Conforme |
| C9 | Un voyage ne crée ni ne détruit de ressources | Tests « livre toute la cargaison… » et « rend à l'expéditeur… » (comparaison au stock de Carol) ; test du domaine « ne crée aucune ressource » | Les tests réussissent : après une livraison, Bob a reçu exactement ce qu'Alice a perdu ; après une attaque, Alice a récupéré la moitié supérieure de chaque ressource, et Bob rien. Le prix de l'escorte sort volontairement du jeu (règle 6). | Conforme |
| C10 | Un message remis plusieurs fois n'a d'effet qu'une fois | Test du domaine « n'applique l'issue qu'une fois, malgré les constats répétés et les messages en double » ; tests d'idempotence du Village (TD9) | Le test réussit : une réponse du Village en double ou tardive, un rappel arrivé après l'issue et un second constat ne produisent aucun événement. Les clés `<caravane>:load`, `:deliver` et `:return` sont construites par le domaine ; le Village ignore un mouvement déjà traité. | Conforme |
| C11 | Aucun joueur ne peut provoquer un mouvement de ressources par la Caravane autrement que par l'envoi d'une caravane | Lecture de `api.ts`, `messages.ts` et `saga.ts` | Seul `requestsFor` produit des messages, à partir des événements d'une caravane. Les gestionnaires (`caravan.transfer-result`, `caravan.resolve`) ne sont remis que par le distributeur, et aucune route ne les expose. | Conforme |
| C12 | Les données personnelles de la Caravane sont exportées et effacées avec le compte | Test « exporte les caravanes du joueur, et efface son nom à la suppression de son compte » ; tests de `personal-data.test.ts` | Les tests réussissent : l'export de Bob contient la caravane qu'il attend ; après la suppression de son compte, le journal, la liste des caravanes et les destinations ne contiennent plus le nom de son village. | Conforme |
| C14 | Le butin d'une expédition n'est révélé qu'à son retour, et à son seul expéditeur | Test du domaine « ne révèle pas son butin avant son retour » ; test de l'API « part en expédition vers la grotte… » | Les tests réussissent : avant le retour, la vue présente `loot: null` et aucune graine ; Bob reçoit 404 sur l'expédition d'Alice ; le butin n'est versé qu'une fois, et seulement s'il n'est pas vide. Le corps de la requête ne contient que l'escorte, validée par `z.enum`. | Conforme |
| C13 | L'heure de l'attaque n'est connue que du serveur | Lecture de `caravan-service.ts` (`toMessage`) et de `platform.outbox` | Le rappel différé est enregistré dans la boîte d'envoi avec une date de disponibilité égale à l'heure de l'issue : un administrateur de la base pourrait en déduire l'issue. Aucune route ne l'expose aux joueurs. | Risque accepté |

## Synthèse

Sur quatorze exigences : douze sont conformes, deux sont en risque accepté (C4 et C13), aucune
n'est non conforme.

Les deux risques acceptés ne permettent à aucun joueur de créer des ressources ni de
connaître l'issue d'un voyage avant son heure : C4 laisse au plus quelques caravanes de
trop à un joueur qui enverrait plusieurs requêtes à la même milliseconde, et C13 ne concerne
que les personnes qui ont accès à la base.

Actions décidées :

- rembourser DT-016 en vérifiant la limite dans la transaction d'envoi (verrou sur un flux
  propre à l'expéditeur, ou contrainte en base), avant toute ouverture à des joueurs réels ;
- appliquer à toute future mission de caravane le même examen que celui des expéditions
  (C14) : graine absente des vues, issue révélée à son heure, versement appliqué une fois ;
- ne jamais ajouter de route qui accepte une heure ou une issue fournie par le client.
