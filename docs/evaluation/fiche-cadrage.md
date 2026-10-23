# Fiche de cadrage : la Caravane

- Auteur : Jules Zanivan
- Date : 2026-10-23
- Nom technique du module : `caravan`

## L'idée

Depuis le relais des caravanes, un nouveau bâtiment de la carte du village, le joueur envoie
une cargaison de bois, de pierre ou d'or vers le village d'un autre joueur. La caravane
voyage pendant une durée qui dépend de sa charge. À son arrivée, elle est livrée au
destinataire, à moins que des brigands ne l'attaquent en chemin. Dans ce cas, ils
emportent une partie de la cargaison, et le reste revient à l'expéditeur.

Une fois la caravane partie, le joueur peut rester sur son village, où il la voit quitter
la carte. Il peut aussi cliquer dessus pour la suivre. Elle apparaît alors de profil, sur la
route, devant une forêt qui défile, avec en bas une barre de progression du trajet. Si des
brigands l'attaquent, l'attaque est animée au moment où elle a lieu, et la caravane fait
demi-tour avec ce qui lui reste.

C'est le premier moyen de donner des ressources à un autre joueur sans contrepartie : pour
aider un allié qui manque de pierre, ou préparer une alliance. Le joueur doit aussi faire un
choix : payer une escorte, ou risquer de perdre la moitié de sa cargaison.

## Les règles métier

Les règles que le domaine du module devra faire respecter. Chacune sera vérifiée par au
moins un test.

1. Une caravane est envoyée vers le village d'un autre joueur : jamais vers son propre
   village, ni vers un joueur sans village.
2. La cargaison est faite de quantités entières et strictement positives de bois, de pierre
   ou d'or, avec au moins une ressource. Le total ne dépasse pas la capacité d'une caravane,
   de 500 unités.
3. Un joueur a au plus 3 caravanes en route à la fois.
4. La cargaison et le prix de l'escorte sont prélevés dans le village de l'expéditeur avant
   le départ. Si le village ne dispose pas de ces ressources, la caravane est annulée et rien
   ne part.
5. La durée du trajet est de 60 secondes, plus une seconde par tranche de 10 unités de
   cargaison. L'heure d'arrivée est fixée au départ.
6. Une escorte se choisit au départ, à l'un de trois niveaux : aucune, gardes ou chevaliers,
   qui coûtent respectivement 0, 20 et 50 pièces d'or. Ce prix n'est jamais rendu.
7. L'issue du voyage est décidée par les brigands, selon une règle déterministe. Le risque
   d'attaque augmente avec la valeur de la cargaison et diminue avec l'escorte. Pour une même
   caravane, l'issue et le moment de l'attaque sont toujours les mêmes. Une attaque a lieu
   entre 30 % et 80 % du trajet. L'issue reste secrète jusqu'au moment de l'attaque, ou
   jusqu'à l'arrivée s'il n'y en a pas : aucune lecture ne la révèle avant.
8. Une caravane livrée remet toute sa cargaison au destinataire.
9. Une caravane attaquée perd la moitié de chaque ressource, arrondie à l'entier inférieur.
   Elle fait demi-tour au moment de l'attaque, et le reste est rendu à l'expéditeur.
10. Un voyage ne crée aucune ressource. La cargaison est égale à ce qui est livré, ou à la
    somme de ce qui est volé et de ce qui est rendu.
11. L'issue d'une caravane n'est appliquée qu'une fois, même si l'arrivée est constatée
    plusieurs fois ou si un message est remis en double.
12. Seuls l'expéditeur et le destinataire peuvent consulter une caravane.

### Les expéditions vers la grotte (ajoutées après le premier cadrage)

Une caravane peut aussi partir en expédition vers la grotte. Elle part à vide, l'explore, et
rapporte ce qu'elle y a trouvé à son expéditeur. Le choix de modélisation est consigné dans
l'ADR 0013.

13. Une expédition emporte 30 unités de bois de provisions, et son escorte, payée au même prix
    que pour une caravane. Provisions et escorte sont prélevées avant le départ, et ne sont
    jamais rendues. Si le village ne dispose pas de ces ressources, l'expédition est annulée.
    Elle compte parmi les 3 caravanes en route de la règle 3.
