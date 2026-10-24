# Revue de conformité au RGPD

- Date : 2026-10-20
- Périmètre : données personnelles de l'ensemble du jeu, export et effacement, durées de conservation, journaux techniques.
- Références : RGPD, articles 5, 15, 17, 20, 25 et 30 ; registre des traitements ; ADR 0008.

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| R1 | Chaque emplacement de données personnelles figure au registre des traitements | Comparaison du registre et de l'inventaire de la sous-partie 1.2 du TD10 | Chaque ligne de l'inventaire correspond à un traitement du registre : `identity.user` et `identity.account` (T1), `identity.session` (T2), `platform.events`, `platform.outbox` et les tables de lecture (T3), `tavern.messages` (T4), `tavern.presence` (T5), journaux de Vercel (T7) ; le registre des effacements (T6) s'y ajoute. Une table n'apparaît ni dans l'inventaire ni dans le registre : `identity.verification`, créée pour Better Auth, qui y conserverait l'adresse d'un joueur lors d'une vérification ou d'une réinitialisation par courriel. Aucune fonctionnalité du jeu ne l'utilise, et elle est vide en développement. | Conforme |
| R2 | L'export contient toutes les données du joueur, module par module | Test « exporte les données du joueur, module par module, en un fichier JSON » ; lecture d'un export réel | Le test réussit. Export réel téléchargé depuis la page « Mes données » (fichier `royaumes-mes-donnees.json`) : une section par module (`realm`, `dungeon`, `market`, `ranking`, `tavern`) et la section `identity`, avec le nom, l'adresse électronique, la date d'inscription et les sessions, dont l'adresse IP et le navigateur. | Conforme |
| R3 | L'export ne contient ni les données des autres joueurs, ni les secrets du jeu ou du compte | Test « ne contient ni les données des autres joueurs, ni les secrets du jeu » ; recherche de « password » et « token » dans un export | Le test réussit. Dans l'export réel, les mots « password », « token » et « seed » n'apparaissent pas : `src/platform/auth/personal-data.ts` ne sélectionne ni l'empreinte du mot de passe ni les jetons de session, et le Donjon n'exporte que les participations, sans graine ni nom des autres joueurs. | Conforme |
| R4 | Après la suppression d'un compte, son nom et celui de son village n'apparaissent plus dans aucune table | Suppression d'un compte de test, puis recherche de son nom dans toutes les tables | Compte « Zéphyrine » créé en développement, avec le village « Brumeval », une expédition rejointe par Bob, une offre au Marché et un message dans la Taverne. Après la suppression du compte, le script de recherche n'affiche aucune ligne pour les deux noms. Le même script affiche des lignes pour « Bob » et pour « Joueur effacé », ce qui confirme qu'il fonctionne. Les deux événements de Zéphyrine qui portaient son nom présentent « Joueur effacé », et son événement `VillageFounded` présente « Village effacé ». Bob voit l'expédition et le Classement avec « Joueur effacé ». Script temporaire supprimé, non versionné. | Conforme |
| R5 | L'effacement est tracé, sans conserver de donnée sur le joueur, et peut être relancé | Tests « enregistre l'effacement dans le registre... » et « peut être relancé sans effet supplémentaire » | Les tests réussissent. En développement, `platform.erasures` contient une ligne par compte supprimé, avec seulement l'identifiant de la ligne, la date et le nombre d'événements réécrits (1, puis 3). | Conforme |
| R6 | Les messages de la Taverne ne sont pas conservés plus de trente jours, même sans visite | Tests de la durée de conservation ; compte rendu de la tâche quotidienne dans les journaux de Vercel | Les tests « ne présente plus, et supprime, les messages de plus de trente jours » et « applique la durée de conservation chaque jour, même sans visite de la Taverne » réussissent. En local, avec un secret configuré, `/api/cron/daily` renvoie le compte rendu `{"outbox":{"ok":true,...},"tavern":{"ok":true,"result":{"messages":0,"presence":0}}}`. Le compte rendu de production apparaîtra dans les journaux de Vercel à la première exécution de la tâche. | Conforme |
| R7 | La présence ne constitue aucun historique des visites | Test « considère comme parti un joueur sans signal depuis deux minutes, et supprime sa ligne » | Le test réussit : la lecture directe de la table, en SQL, ne trouve plus la ligne d'Alice. La clé primaire de `tavern.presence` est l'identifiant du joueur, et `touch` met la ligne à jour (`ON CONFLICT DO UPDATE`) : un joueur n'a jamais plus d'une ligne. Vérifié à deux joueurs : Bob disparaît de la liste d'Alice après son départ, et dans les deux minutes et demie qui suivent la fermeture brutale de sa fenêtre. | Conforme |
| R8 | Les sessions expirées ne sont pas conservées indéfiniment | Requête SQL sur `identity.session` : sessions dont `expires_at` est passé | En développement, la requête renvoie 0 sur 1 session, mais aucune session n'a encore pu y atteindre sa date d'expiration (sept jours). La lecture du code de Better Auth (`api/routes/session.mjs`) montre qu'une session expirée n'est supprimée que lorsque le navigateur la présente. Celle d'un joueur qui ne revient jamais, avec son adresse IP et son navigateur, est donc conservée sans limite, jusqu'à la suppression du compte. Aucune tâche ne purge ces sessions. Dette DT-008. | Non conforme |
| R9 | Les journaux techniques ne contiennent pas de données personnelles au-delà du nécessaire | Lecture de `app.onError` dans `create-api.ts` ; consultation des journaux de Vercel | `app.onError` écrit l'erreur complète par `console.error(error)`. Une erreur de Drizzle contient le texte de la requête SQL et ses paramètres : une insertion de message qui échoue écrirait dans les journaux de Vercel le contenu du message, l'identifiant et le nom de son auteur. Ces données ne sont pas nécessaires au diagnostic. La réponse envoyée au navigateur ne contient en revanche aucun détail. Les journaux d'exécution ne sont conservés qu'une heure sur l'offre Hobby, ce qui limite l'exposition sans la supprimer. Dette DT-009. | Non conforme |
| R10 | Après la suppression d'un compte, l'identifiant conservé ne peut plus être relié à une personne | Recherche de l'identifiant dans `identity`, `platform.outbox` et les journaux de Vercel | Après la suppression, l'identifiant n'apparaît plus dans `identity` : `user` est supprimé, `session` et `account` le sont en cascade. Dans `platform.outbox`, il n'apparaît qu'avec des quantités de ressources, sans nom. Les journaux de Vercel associent en revanche l'adresse des flux (`/api/stream/village-<identifiant>`) à l'adresse IP de la requête : l'hébergeur conserve ce lien pendant la durée de ses journaux, une heure sur l'offre Hobby. Passé ce délai, plus aucune donnée ne relie l'identifiant à une personne. Risque accepté, à réexaminer si la durée des journaux augmente (offre Pro, journaux exportés). | Risque accepté |

