# Bilan technique de Royaumes

- Date : 2026-10-23
- Version examinée : état préparé pour l'étiquette `eval-fin` (comparé à `td11-fin`)
- Auteur : Juzanivan, avec l'aide de Claude (Anthropic)

Ce bilan dresse l'état technique du projet au terme de son développement, à partir de ses
décisions d'architecture, de ses indicateurs de qualité, de sa dette technique et de ses
revues. Il s'adresse à la personne qui reprendrait le projet.

## 1. Le système livré

| Élément | Valeur |
| --- | --- |
| Modules métier | 7 : `realm`, `dungeon`, `market`, `ranking`, `tavern`, `system`, et `caravan` (évaluation finale) |
| Briques de la plateforme | 9 : `auth`, `cron`, `db`, `event-store`, `http`, `outbox`, `privacy`, `projection`, `realtime` ; et un service extrait, `src/services/village` (82 lignes) |
| Lignes de code, hors tests | 17 357 (`src` et `app`), contre 8 266 à `td11-fin` : l'essentiel de la hausse vient de l'interface de jeu (scènes, carte du village, voyage de la caravane) |
| Fichiers de test, nombre de tests | 44 fichiers, 294 tests (33 fichiers et 232 tests à `td11-fin`) |
| Commits | 79 à l'étiquette `td11-fin` ; voir `git rev-list --count eval-fin` |
| Hébergement | Vercel (Francfort), base Neon (Francfort) |

| Module | Stockage | Lignes, hors tests |
| --- | --- | --- |
| `realm` | Event Sourcing | 1 093, dont 149 pour le module distant (`remote.ts`) |
| `dungeon` | Event Sourcing, projection des expéditions ouvertes | 2 064 |
| `market` | Event Sourcing, projection des offres, saga | 1 273 |
| `ranking` | Projection du journal | 459 |
| `tavern` | Tables ordinaires | 678 |
| `system` | Aucun | 73 |
| `caravan` | Event Sourcing, projection des caravanes, saga avec le Village | 3 395, dont 1 000 environ pour les scènes du voyage et de l'expédition (`journey/`) |

Les valeurs proviennent des commandes de la sous-partie 5.2 du TD11, exécutées sur l'état
final du projet, le 2026-10-23.

## 2. Les décisions d'architecture

