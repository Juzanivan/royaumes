# Rendu de l'évaluation

- Auteur : Jules Zanivan (`Juzanivan`)
- Module : `caravan` (la Caravane)
- Adresse du déploiement : https://royaumes-chi.vercel.app
- Fiche de cadrage : [fiche-cadrage.md](fiche-cadrage.md)

Depuis le relais des caravanes, un bâtiment de la carte du village, le joueur envoie une
cargaison au village d'un autre joueur, avec ou sans escorte. Des brigands pilotés par
l'ordinateur peuvent l'attaquer en chemin. Il peut aussi envoyer une caravane en expédition
vers la grotte, d'où elle rapporte un butin. Chaque voyage se suit sur une vue de profil
animée.

## Exigences minimales

| N° | Fichiers principaux | Tests qui la vérifient |
| --- | --- | --- |
| E1 | `src/modules/caravan/` : `domain/` (decider, brigands, grotte, saga, vue), `application/` (service et ports), `infrastructure/` (schéma, projection, lecteur, dépôt), `api.ts`, `messages.ts`, `personal-data.ts`, et les entrées publiques `index.ts`, `contracts.ts` et `ui.tsx` | `pnpm lint:archi` (règles `module-encapsulation`, `outside-uses-public-entries`, `pure-domain`) |
| E2 | `src/bootstrap/create-api.ts` (contributeur, gestionnaires, règle du canal, `requireUser`, route `/caravans`) ; pages `app/(jeu)/caravan/page.tsx` et `app/(jeu)/caravan/[id]/page.tsx` ; entrée `caravan` de `src/ui/destinations.ts` et relais sur la carte (`src/modules/realm/village-map/landmarks/relay.tsx`) | `src/bootstrap/caravan-api.test.ts` ; `e2e/caravan.spec.ts` (accès au relais depuis la carte) |
| E3 | `src/modules/caravan/domain/caravan.ts`, `rules.ts`, `brigands.ts`, `cave.ts`, `saga.ts`, `view.ts`, `random.ts` : fonctions pures, sans aucune importation hors de `domain/` | `domain/caravan.test.ts`, `domain/brigands.test.ts`, `domain/cave.test.ts`, `domain/expedition.test.ts` ; règle `pure-domain` |
| E4 | Journal d'événements, modèle decider, flux `caravan-<id>` (`infrastructure/event-store-caravan-repository.ts`, concurrence optimiste et `withOptimisticRetry` dans `application/caravan-service.ts`) ; modèle de lecture dans le schéma `caravan` (`infrastructure/schema.ts`), créé par `drizzle/0013_caravane.sql` ; ADR 0010 | « n'applique l'issue qu'une fois, malgré les constats répétés et les messages en double » ; tests de l'API ; fonction d'aptitude « range chaque table dans le schéma… » |
| E5 | `create-api.ts` (`requireUser` sur `/caravans` et `/caravans/*`) ; `api.ts` (expéditeur lu dans la session, jamais dans le corps) ; `contracts.ts` (`SendCaravanInput`, `SendExpeditionInput`, validés par `validateJson`) ; règle du canal dans `index.ts` | « refuse une requête anonyme (401) », « valide le corps de la requête (400) », « présente la caravane à l'expéditeur et au destinataire, et à eux seuls » (404 et 403 pour Carol), expédition réservée à son expéditeur (404) |
| E6 | Saga avec le **Village** par la boîte d'envoi : sujets publiés `realm.withdraw` et `realm.deposit`, réponse sur `caravan.transfer-result`, rappel `caravan.resolve` (`messages.ts`, `domain/saga.ts`) ; lecture du langage publié du Village (`VillageFounded`) pour les destinations ; le **Classement** lit le langage publié de la Caravane (`src/modules/ranking/infrastructure/ranking-projection.ts`, version 3) ; ADR 0011 | « fait partir la caravane, et prélève sa cargaison… », « livre toute la cargaison… » (contrôle du Classement), « rend à l'expéditeur… », « constate l'issue par le rappel différé… » ; `ranking-projection.test.ts` |
| E7 | `src/modules/caravan/personal-data.ts` : export par la vue (sans la graine), réécriture de `CaravanSent` et `ExpeditionSent`, effacement des tables de la projection ; ligne T8 de `docs/rgpd/registre-traitements.md` | `personal-data.test.ts` (3 tests) ; « exporte les caravanes du joueur, et efface son nom à la suppression de son compte » ; fonction d'aptitude « déclare les données personnelles de chaque module… » |
| E8 | Correspondance des 17 règles de la fiche et des tests : règles 1 à 3 et 6 → `describe("l'envoi")` ; 4 à 6 → `describe('le chargement')` ; 7 à 11 → `describe("l'issue du voyage")` et `brigands.test.ts` ; 7 et 12 → `describe('la vue')` ; 13 à 17 → `expedition.test.ts` et `cave.test.ts`. Chacune des cinq routes a son test dans `caravan-api.test.ts` | 49 tests propres au module : 36 dans le module (`caravan.test.ts`, `brigands.test.ts`, `cave.test.ts`, `expedition.test.ts`, `personal-data.test.ts`) et 13 de l'API (`caravan-api.test.ts`) |
| E9 | `.dependency-cruiser.cjs` et `src/bootstrap/architecture.test.ts` : aucune règle existante modifiée ou affaiblie ; une règle et une fonction d'aptitude ajoutées (B8) | `pnpm lint:archi` : aucune violation (314 modules) ; `architecture.test.ts` : 3 tests réussis |
| E10 | Migrations `drizzle/0013_caravane.sql` et `drizzle/0014_classement_caravanes.sql`, appliquées par `pnpm vercel-build` (`pnpm db:migrate`) ; déploiement https://royaumes-chi.vercel.app | Vérification manuelle en production, décrite plus bas |