14. Une expédition met 30 secondes à atteindre la grotte, l'explore pendant une minute, et met
    30 secondes à rentrer. L'heure du retour est fixée au départ. Les brigands ne l'attaquent
    pas.
15. Le butin est décidé par une règle déterministe, à partir de la graine de l'expédition. Elle
    revient bredouille avec une probabilité de 40 % sans escorte, 20 % avec des gardes et 5 %
    avec des chevaliers. Sinon, elle rapporte de 20 à 60 bois, de 10 à 40 pierres et de 0 à 20
    pièces d'or, multipliés par 1, 1,5 ou 2,5 selon l'escorte, et arrondis à l'entier
    inférieur.
16. Le butin reste secret jusqu'au retour de l'expédition : aucune lecture ne le révèle avant.
17. Au retour, le butin est versé à l'expéditeur, une seule fois. Une expédition revenue
    bredouille ne verse rien. Seul l'expéditeur peut consulter son expédition.

## Les commandes et les lectures

| Action du joueur | Commande ou lecture | Route envisagée |
| --- | --- | --- |
| Voir les villages vers lesquels envoyer une caravane | Lecture | `GET /api/caravans/destinations` |
| Envoyer une caravane | Commande `send` | `POST /api/caravans` |
| Voir ses caravanes envoyées et attendues | Lecture | `GET /api/caravans` |
| Suivre une caravane, sur sa vue de profil | Lecture | `GET /api/caravans/:id`, page `/caravan/:id` |
| Partir en expédition vers la grotte | Commande `explore` | `POST /api/caravans/expeditions` |

L'attaque et l'arrivée ne sont pas des actions du joueur. Elles sont constatées à leur
échéance, à la première lecture qui la dépasse, et à défaut par un rappel différé de la
boîte d'envoi.

## Le stockage envisagé

Un journal d'événements, selon le modèle decider, avec un flux `caravan-<identifiant>` par
caravane. Le voyage a une valeur de jeu : départ, attaque, livraison et restitution forment
le récit que l'interface présente au joueur. C'est aussi ce qu'a fait le Marché : l'état de
la saga se déduit des événements, et la concurrence optimiste garantit qu'une caravane n'a
qu'une seule issue (règle 11).

La liste des caravanes d'un joueur et la liste des destinations sont tenues par une
projection, dans des tables du schéma `caravan`, créées par une migration.

## La communication avec les modules existants

- **Village, par messages de la boîte d'envoi.** La Caravane demande un prélèvement au
  départ, puis un versement au destinataire à la livraison, ou à l'expéditeur après une
  attaque. Elle utilise les sujets `realm.withdraw` et `realm.deposit`, et le Village répond
  sur le sujet `caravan.transfer-result`. Le Village n'a pas à être modifié : son langage
  publié couvre déjà ces mouvements.
- **Village, par lecture de son langage publié.** La projection des destinations lit les
  événements de fondation des villages.
- **Classement, par lecture du langage publié de la Caravane.** Le Classement compte les
  caravanes livrées par chaque joueur, dans une nouvelle colonne. La version de sa
  projection est augmentée pour qu'elle soit reconstruite.

## Les données personnelles

Les identifiants et les noms de l'expéditeur et du destinataire, contenus dans les
événements de chaque caravane et dans le modèle de lecture. Ils sont exportés avec les
données du joueur, et remplacés par une mention neutre lors de l'effacement de son compte.

## Les bonus visés

Par ordre de priorité :

1. B5 : une saga avec le Village. La restitution à l'expéditeur après une attaque est
   l'étape compensable.
2. B2 : une arrivée gérée sans tâche de fond, constatée à la lecture.
3. B3 : des brigands pilotés par l'ordinateur, selon une IA déterministe et testée.
4. B1 : un canal temps réel propre au module, réservé à l'expéditeur et au destinataire.
5. B6 : une communication avec deux modules existants, le Village et le Classement.
6. B4 : un modèle de lecture tenu par une projection, avec son point de reprise et sa
   version.
7. B9 : la caravane animée qui quitte la carte du village, et sa vue de profil, avec la
   forêt qui défile, la barre de progression et l'animation de l'attaque.
8. B10 : un test de bout en bout de l'envoi d'une caravane, avec Playwright.
