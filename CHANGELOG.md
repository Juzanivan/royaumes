# Journal des modifications

Les nouveautés de chaque version de Royaumes. Le format suit
[Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Les mêmes versions sont annoncées
aux joueurs par le crieur public (`src/ui/patch-notes.ts`) : un test vérifie que les deux
listes concordent.

## [1.2] - 2026-10-23

Évaluation finale : le module Caravane.

### Ajouté

- Module `caravan` : envoi de ressources à un autre joueur, avec une escorte (aucune, gardes,
  chevaliers), une capacité de 500 unités et trois caravanes en route au plus
  (ADR 0010).
- Saga avec le Village par la boîte d'envoi, qui réutilise les sujets `realm.withdraw` et
  `realm.deposit` ; canal discret `caravan-<id>` réservé à l'expéditeur et au destinataire
  (ADR 0011).
- IA des brigands déterministe, tirée d'une graine gardée secrète, et issue constatée à la
  lecture ou par un rappel différé (ADR 0012).
- Jauge du risque d'attaque au relais, calculée par la même fonction que le domaine.
- Vue de profil animée du voyage, et chariots en route sur la carte du village.
- Colonne « Caravanes » du Classement (projection v3).
- Crieur public : notes de version présentées aux joueurs depuis le menu du château.
- Revue de sécurité de la Caravane, ligne T8 du registre des traitements.

### Dette

- DT-016 : la limite de trois caravanes est lue hors de la transaction d'envoi.

## [1.1] - 2026-10-23

### Ajouté

- Carte du village en plein écran ; navigation par les bâtiments.
- Décors des lieux, sortie par un clic sur le décor ou par Échap, croix sur écran tactile.
- Passage du jour à la nuit par le soleil ou la lune de chaque décor (le bouton de thème est
  retiré).
- Écran titre de connexion et de fondation du village.
- Villageois, mare animée, production unité par unité et indicateur d'amélioration.

### Modifié

- La Taverne est déplacée hors de la route des caravanes.

### Sécurité

- Next.js mis à jour en 16.4.2.

## [1.0] - 2026-10-23

État à l'étiquette `td11-fin`.

### Ajouté

- Village en Event Sourcing (TD3 à TD6), temps réel par Server-Sent Events.
- Donjon à plusieurs, compagnons et IA déterministe (TD6 et TD7).
- Classement par projections CQRS (TD8).
- Marché par une saga orchestrée et une boîte d'envoi (TD9).
- Taverne, export et effacement des données personnelles (TD10).
- Fonctions d'aptitude, test de charge et extraction préparée du Village (TD11).