### Vérification en production (E10)

Après le déploiement « Ready » du dernier commit :

1. Deux comptes de test, Alice et Bob, fondent chacun un village. Alice envoie une caravane
   à Bob, la suit sur sa vue de profil, et Bob la voit arriver dans sa liste. Après la
   livraison, le Classement compte la caravane d'Alice.
2. Alice part en expédition vers la grotte, et reçoit son butin au retour.
3. Les modules existants fonctionnent toujours : fondation d'un village, expédition du
   Donjon, échange au Marché, message dans la Taverne.
4. Le compte d'Alice télécharge ses données, qui contiennent ses caravanes (section
   `caravan`), puis il est supprimé.
5. Les tests de bout en bout passent contre la production :
   `E2E_BASE_URL=https://royaumes-chi.vercel.app pnpm test:e2e`.

## Bonus revendiqués

| N° | Description | Fichiers | Tests | Documentation |
| --- | --- | --- | --- | --- |
| B1 | Canal temps réel propre au module, `caravan-<id>`, discret (`redact: true`), réservé à l'expéditeur et au destinataire | `src/modules/caravan/index.ts` (règle d'accès), `ui.tsx` (`useChannel` dans la vue de profil) | « présente la caravane à l'expéditeur et au destinataire, et à eux seuls » (403 pour Carol, flux sans graine) | ADR 0011 ; revue C5 et C6 |
| B2 | Échéance gérée sans tâche de fond : l'arrivée, l'attaque ou le retour de la grotte sont constatés à la première lecture qui dépasse leur heure (`Resolve`), et à défaut par un rappel différé de la boîte d'envoi (`ResolveDue`, qui échoue avant l'heure pour être retenté) | `domain/caravan.ts` (`outcomeOf`, `resolve`), `application/caravan-service.ts` (`resolveFor`, `toMessage` avec `delayMs`) | « livre toute la cargaison… à la première lecture après l'arrivée », « constate l'issue par le rappel différé, même si aucun joueur ne consulte la caravane », « revient deux minutes après son départ… » | ADR 0012 |
| B3 | Personnages pilotés par l'ordinateur, IA déterministe et testée : les brigands (taille de la bande, décision d'attaquer selon l'escorte et la valeur de la cargaison, moment de l'attaque), et la fouille de la grotte | `domain/brigands.ts`, `domain/cave.ts`, `domain/random.ts` | `brigands.test.ts` (6 tests, dont la concordance entre le risque affiché et la fréquence observée sur 2 000 graines), `cave.test.ts` (4 tests) | ADR 0012, ADR 0013 ; fiche, règles 7 et 15 |
| B4 | Modèle de lecture tenu par une projection, avec son point de reprise et sa version (`caravans`, version 2) : liste des caravanes et des destinations | `infrastructure/caravans-projection.ts`, `infrastructure/drizzle-caravans-reader.ts`, `infrastructure/schema.ts`, `drizzle/0013_caravane.sql` | Tests de l'API (listes, limite de trois caravanes, destinations) | ADR 0010 |
| B5 | Saga avec étape compensable entre la Caravane et le Village : prélèvement au départ, puis versement au destinataire, ou restitution à l'expéditeur de ce que les brigands ont laissé (compensation) ; annulation sans prélèvement si le village ne peut pas payer | `domain/saga.ts`, `domain/caravan.ts` (`recordTransferResult`), `application/caravan-service.ts`, `messages.ts` | « rend à l'expéditeur ce que les brigands ont laissé… », « annule la caravane si l'expéditeur ne peut pas payer l'escorte, sans rien prélever », « n'applique l'issue qu'une fois… » | ADR 0011 ; diagramme de séquence de `docs/architecture.md` |
| B6 | Communication avec deux modules existants : le Village (saga et langage publié) et le Classement (colonne « Caravanes » qui lit le langage publié de la Caravane) | `domain/saga.ts`, `infrastructure/caravans-projection.ts`, `src/modules/ranking/infrastructure/ranking-projection.ts` (version 3), `drizzle/0014_classement_caravanes.sql`, `src/modules/ranking/ui.tsx` | `ranking-projection.test.ts`, `ranking-api.test.ts`, « livre toute la cargaison… » (contrôle de `/api/ranking/players`) | ADR 0011 ; `docs/architecture.md` |
| B8 | Règle de dependency-cruiser et fonction d'aptitude qui protègent le secret de l'issue d'un voyage : l'interface n'importe aucun code qui tire l'issue d'une graine (`caravan-ui-without-outcome`), et la graine ne sort ni du domaine ni du journal | `.dependency-cruiser.cjs`, `src/bootstrap/architecture.test.ts` | `pnpm lint:archi` ; « ne fait sortir la graine d'une caravane ni du domaine, ni du journal » | ADR 0012 ; revue C6 |
| B9 | Effet « WHOUAAA » : la caravane quitte la carte du village et y rentre ; vue de profil en parallaxe (forêt, collines, ciel du jour ou de la nuit) avec la barre de progression, l'attaque animée des brigands et le demi-tour ; expédition jusqu'à l'entrée de la grotte, où l'escorte entre et où ses lanternes s'animent ; jauge du risque au relais ; décors immersifs de tous les lieux et crieur public | `src/modules/caravan/journey/`, `ui.tsx`, `expedition.tsx`, `src/modules/realm/village-map/scenery/travellers.tsx`, `src/ui/places/`, `app/globals.css`, `app/game-ui.css` | `e2e/caravan.spec.ts` | Fiche de cadrage, « L'idée » |
| B10 | Tests de bout en bout de l'interface, avec Playwright : envoi d'une caravane à deux joueurs et vue de profil des deux côtés ; départ d'une expédition. Exécutés par `pnpm test:e2e`, contre l'application construite en mode production, hors de `pnpm verify`, parce qu'ils demandent une application démarrée et un navigateur | `playwright.config.ts`, `e2e/caravan.spec.ts` | 2 tests, réussis en local (25 s, construction comprise) | README, section « Commandes » ; bilan technique, risque 3 |

