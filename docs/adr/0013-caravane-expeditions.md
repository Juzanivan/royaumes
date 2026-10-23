# ADR-0013 - Les expéditions vers la grotte sont une mission de la caravane, dans le même flux et la même saga

- Statut : accepté
- Date : 2026-10-23

## Contexte

Une fois la Caravane livrée, une seconde façon de l'utiliser a été ajoutée : l'expédition vers
la grotte (fiche de cadrage, règles 13 à 17). Une caravane part à vide, met 30 secondes à
atteindre la grotte, y reste une minute pendant que l'escorte la fouille, puis met 30 secondes
à rentrer. Elle rapporte un butin tiré de sa graine : une escorte fouille mieux, et une
caravane sans escorte revient souvent bredouille.

Deux modélisations étaient possibles :

1. **Un nouvel agrégat**, `Expedition`, avec son flux `expedition-<id>`, sa projection, son
   canal, son contributeur de données personnelles et ses routes.
2. **Une mission de la caravane** : les mêmes flux, saga, projection et canal, avec deux
   événements de plus (`ExpeditionSent`, `ExpeditionReturned`).

## Décision

Une expédition est une **mission** de la caravane (option 2) :

- l'état porte `mission: 'delivery' | 'expedition'` ; une expédition est sa propre
  destinataire, et sa destination est la grotte (`CAVE_NAME`) ;
- `ExpeditionSent` déclenche le même prélèvement que l'envoi d'une caravane (provisions et
  prix de l'escorte, clé `<id>:load`), et la même annulation si le village ne peut pas payer ;
- le départ (`CaravanDeparted`) fixe l'heure du retour, deux minutes plus tard, et programme
  le même rappel différé ;
- au retour, `ExpeditionReturned` porte le butin, calculé par `caveLoot` à partir de la graine
  et de l'escorte, et déclenche un versement à l'expéditeur (clé `<id>:loot`) s'il n'est pas
  vide ;
- les brigands n'attaquent pas une expédition, qui part à vide (`outcomeOf`) ;
- la vue ne présente le butin qu'au retour (`loot` est `null` avant), et jamais la graine ;
- les étapes de l'exploration (aller, fouille, retour) se déduisent de l'heure de départ, qui
  est publique : l'interface les met en scène sans rien demander au serveur.

## Conséquences

### Positives

- Aucune brique nouvelle : la saga, la clé d'idempotence, le rappel différé, le canal discret,
  la limite de trois caravanes en route et l'effacement des données s'appliquent tels quels.
- Les garanties de la revue de sécurité de la Caravane (C6 à C10) couvrent les expéditions :
  graine jamais transmise, butin révélé à son heure, issue appliquée une fois.
- Aucune migration : la projection reconnaît une expédition à son destinataire, égal à son
  expéditeur, ce que la règle 1 interdit à une livraison. Sa version passe à 2.

### Négatives

- L'agrégat porte deux missions : chaque fonction du domaine doit distinguer la livraison de
  l'expédition. Si une troisième mission apparaissait, il faudrait les séparer.
- Une expédition rapporte des ressources qui n'existaient pas : contrairement à une
  livraison, elle n'obéit pas à la règle 10. C'est voulu (règle 15), et compensé par le coût
  des provisions et de l'escorte.
- Le Classement ne compte pas les expéditions : elles ne lisent pas d'événement qu'il
  connaisse, et sa projection n'a pas à changer.

## Réexamen

Si une autre mission que la livraison et l'expédition était demandée, ou si les expéditions
devaient avoir leurs propres règles de concurrence (une grotte partagée entre joueurs, par
exemple).