| ADR | Décision | Mise à l'épreuve | Bilan |
| --- | --- | --- | --- |
| 0001 | Monolithe modulaire | Extraction du Village (TD11) | A tenu. Le reste du code n'importait du Village que ses contrats, et le service reprend le module sans modification. Le prix : un module distant de 149 lignes et deux dépendances cachées (Classement, canal temps réel), traitées par un relais. |
| 0002 | Event Sourcing pour le Village | Projections du Classement (TD8), saga du Marché (TD9), effacement (TD10), relais (TD11) | A tenu, et a rendu possibles les projections et le relais sans modifier le Village. Le prix : l'exception de la réécriture ciblée (ADR 0008), et une relecture complète du flux à chaque commande, dont le test de charge ne montre pas encore le coût (Village : p99 de 128 ms). |
| 0003 | Server-Sent Events alimentés par le journal | Canaux discrets (TD6), globaux (TD8), à source propre (TD10) | A tenu : trois sortes de canaux ajoutées sans changer la boucle de diffusion. Le coût, une lecture périodique du journal par joueur connecté, n'a jamais été mesuré sous charge (risque 1). |
| 0004 | Manches simultanées et échéances paresseuses | Échéance d'exploration (TD7), présence de la Taverne (TD10), conservation des messages (TD10) | A tenu, et le principe a été réutilisé hors du Donjon. Une échéance n'est appliquée qu'à une lecture : la tâche quotidienne du TD10 a dû s'y ajouter pour la conservation. |
| 0005 | Intelligence artificielle déterministe | Simulation statistique (TD7), revue D12 | A tenu : les résultats de la simulation sont reproductibles, et l'IA ne transmet aucune information secrète (D12 conforme). |
| 0006 | CQRS et projections rattrapées à la lecture | Test de charge (TD11) | A tenu, après une correction consignée. La mesure a montré que chaque lecture ouvrait une transaction verrouillée même sans rien à rattraper ; le chemin rapide a porté le débit des expéditions ouvertes de 130 à 187 requêtes par seconde (`perf/avant.json`, `perf/apres.json`), sans changer les garanties. |
| 0007 | Saga orchestrée et boîte d'envoi | Acceptations simultanées (TD9), panne partielle du service Village (TD11) | A tenu. La saga a repris sans une ligne de code après une panne du service (test de contrat « reprise après une panne »). Les lettres mortes, dette DT-007, sont désormais examinées et relancées par `scripts/dead-letters.ts`. |
| 0008 | Taverne sans Event Sourcing, réécriture ciblée du journal | Revue de conformité (TD10), relais du TD11 | A tenu : aucun nom effacé ne subsiste (R4). L'extraction a ajouté une copie relayée à réécrire, prise en charge par `redactVillageEvent`. La revue a relevé quatre écarts hors du périmètre de la décision (DT-008 à DT-011). |
| 0009 | Extraction du Village, préparée mais non déployée | Tests de contrat et démonstration à deux processus (TD11) | Trop récente pour avoir été éprouvée en exploitation. Les six tests de contrat la protègent, mais trois dettes (DT-012 à DT-014) bloquent un déploiement. |
| 0010 | Journal d'événements pour la Caravane | Saga, projection, effacement, Classement (B6) | A tenu : le Classement compte les caravanes livrées en lisant le journal, sans modifier la Caravane (projection v3). Le prix : une seconde projection à reconstruire, et un contributeur de données personnelles de plus. |
| 0011 | Saga compensable avec le Village, langage publié pour le Classement | Tests de l'API (doublons, réponses tardives, accès au canal) | A tenu, en réutilisant sans modification les sujets `realm.withdraw` et `realm.deposit` du Marché. La limite de trois caravanes, lue hors transaction, est consignée (DT-016). |
| 0012 | Issue décidée au départ par une IA déterministe et secrète, constatée sans tâche de fond | Simulation sur 2 000 graines (taux observé contre `attackChance`), revue C6 à C8 | A tenu : la jauge de risque affichée au joueur est la probabilité exacte du domaine, et la graine n'est jamais transmise. Le rappel différé de la boîte d'envoi révèle l'heure de l'issue à qui lit la base (C13, risque accepté). |
| 0013 | Expéditions vers la grotte, mission de la caravane | Tests du domaine et de l'API, revue C14 | A tenu : saga, rappel, canal, limite et effacement réutilisés sans brique nouvelle, ni migration. Le prix : un agrégat qui distingue deux missions. |

## 3. La qualité