## Synthèse

Sur dix exigences : sept sont conformes, deux sont non conformes (R8 et R9), et une est en
risque accepté (R10).

La revue fait aussi apparaître deux constats qui ne relèvent d'aucune exigence de la
grille :

- les sessions conservent l'adresse IP et le navigateur de chaque connexion, alors
  qu'aucune fonctionnalité ne les utilise : la limitation des tentatives de connexion lit
  l'adresse IP dans la requête, et non dans la session. C'est un écart au principe de
  minimisation, déjà relevé dans l'inventaire de la sous-partie 1.2 du TD10 (dette DT-010) ;
- l'effacement ne retire pas les offres ouvertes du joueur effacé : une offre de
  « Joueur effacé » reste proposée, ses ressources en séquestre, et un autre joueur peut
  l'accepter, au profit d'un village dont plus personne ne dispose. Aucune donnée
  personnelle n'est concernée, mais l'effet est contraire à l'intention du joueur
  (dette DT-011).

Le registre des traitements relève en outre que le DPA de Vercel ne couvre pas l'offre
gratuite Hobby, et que le droit de rectification n'est pas mis en œuvre.

Actions décidées :

- purger chaque jour les sessions expirées, par une tâche de la route des tâches
  quotidiennes (DT-008) ;
- ne journaliser que le nom et le code des erreurs, sans leurs paramètres (DT-009) ;
- désactiver l'enregistrement de l'adresse IP et du navigateur dans les sessions, puis
  mettre à jour le registre des traitements (DT-010) ;
- retirer les offres ouvertes d'un joueur lors de l'effacement de ses données (DT-011) ;
- passer à l'offre Pro de Vercel, et accepter son DPA, avant toute mise en service auprès de
  joueurs réels ;
- mettre en œuvre le droit de rectification du nom d'un joueur (fait à l'évaluation finale :
  `PATCH /api/account/name`, dette DT-015 remboursée).