Le total dépasse le plafond de 5 points : les bonus sont classés par ordre de solidité.

## Écarts avec la fiche de cadrage

- **Ajout, après la validation de la fiche :** les expéditions vers la grotte. La fiche a été
  complétée par les règles 13 à 17 et la route `POST /api/caravans/expeditions`. Le choix de
  modélisation est consigné dans l'ADR 0013. Elles réutilisent la saga, le flux et le canal
  de la caravane, sans migration.
- **Réalisé autrement :** le risque d'attaque est affiché au joueur avant le départ, par la
  jauge du relais. La fiche annonçait seulement que le risque augmente avec la valeur de la
  cargaison et diminue avec l'escorte. La jauge présente la probabilité exacte de la règle
  (`attackChance`), sans rien révéler de l'issue.
- **Limite connue :** la limite de trois caravanes en route (règle 3) est vérifiée hors de la
  transaction d'envoi. Deux envois simultanés peuvent la dépasser. C'est la dette DT-016, en
  risque accepté dans la revue C4.

Aucune règle annoncée n'a été abandonnée.

## Indicateurs au rendu

| Indicateur | À l'étiquette `td11-fin` | Au rendu |
| --- | --- | --- |
| Nombre de tests | 232 (33 fichiers) | 294 (44 fichiers), et 2 tests de bout en bout |
| Couverture des lignes | 75 % ; domaines 99,7 % | 51 % au total, 90 % hors interface ; domaines 99,8 % ; serveur de la Caravane 97 %. La baisse vient de l'interface, passée d'environ 300 à 1 400 lignes mesurées, et non d'une perte de tests |
| Violations des règles d'architecture | 0 | 0 (9 règles de dépendance, 3 fonctions d'aptitude) |

## Usage de l'IA générative

**Outil :** Claude (Anthropic), utilisé comme assistant de développement dans une session
reliée au dépôt. Les commits sont faits par l'auteur, après relecture des changements.

**Nature de la contribution :**

- **Code :** Claude a rédigé l'essentiel :
  - du module : domaine, service, infrastructure, API ;
  - des scènes SVG animées ;
  - des décors des lieux ;
  - des évolutions de la carte du village.

  L'auteur a choisi l'idée et les mécanismes : escorte, vue de profil, jauge de risque,
  expédition vers la grotte, crieur public. Il a demandé les corrections d'ergonomie après
  ses essais (emplacement de la Taverne, croix de sortie sur mobile, indicateurs
  d'amélioration).
- **Tests :** Claude a écrit les tests du domaine, de l'API et de bout en bout, à partir des
  règles de la fiche.
- **Documents :** Claude a rédigé la fiche de cadrage, les ADR 0010 à 0013, la revue de
  sécurité de la Caravane et les mises à jour de l'architecture, du README, du registre des
  traitements, du registre de la dette et du bilan technique. L'auteur les a relus et validés
  avant chaque commit.

**Vérification :**

- `pnpm verify` exécuté avant chaque livraison : lint, types, règles d'architecture, tests.
- Captures d'écran et parcours automatisés dans un navigateur (Playwright) pour chaque écran.
- Simulation statistique de l'IA des brigands et de la grotte sur 2 000 graines.
- Essais manuels de l'auteur, en local et sur le déploiement de production, y compris sur
  mobile.
- Chaque valeur des indicateurs provient d'une commande exécutée sur l'état rendu.
