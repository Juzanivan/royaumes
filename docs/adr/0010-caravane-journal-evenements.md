# ADR-0010 - La Caravane conserve ses voyages dans le journal d'événements, et ses listes dans des tables tenues par une projection

- Statut : accepté
- Date : 2026-10-23

## Contexte

Le module Caravane (fiche de cadrage, `docs/evaluation/fiche-cadrage.md`) permet à un joueur
d'envoyer une cargaison vers le village d'un autre joueur. Une caravane passe par plusieurs
états : chargement, route, puis livraison, attaque ou annulation. Chacun de ces passages
résulte d'une réponse du Village ou de l'écoulement du temps, et non d'une seule requête.

Trois besoins orientent le choix du stockage :

- **Le récit du voyage a une valeur de jeu.** La vue de profil rejoue le départ, l'attaque
  des brigands et le demi-tour, ou l'arrivée. Elle a besoin de l'heure de chacun de ces
  faits, et pas seulement de l'état final.
- **Une caravane ne doit avoir qu'une seule issue (règle 11).** Plusieurs lectures
  simultanées peuvent constater l'arrivée en même temps qu'un rappel de la boîte d'envoi :
  une seule doit l'emporter.
- **Les joueurs consultent des listes** : leurs caravanes envoyées et attendues, et les
  villages vers lesquels ils peuvent en envoyer. Ces listes doivent se lire sans relire
  l'historique de toutes les caravanes.

Le TD10 a montré qu'un module dont les données sont destinées à disparaître, comme les
messages de la Taverne, se prête mal à l'Event Sourcing (ADR 0008). Une caravane, au
contraire, n'expire pas : son voyage reste consultable, et il compte au Classement.

## Décision

- Chaque caravane est un flux `caravan-<identifiant>` du journal de la plateforme. Ses
  événements sont `CaravanSent`, `CaravanCancelled`, `CaravanDeparted`, `CaravanAmbushed` et
  `CaravanDelivered` (`src/modules/caravan/domain/caravan.ts`).
- Le domaine suit le modèle decider des TD3 et TD9 : `decide` vérifie les règles et produit
  des événements, `evolve` reconstruit l'état. Le service enregistre les événements avec
  concurrence optimiste, et rejoue la décision en cas de conflit (`withOptimisticRetry`).
- Les événements d'issue portent l'heure prévue de l'attaque ou de l'arrivée, et non celle
  du constat : le récit ne dépend pas de l'instant où il est lu.
- La graine des brigands est enregistrée dans `CaravanSent`. Elle ne quitte jamais le
  journal : la vue, la projection, l'export et le canal temps réel ne la transmettent pas.
- La liste des caravanes et celle des destinations sont tenues par une projection
  (`caravansProjection`, version 1), rattrapée à chaque lecture comme au TD8, dans deux tables
  du schéma `caravan` créées par la migration `0013_caravane.sql`.

## Conséquences

### Positives

- La règle 11 est garantie par le journal : deux constats simultanés de la même issue
  produisent un conflit de version, et le second constat, rejoué, ne trouve plus rien à faire.
- La vue de profil et l'export disposent de tout le récit, sans table d'historique
  supplémentaire.
- Le Classement compte les caravanes livrées en lisant le journal (ADR 0011), sans que la
  Caravane ait rien à lui transmettre.
- Les tables du schéma `caravan` peuvent être vidées et reconstruites à tout moment à partir du
  journal ; une erreur de projection se corrige en augmentant sa version.
- Le domaine, en TypeScript pur, se teste sans base de données (22 tests).

### Négatives

- Le nombre de caravanes en route d'un joueur (règle 3) est lu dans la projection, avant
  l'envoi et hors de la transaction qui l'enregistre : deux envois simultanés peuvent dépasser
  la limite (dette DT-016).
- La liste des caravanes n'est cohérente qu'à terme : elle est à jour à chaque lecture, après
  rattrapage, mais une issue n'y figure qu'une fois constatée.
- Les noms de l'expéditeur et du village destinataire sont copiés dans le journal : leur
  effacement demande une réécriture ciblée des événements (ADR 0008).
- Le journal grandit avec chaque caravane, même annulée, et n'est jamais purgé.

## Alternatives écartées

- **Des tables classiques, mises à jour à chaque étape** : il faudrait une colonne par fait
  du récit, et un verrou ou une condition de mise à jour pour garantir une seule issue. Le
  Classement devrait en outre être averti par un message, au lieu de lire le journal.
- **Recalculer les listes à partir du journal, à chaque consultation** : c'était la dette
  DT-005 du Donjon, remboursée au TD8 ; le coût d'une consultation croîtrait avec l'historique
  de toutes les caravanes.
- **Conserver la graine dans une table secrète, hors du journal** : l'issue ne serait plus
  reconstructible à partir du journal seul, et un rejeu ou une reconstruction pourrait la
  perdre. Il suffit de ne jamais la recopier ni la transmettre.

## Réexamen

Cette décision devra être réexaminée si les caravanes devenaient assez nombreuses pour que
la taille du journal pose problème, ou si une règle exigeait de modifier une caravane après
son issue.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR, et le code qu'il décrit, à partir de la fiche de cadrage
validée par l'auteur. La cohérence avec le code a été vérifiée par les tests du domaine
(`caravan.test.ts`), les tests de l'API (`src/bootstrap/caravan-api.test.ts`) et une relecture
de l'auteur.
