# ADR-0006 - Séparer les modèles de lecture du modèle d'écriture, tenus à jour par des projections rattrapées à la lecture

- Statut : accepté
- Date : 2026-10-20

## Contexte

Certaines lectures traversent les flux du journal : le classement des joueurs porte sur
tous les villages et toutes les expéditions, et la liste des expéditions ouvertes sur
toutes les expéditions. Calculées par rejeu à chaque consultation, ces lectures ont un coût
qui croît avec l'historique du jeu, sans limite ; c'était la dette DT-005 de la liste des
expéditions ouvertes.

L'hébergement ne permet aucun processus permanent (ADR 0004) : aucun processus de fond ne
peut surveiller le journal, et les tâches planifiées de l'offre gratuite ne s'exécutent
qu'une fois par jour.

Le journal attribue à chaque événement une position globale, croissante mais non
continue : une insertion refusée consomme une position, et deux insertions simultanées ne
sont pas toujours validées dans l'ordre de leurs positions (ADR 0002).

## Décision

Les lectures transversales s'appuient sur des modèles de lecture, placés dans le schéma
PostgreSQL de leur module (`ranking`, `dungeon`). Les décisions s'appuient toujours sur le
modèle d'écriture, le journal, qui reste la seule source de vérité.

Chaque modèle de lecture est tenu à jour par une projection (`src/platform/projection/`),
dont le point de reprise, la position du dernier événement appliqué, est enregistré dans la
table `platform.projections`.

Une projection est rattrapée au moment de sa consultation, dans une seule transaction qui
couvre les tables et le point de reprise ; ce dernier est verrouillé (`FOR UPDATE`) pendant
toute la transaction.

Le rattrapage s'arrête devant une position manquante tant que l'événement qui la suit a été
enregistré il y a moins de cinq secondes, et la franchit ensuite.

Chaque projection porte une version, enregistrée avec son point de reprise : une version du
code plus élevée que celle des tables provoque leur reconstruction à partir du journal ;
une version moins élevée interdit toute écriture.

Le classement est annoncé aux navigateurs par un canal global et discret, qui suit les
types d'événements de la projection dans tout le journal ; l'interface relit le classement
jusqu'à ce que la projection ait atteint la position annoncée.

## Conséquences

### Positives

- Le coût d'une consultation ne dépend plus de l'historique, mais du nombre d'événements
  nouveaux et de la taille du modèle de lecture.
- Les modules qui écrivent ne savent rien des projections qui les lisent : le Village et le
  Donjon n'ont pas été modifiés pour le Classement.
- Une nouvelle information peut être calculée pour tout le passé, sans migration de
  données : il suffit d'augmenter la version de la projection (meilleur butin).
- Aucune tâche de fond ni opération manuelle n'est nécessaire après un déploiement : la
  première consultation rattrape ou reconstruit la projection.
- Aucun événement n'est appliqué deux fois ni oublié, y compris lors de rattrapages
  simultanés ou d'insertions concurrentes.
- Le moteur est générique : le Classement et la liste des expéditions ouvertes le
  partagent.

### Négatives

- La cohérence est à terme : un modèle de lecture peut avoir quelques secondes de retard sur
  le journal, ce que l'interface du classement doit gérer.
- La reconstruction a lieu pendant une consultation, dont la durée est limitée sur Vercel :
  au-delà d'une certaine taille du journal, elle ne pourra plus aboutir.
- Après un retour à une version précédente de l'application, une projection dont la version
  a été augmentée cesse d'avancer jusqu'au déploiement suivant.
- Le Classement dépend du langage publié des autres modules : un événement modifié ou
  ajouté sans réexamen de ses lecteurs passe inaperçu, comme l'a montré la liste des
  expéditions ouvertes, qui ignorait les compagnons.
- Une consultation peut écrire dans la base (le modèle de lecture), et le verrou du point de
  reprise fait attendre les consultations simultanées.

## Alternatives écartées

- **Mise à jour des modèles de lecture dans la commande, par le module qui écrit** : le
  Village et le Donjon devraient connaître toutes les projections qui les lisent, contre la
  règle d'encapsulation des modules.
- **Tâche planifiée** : une fois par jour seulement sur l'offre gratuite, le classement
  serait presque toujours périmé.
- **Processus de fond abonné au journal** : impossible sans processus permanent (ADR 0004).
- **Vue matérialisée de PostgreSQL** : entièrement recalculée à chaque rafraîchissement,
  elle conserverait un coût proportionnel à l'historique.
- **Maintien du calcul par rejeu** : coût croissant sans limite (dette DT-005).

## Réexamen

Cette décision devra être réexaminée si la reconstruction d'une projection approche la
durée maximale d'une fonction Vercel, si le nombre de consultations simultanées fait du
verrou du point de reprise un goulet d'étranglement, ou si un besoin de lecture strictement
à jour apparaît.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR à partir des éléments imposés par le support du TD8,
et a vérifié sa cohérence avec le code du moteur des projections, des modules Classement
et Donjon, et avec leurs tests.
