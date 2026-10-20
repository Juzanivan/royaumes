# Revue de sécurité du Marché : intégrité des échanges

- Date : 2026-10-20
- Périmètre : API du module Marché, gestionnaires de messages du Village et du Marché, boîte d'envoi et sa route de distribution, canal temps réel du Marché.
- Références : OWASP Top 10 (A01 Broken Access Control, A04 Insecure Design, A08 Software and Data Integrity Failures).

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| M1 | Un joueur ne publie, n'accepte et ne retire une offre qu'en son propre nom | Lecture de `api.ts` : aucune route n'accepte d'identifiant de joueur | Dans `src/modules/market/api.ts`, les cinq routes lisent le joueur dans `c.var.userId` et `c.var.userName`, renseignés par `requireUser` ; le corps de la publication ne contient que `give` et `want` (`PublishOfferInput`), et les autres routes n'ont pas de corps. | Conforme |
| M2 | Seul le vendeur peut retirer son offre et récupérer les ressources en séquestre | Test « restitue les ressources au vendeur qui retire son offre » | Le test réussit : le retrait demandé par Bob est refusé (403, `NOT_SELLER`), celui d'Alice retire l'offre et lui restitue ses 60 bois. La restitution est versée au vendeur enregistré dans l'offre, et non au joueur qui fait la requête. Vérifié aussi dans le navigateur : après le retrait de l'offre « 10 bois contre 500 pierre », le bois d'Alice a augmenté de 10. | Conforme |
| M3 | Un joueur ne peut pas accepter sa propre offre | Tests « refuse l'acceptation de sa propre offre... » et « restitue les ressources au vendeur... » | Les tests réussissent : le domaine produit l'erreur `OWN_OFFER`, et l'API répond 409 lorsque Alice accepte sa propre offre. | Conforme |
| M4 | Aucun échange ne crée ni ne détruit de ressources, y compris lors d'acceptations simultanées | Test « ne conclut l'échange qu'avec un seul acheteur, lors de deux acceptations simultanées » | Le test réussit : un seul acheteur l'emporte, le second reçoit `NOT_OPEN`, et les trois villages totalisent toujours 300 bois et 150 pierre. Le test « réalise l'échange complet, sans créer ni perdre de ressource » le vérifie aussi pour un échange simple. | Conforme |
| M5 | Un message remis plusieurs fois n'a d'effet qu'une fois | Test « n'a qu'un effet, et ne répond qu'une fois, lorsqu'un message est remis deux fois » ; test « ignore une réponse en double... » | Les deux tests réussissent : côté Village, un prélèvement remis deux fois ne prélève qu'une fois et n'enregistre qu'une réponse (registre `transfers`) ; côté Marché, une réponse en double ou d'une étape dépassée ne produit aucun événement. Les identifiants des mouvements (`<offre>:reserve`, `<offre>:pay-<n>`, `<offre>:refund`) sont construits par le domaine du Marché, et non par la requête. | Conforme |
| M6 | Les quantités échangées sont des entiers strictement positifs, à l'entrée de l'API comme à la réception d'un message | Publication d'une offre de -50 bois ; schéma `ResourceAmounts` | Requête envoyée depuis la console d'un joueur connecté : réponse 400 `INVALID_INPUT`, et le stock du village n'a pas changé. Le schéma `ResourceAmounts` (`src/modules/realm/contracts.ts`) impose `z.number().int().positive()`, au moins une ressource et aucune autre clé ; il valide le corps de la publication (`PublishOfferInput`) et le contenu de chaque message reçu par le Village (`TransferRequest`). | Conforme |
| M7 | Aucun joueur ne peut provoquer un mouvement de ressources dans un village autrement que par une offre | Lecture des routes de l'API : aucune n'enregistre de message dans la boîte d'envoi | Les routes du Village (`src/modules/realm/api.ts`) appellent `service.execute`, qui enregistre les événements sans message. Seule `service.transfer` déclenche un mouvement ; elle n'est appelée que par les gestionnaires de `messages.ts`, que la racine de composition confie au distributeur, et aucune route ne les expose. Côté Marché, les messages ne sont produits que par `requestsFor`, à partir des événements de l'offre. | Conforme |
| M8 | La route de distribution planifiée n'est accessible qu'avec le secret, absent du dépôt | Test « refuse une requête sans le secret attendu, et reste fermée sans secret configuré (401) » ; `git grep -n CRON_SECRET` | Le test réussit, et la route des tâches quotidiennes (`/api/cron/daily`, qui a remplacé `/api/outbox/dispatch` au TD10) répond `UNAUTHORIZED` en local, où aucun secret n'est configuré. `git grep -n CRON_SECRET` ne renvoie que des mentions sans valeur : `.env.example` (`CRON_SECRET=`), `server.ts`, le commentaire de `cron-api.ts`, le README, le document d'architecture, l'ADR 0007, et le secret de test `secret-de-test` de `testing.ts`, qui ne sert qu'aux tests. La route compare l'en-tête à `Bearer <secret>` par une égalité simple, et non en temps constant : l'écart est négligeable pour un secret aléatoire de 32 octets transmis par HTTPS. | Conforme |
| M9 | Le canal du Marché ne transmet aucune donnée d'événement | Route de repli `/api/stream/market/events?after=0` | Requête envoyée depuis la console après les échanges de la vérification 4.4 : tous les événements (`OfferPublished`, `OfferOpened`, `OfferAccepted`, `TradeCompleted`, ...) ont un champ `data` vide. La règle du canal est discrète (`redact: true`, dans `src/modules/market/index.ts`). | Conforme |
| M10 | Les ressources manquantes lors d'un paiement refusé ne sont connues que de l'acheteur concerné | Consultation de l'offre par le vendeur après un paiement refusé | Après le paiement refusé de Bob pour l'offre « 10 bois contre 500 pierre », la route `/api/market/offers/<identifiant>` renvoie `missing: null` à Alice, et `missing: { stone: 479 }` à Bob. `view.ts` ne remplit ce champ que si le joueur est l'acheteur dont le paiement a été refusé. | Conforme |

## Synthèse

Sur dix exigences : dix sont conformes, aucune n'est non conforme ni en risque accepté.

La revue fait apparaître une limite qui ne relève d'aucune exigence : un message abandonné
après dix tentatives reste dans la boîte d'envoi, et la route de distribution se contente
de les compter. Une offre dont un message est abandonné reste bloquée, ses ressources en
séquestre, sans création ni perte de ressource. Cette limite est consignée dans la dette
DT-007.

Actions décidées :

- rembourser la dette DT-007 : lister les messages abandonnés avec leur dernière erreur, et
  permettre de les relancer, ce qui demande de définir qui y est autorisé ;
- surveiller dans les journaux de Vercel le nombre de messages abandonnés renvoyé par la
  tâche planifiée quotidienne ;
- appliquer à tout futur gestionnaire de messages le même examen : validation du contenu,
  clé d'idempotence choisie par le demandeur, test de la remise en double ;
- n'ajouter aucune route qui enregistre un message de mouvement de ressources sans passer
  par le domaine d'un module.