| Caractéristique | Indicateur | Valeur | Appréciation |
| --- | --- | --- | --- |
| Adéquation fonctionnelle | Tests réussis ; couverture des domaines | 294 tests réussis ; domaines couverts à 99,8 % des lignes (537 sur 538), dont celui de la Caravane | Satisfaisante. Les règles du jeu sont presque entièrement vérifiées par des fonctions pures, et les parcours par des tests de l'API. |
| Efficacité des performances | Débit et p99 des lectures ; respect du budget | De 133 (Marché) à 222 (Village) requêtes par seconde ; p99 de 128 à 209 ms, sans erreur (`perf/apres.json`) | Satisfaisante en local : le budget (p99 < 500 ms, 20 connexions) est respecté avec une marge de 290 ms. Rien n'est mesuré en production, ni pour les flux temps réel. |
| Fiabilité | Tests de concurrence, de reprise et d'idempotence ; messages abandonnés | Une douzaine de tests de concurrence, d'interruption, de doublon ou de reprise (journal, boîte d'envoi, projections, saga, service Village) ; aucun message abandonné en développement | Satisfaisante. Les accès simultanés, les remises en double et la panne d'un service sont couverts. La tâche quotidienne signale désormais les lettres mortes. |
| Sécurité | Exigences des revues de sécurité | 54 exigences : 48 conformes, 5 en risque accepté, 1 à vérifier en production (S6) | Satisfaisante, sous réserve de S6, en attente depuis le TD5. La limitation des tentatives est partagée entre instances depuis le TD11 (DT-004). |
| Maintenabilité | Règles d'architecture ; fonctions d'aptitude ; couverture | Aucune violation (`pnpm lint:archi`, 314 modules, 904 dépendances) ; 9 règles de dépendance et 3 fonctions d'aptitude, dont une règle et une fonction propres à la Caravane (secret de la graine) ; 51 % des lignes couvertes au total, 90 % hors interface (97 % pour le serveur de la Caravane) | Bonne côté serveur. La baisse de la couverture totale (75 % à `td11-fin`) ne vient pas d'une perte de tests : l'interface est passée de 306 à environ 1 500 lignes mesurées, couvertes à 0,6 %. Les deux tests de bout en bout Playwright (`pnpm test:e2e`) couvrent l'envoi d'une caravane et l'expédition, mais pas les autres écrans. |
| Flexibilité | Extraction d'un module ; changement de base entre local et production | Village exécutable dans le processus ou dans un service, selon deux variables ; PGlite en local, Neon en production | Démontrée par la démonstration à deux processus et par le retour arrière sans migration. |

## 4. La dette technique

| Indicateur | Valeur |
| --- | --- |
| Entrées consignées | 16 (DT-001 à DT-016) |
| Entrées remboursées, dont à l'échéance prévue | 7, toutes à l'échéance prévue (DT-001 à DT-007) |
| Entrées ouvertes | 8 : DT-008 à DT-011 (revue de conformité du TD10), DT-012 à DT-014 (extraction du Village), DT-015 (droit de rectification), DT-016 (limite de trois caravanes vérifiée hors transaction) |

Analyse :

Les sept dettes consignées au fil du développement ont toutes été remboursées au TD prévu.
Chacune avait été signalée dans le code et dans le registre au moment où le raccourci
était pris. Ce résultat témoigne d'un pilotage effectif.

Le bilan fait aussi apparaître deux faiblesses :

- Les quatre dettes de la revue de conformité (DT-008 à DT-011) portaient l'échéance
  « TD11 », et ne sont pas remboursées. Le TD11 a traité les dettes inscrites à son
  programme, mais pas celles ajoutées en cours de route. L'échéance est dépassée, et doit
  être replanifiée explicitement plutôt que laissée en l'état.
- Le droit de rectification, relevé dès le TD10 par le registre des traitements, n'avait
  été inscrit ni dans le registre de la dette ni dans le code. C'est le seul cas d'une
  dette découverte par la relecture du bilan, et non consignée lorsqu'elle est apparue.
  Elle est désormais inscrite (DT-015).

La dette de la Caravane (DT-016) a été consignée dans le code et dans le registre au moment
où le raccourci a été pris, comme les sept premières : la leçon de DT-015 a été appliquée.

Les trois dettes de l'extraction ne concernent qu'un service qui n'est pas en production.
Leur échéance est liée à un événement, le réexamen de l'ADR 0009, et non à une date.

## 5. Les revues

| Revue | Exigences | Conformes | Non conformes ou en risque accepté | Actions ouvertes |
| --- | --- | --- | --- | --- |
| Sécurité de l'authentification | 16 | 14 | S9 en risque accepté ; S6 à vérifier en production | Vérifier le cookie de session en production (S6) |
| Sécurité du Donjon | 14 | 12 | D10 et D14 en risque accepté | Évaluer le rythme des notifications du canal discret ; réexaminer D14 si un identifiant devient suffisant pour agir |
| Sécurité du Marché | 10 | 10 | Aucune | DT-007, remboursée au TD11 |
| Sécurité de la Caravane | 14 | 12 | C4 (DT-016) et C13 en risque accepté | Rembourser DT-016 ; appliquer le même examen à tout nouveau type de voyage |
| Conformité au RGPD | 10 | 7 | R8 et R9 non conformes ; R10 en risque accepté | DT-008 à DT-011, DT-015 ; passer à l'offre Pro de Vercel et accepter son DPA avant toute mise en service auprès de joueurs réels |

Toutes les actions qui portent sur le code figurent au registre de la dette. Trois
actions ouvertes n'y figurent pas, et sont reprises dans les recommandations :

- **S6** : une vérification à mener sur le déploiement, et non un défaut du code.
- **L'accord de traitement de Vercel** : une condition contractuelle de l'hébergement,
  consignée dans le registre des traitements.
- **Le suivi des risques acceptés du Donjon** : des règles de conduite pour les évolutions
  futures, et non des défauts présents.

## 6. Risques et recommandations

| N° | Risque | Signe avant-coureur | Recommandation |
| --- | --- | --- | --- |
| 1 | La charge des flux temps réel croît avec le nombre de joueurs connectés : chaque flux relit le journal deux fois par seconde (ADR 0003), et cette charge n'a jamais été mesurée. | Hausse des connexions actives et du temps de réponse de Neon aux heures de jeu ; flux qui se ferment en erreur ; nombre de joueurs connectés en même temps qui approche la limite de connexions de l'offre Neon. | Ajouter au test de charge un scénario de flux SSE simultanés, et lui fixer un budget. Préparer le passage à une notification par la base (`LISTEN/NOTIFY`) ou par un service de diffusion. |
| 2 | La croissance du journal allonge la reconstruction des projections, l'export et l'effacement d'un compte, qui le parcourent en entier (ADR 0006 et 0008), jusqu'à dépasser la durée maximale d'une fonction Vercel. | Durée de la suppression d'un compte ou d'une reconstruction mesurée dans les journaux de Vercel ; journal au-delà de quelques centaines de milliers d'événements. | Mesurer ces opérations sur un journal volumineux généré par script. Indexer la recherche des événements d'un joueur, ou tenir une table de correspondance entre joueur et flux. |
| 3 | L'interface n'est couverte que par deux tests de bout en bout, propres à la Caravane : une régression de `use-channel.ts` ou d'un autre écran ne serait détectée qu'à la main. | Corrections d'interface répétées ; anomalies signalées par les joueurs après une publication. | Étendre `e2e/` à l'échange au Marché à deux joueurs, et exécuter `pnpm test:e2e` avant chaque publication, hors de `pnpm verify`. |

Deux préalables s'ajoutent avant toute ouverture à des joueurs réels :

- passer à l'offre Pro de Vercel, et accepter son DPA ;
- rembourser les dettes de conformité DT-008 à DT-011 et DT-015, et la dette DT-016 de la Caravane.

## 7. Conclusion

Le projet peut être repris et évoluer sans régression côté serveur. Ses frontières sont
vérifiées à chaque construction par neuf règles de dépendance, trois fonctions d'aptitude
et six tests de contrat. Ses règles du jeu sont couvertes presque entièrement. Chacune de
ses décisions est consignée, avec ses conséquences et ses conditions de réexamen. Ces
garanties ont été mises à l'épreuve : l'extraction du Village n'a demandé aucune
modification du module.

Trois conditions s'y attachent :
- étendre les tests de bout en bout aux autres écrans avant de les faire évoluer ;
- replanifier et rembourser les dettes de conformité avant toute ouverture au public ;
- mesurer la charge des flux temps réel avant d'accueillir plus de quelques dizaines de
  joueurs simultanés.

## Usage de l'IA générative

Claude (Anthropic) a rédigé ce bilan. Chaque valeur provient d'une commande exécutée sur
l'état final du projet : taille des modules, `pnpm test:coverage`, `pnpm lint:archi`, test
de charge enregistré dans `perf/`, `git log`. Chaque appréciation renvoie à un ADR, à une
revue ou au registre de la dette, que Claude a relus pour l'occasion.
