# Revue de sécurité du parcours d'authentification

- Date : 2026-10-19
- Périmètre : inscription, connexion, déconnexion, sessions, accès à l'API et aux pages du jeu.
- Références : OWASP Top 10, OWASP ASVS.

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| S1 | Les mots de passe ne sont conservés que sous forme d'empreinte, par une fonction dédiée | Test « ne conserve qu'une empreinte du mot de passe » ; documentation de Better Auth | Le test réussit : la colonne `identity.account.password` est renseignée et ne contient pas le mot de passe. Better Auth hache les mots de passe avec scrypt. | Conforme |
| S2 | Les mots de passe comportent au moins 8 caractères | Test « refuse un mot de passe trop court » | Le test réussit : une inscription avec un mot de passe de 5 caractères est refusée (400). Option `minPasswordLength: 8` dans `better-auth.ts` ; le formulaire impose aussi `minLength={8}`, à titre de confort. | Conforme |
| S3 | Les tentatives répétées d'inscription et de connexion sont limitées | Sous-partie 2.3 ; configuration de `better-auth.ts` | `rateLimit` est activé, avec 40 inscriptions et 60 connexions par minute et par adresse IP ; la désactivation par `AUTH_RATE_LIMIT=off` est neutralisée sur Vercel. Les compteurs sont conservés dans la mémoire de chaque instance : voir la dette DT-004. | Conforme |
| S4 | Le cookie de session est inaccessible au JavaScript de la page | Test sur l'attribut `HttpOnly` | Le test réussit ; l'en-tête observé avec curl est `better-auth.session_token=... ; Path=/; HttpOnly; SameSite=Lax`. | Conforme |
| S5 | Le cookie de session n'est pas envoyé par les requêtes émises depuis un autre site | Test sur l'attribut `SameSite` | Le test réussit : le cookie porte `SameSite=Lax`, il n'est donc pas joint aux requêtes `POST` émises depuis un autre site. | Conforme |
| S6 | Le cookie de session ne circule que sur des connexions chiffrées | Inspection du cookie dans le navigateur ; comportement en local et en production | En local, sur `http://localhost`, le cookie ne porte pas l'attribut `Secure`, puisque la connexion n'est pas chiffrée. Better Auth l'ajoute lorsque l'application est servie en HTTPS : l'exigence ne pourra être vérifiée qu'après le déploiement du TD5. | À vérifier en production (TD5) |
| S7 | Le secret de signature n'est pas versionné, et son absence en production empêche le démarrage | `git grep BETTER_AUTH_SECRET` ; fonction `resolveSecret` | `git grep` ne trouve que le nom de la variable, dans `.env.example` (valeur vide) et dans `better-auth.ts`. `resolveSecret` lève une erreur si la variable est absente avec `NODE_ENV=production` sur Vercel. `.env.local` est ignoré par Git. | Conforme |
| S8 | La connexion ne révèle pas si une adresse est inscrite | Test « répond de la même manière que l'adresse existe ou non » | Le test réussit : même code (401) et même corps (`INVALID_EMAIL_OR_PASSWORD`) pour une adresse inscrite avec un mauvais mot de passe et pour une adresse inconnue. | Conforme |
| S9 | L'inscription ne révèle pas si une adresse est inscrite | Création d'un compte avec une adresse déjà utilisée | La page affiche « Cette adresse est déjà utilisée. » : l'inscription révèle l'existence d'un compte. Risque accepté : l'utilisateur doit savoir qu'il ne peut pas utiliser cette adresse, le jeu ne conserve aucune donnée sensible et n'envoie aucun courrier électronique, qui permettrait de répondre de la même manière dans tous les cas. | Risque accepté |
| S10 | Toute route de l'API réservée aux joueurs refuse une requête anonyme | Tests « Contrôle d'accès à l'API du Village » ; racine de composition | Les tests réussissent : lecture et commande anonymes refusées (401), sans rien enregistrer. La protection est déclarée module par module dans `create-api.ts` (`app.use('/realm/*', requireUser(auth))`) : l'oubli de cette ligne pour un nouveau module laisserait ses routes ouvertes. Ce risque est maîtrisé en accompagnant chaque module protégé d'un test de contrôle d'accès. | Conforme |
| S11 | Un joueur ne peut accéder qu'à ses propres données | Test « isole les villages des joueurs » ; origine de `userId` dans les routes | Le test réussit. Les routes du Village lisent l'identifiant dans `c.var.userId`, renseigné par `requireUser` à partir de la session ; aucune route n'accepte d'identifiant de joueur dans l'adresse ou dans le corps. | Conforme |
| S12 | Les pages du jeu sont protégées sur le serveur, avant tout rendu | Mise en page `app/(jeu)/layout.tsx` ; accès à `/village` sans session | La mise en page du groupe `(jeu)` vérifie la session et appelle `redirect('/login')` avant tout rendu ; elle est déclarée dynamique. Sans session, `/village` redirige vers `/login` (vérifié dans le navigateur). | Conforme |
| S13 | Les erreurs imprévues ne révèlent aucun détail technique au client | Gestionnaire `onError` de la racine de composition | `onError` consigne l'erreur dans les journaux du serveur et renvoie seulement `{ error: { code: 'INTERNAL', message: 'Erreur interne' } }` avec le code 500. Les messages de Better Auth ne sont pas affichés tels quels : la page de connexion les traduit à partir de leur code. | Conforme |
| S14 | La déconnexion invalide la session sur le serveur | Réutilisation d'un cookie après déconnexion | Après `POST /api/auth/sign-out` avec l'origine de l'application (`{"success":true}`), le même cookie, réutilisé, reçoit une erreur 401 `UNAUTHENTICATED` : la session n'existe plus en base. | Conforme |
| S15 | Une requête d'authentification accompagnée d'un cookie et émise depuis une autre origine est refusée | Appel de la déconnexion avec un en-tête `origin` étranger | Avec `origin: http://site-malveillant.example`, la déconnexion est refusée (`INVALID_ORIGIN`) ; sans en-tête `origin`, elle l'est aussi (`MISSING_OR_NULL_ORIGIN`). La session reste valide après ces deux tentatives. | Conforme |
| S16 | Un flux temps réel n'est accessible qu'aux joueurs connectés, et seulement pour les canaux auxquels ils ont droit | Tests « réserve le temps réel aux joueurs connectés (401) », « refuse l'écoute du village d'un autre joueur (403) » et « refuse un canal qu'aucune règle ne couvre (403) » ; principe de l'accès fermé par défaut dans `channel-policy.ts` | Un visiteur anonyme reçoit une erreur 401, un joueur qui tente d'écouter le village d'un autre joueur une erreur 403. Un canal sans règle est refusé : l'oubli d'une règle par un module futur rend ses canaux inaccessibles, et non publics. | Conforme |

## Synthèse

Sur seize exigences : quatorze sont conformes, une est en risque accepté (S9, justifiée
ci-dessus), et une reste à vérifier en production (S6). Aucune exigence n'est non conforme.

S16 a été ajoutée au TD5, lorsque le temps réel a ouvert une nouvelle voie d'accès aux
données du jeu.

Actions décidées :

- vérifier S6 sur le déploiement Vercel : le cookie doit se nommer
  `__Secure-better-auth.session_token` et porter l'attribut `Secure` ; la ligne passera
  alors au statut « conforme » ;
- conserver dans le registre de la dette technique le partage imparfait des compteurs de
  la limitation des tentatives entre instances (DT-004) ;
- accompagner chaque futur module protégé d'un test de contrôle d'accès (S10), et chaque
  futur canal temps réel d'une règle d'accès et de son test (S16).
