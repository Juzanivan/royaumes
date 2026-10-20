# ADR-0008 - Un stockage classique pour la Taverne, et la réécriture ciblée des champs personnels du journal pour l'effacement

- Statut : accepté
- Date : 2026-10-20

## Contexte

La Taverne ajoute au jeu des données personnelles destinées à disparaître : des messages,
conservés trente jours puis supprimés, et une présence qui ne doit durer que le temps de la
visite d'un joueur. Le RGPD accorde par ailleurs aux joueurs des droits d'accès, de
portabilité et d'effacement qui portent sur le jeu entier, et non sur un seul module.

Les données d'un joueur sont réparties dans tous les modules. Son nom a été copié dans
des événements du Donjon (`GameCreated`, `PlayerJoined`) et du Marché (`OfferPublished`,
`OfferAccepted`), et le nom de son village dans l'événement `VillageFounded` du Village.
Certains de ces flux sont partagés avec d'autres joueurs, par exemple une expédition ou
une offre acceptée. Les tables de lecture du Classement, du Donjon et du Marché contiennent
aussi ces noms.

Le journal est en ajout seul (ADR 0002) : aucun événement n'est modifié ni supprimé, et les
états reconstruits comme les projections (ADR 0006) en dépendent.

## Décision

- La Taverne n'utilise pas l'Event Sourcing. Ses messages et sa présence sont conservés
  dans des tables ordinaires du schéma `tavern`, dont les lignes sont supprimées à
  l'expiration de leur durée de conservation.
- Son canal temps réel est alimenté par une source fournie par le module (`ChannelSource`),
  et non par le journal.
- La présence repose sur un signal envoyé toutes les trente secondes. La table conserve une
  ligne par joueur présent, supprimée à son départ ou deux minutes après son dernier signal.
- Les durées de conservation sont appliquées à la lecture, et chaque jour par la route des
  tâches quotidiennes (`/api/cron/daily`), qui remplace la route de la boîte d'envoi.
- Chaque module déclare ses données personnelles par un contributeur
  (`PersonalDataContributor`, fichier `personal-data.ts`), qui assure l'export de ses
  données, la réécriture de ses événements et l'effacement de ses tables.
- L'effacement remplace les seuls champs de nom des événements par « Joueur effacé » ou
  « Village effacé ». Cette réécriture passe par une fonction unique de la plateforme,
  `rewriteJournal`, et chaque effacement est consigné dans le registre
  `platform.erasures`, qui ne contient que sa date et le nombre d'événements réécrits.
- L'identité est effacée en dernier, et chaque étape est idempotente : un effacement
  interrompu peut être relancé par le joueur.

## Conséquences

### Positives

- Les joueurs exercent eux-mêmes leurs droits, depuis la page « Mes données », sans
  intervention d'un administrateur.
- L'effacement n'altère ni les états reconstruits ni l'historique des autres joueurs : le
  type, la version, la position et les autres données des événements sont inchangés, et
  une reconstruction de projection donne le même résultat que la correction directe.
- La durée de conservation est garantie même si personne ne visite la Taverne.
- La Taverne est plus simple que si elle avait suivi le modèle des autres modules : ni
  état reconstruit, ni concurrence optimiste, ni projection.
- La plateforme ne connaît pas les événements des modules : un module ajouté demain
  participe aux droits des joueurs en fournissant son contributeur.

### Négatives

- La règle de l'ajout seul admet désormais une exception. Toute modification future du
  journal devra rester dans ce cadre : champs personnels seulement, par `rewriteJournal`,
  et tracée.
- L'effacement et l'export parcourent tout le journal : leur coût croît avec sa taille.
- Chaque événement futur crée une obligation : si un champ personnel n'est pas déclaré dans
  le contributeur de son module, il échappe à l'effacement, et aucun test général ne le
  détecte.
- L'identifiant du joueur reste dans le journal. Sa pseudonymisation suppose qu'aucun lien
  avec la personne ne subsiste ailleurs, y compris dans les journaux de l'hébergeur.
- La copie du nom de l'auteur dans chaque message de la Taverne n'est acceptable que parce
  que les messages sont supprimés au bout de trente jours.

## Alternatives écartées

- **L'Event Sourcing pour la Taverne** : un journal en ajout seul s'oppose à des données
  destinées à disparaître. L'historique des messages n'a aucune valeur, aucun autre module
  ne le lit, et aucune décision ne dépend d'un état.
- **La suppression des flux du joueur** : impossible pour les flux partagés, puisqu'elle
  détruirait l'historique des autres joueurs et rendrait leurs états non reconstructibles.
- **L'effacement cryptographique** : chaque module et chaque projection devraient chiffrer
  et déchiffrer les champs personnels, et la méthode ne s'applique pas aux événements déjà
  enregistrés en clair.
- **Les références sans copie** : c'est la meilleure conception pour les événements futurs,
  mais elle ne règle pas le cas des événements déjà enregistrés.
- **Un service externe de présence**, comme une base clé-valeur en mémoire : il ajouterait
  un fournisseur, un sous-traitant de plus et une configuration, pour une liste qui tient
  dans une table de quelques lignes.

## Réexamen

Cette décision devra être réexaminée lors de la conception d'un nouveau module ou d'un
nouvel événement, pour lequel les références sans copie devraient être préférées dès
l'origine. Elle devra l'être aussi si la taille du journal rend l'effacement trop long pour
une requête, ou si la doctrine sur l'anonymisation des identifiants pseudonymes évolue.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR à partir des éléments imposés par le support du TD10,
et a vérifié sa cohérence avec le code de la Taverne, de la brique `privacy`, des
contributeurs des modules et avec leurs tests.
