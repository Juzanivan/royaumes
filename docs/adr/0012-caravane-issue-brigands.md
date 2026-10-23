# ADR-0012 - L'issue d'un voyage est décidée au départ par une IA déterministe, gardée secrète, et constatée sans tâche de fond

- Statut : accepté
- Date : 2026-10-23

## Contexte

L'issue d'une caravane (livraison ou attaque, et heure de l'attaque) doit être :

- **juste et vérifiable** : la même caravane doit toujours avoir la même issue (règle 7),
  quel que soit l'instant ou le nombre de fois où elle est constatée ;
- **secrète jusqu'à son heure** : un joueur ne doit pas pouvoir la lire dans les réponses de
  l'API ou dans le flux temps réel, puis rappeler sa caravane ou choisir une autre escorte ;
- **constatée à l'heure**, alors que l'hébergement n'offre aucun processus permanent
  (ADR 0004) et que la tâche planifiée gratuite ne s'exécute qu'une fois par jour ;
- **jouée en direct** : la vue de profil anime l'attaque au moment où elle a lieu.

Le Donjon a déjà résolu des problèmes voisins : échéances paresseuses (ADR 0004) et IA
déterministe à graine (ADR 0005).

## Décision

- **Les brigands sont une IA déterministe** (`src/modules/caravan/domain/brigands.ts`). À
  partir de la graine de la caravane, ils tirent la taille de la bande (1 à 8), n'attaquent
  qu'une caravane moins défendue qu'eux (escorte de force 0, 3 ou 6), avec une probabilité
  qui croît avec la valeur de la cargaison (l'or compte triple), et choisissent le moment de
  l'attaque, entre 30 % et 80 % du trajet.
- **La graine est tirée au départ** par le service (`crypto.getRandomValues`), enregistrée
  dans `CaravanSent` et jamais transmise (ADR 0010). Le canal temps réel de la caravane est
  discret (`redact: true`), et réservé à l'expéditeur et au destinataire.
- **L'issue est constatée sans tâche de fond** : à toute lecture de la caravane, ou de la liste
  des caravanes, dont l'heure est passée (commande `Resolve`), et à défaut par le rappel
  différé de la boîte d'envoi programmé au départ (commande `ResolveDue`, qui échoue tant que
  l'heure n'est pas venue, pour que le message soit retenté).
- **La vue ne révèle rien avant l'heure** : tant que l'issue n'est pas constatée, elle ne
  contient que les heures publiques du départ et de l'arrivée prévue
  (`src/modules/caravan/domain/view.ts`). La vue de profil interroge la caravane toutes les
  2,5 secondes : la lecture qui suit l'heure de l'attaque la constate, et l'animation part.
- **Le risque est public, l'issue ne l'est pas** : le relais affiche la probabilité d'attaque
  (`attackChance`), calculée par la même règle, avant tout tirage.

## Conséquences

### Positives

- L'issue est reproductible : les tests choisissent une graine pour obtenir une attaque ou
  une livraison, et vérifient que le constat est le même à toute heure.
- Rien ne tourne en permanence : une caravane que personne ne regarde est livrée par le
  rappel différé, sans coût supplémentaire.
- Le joueur prend une décision éclairée (cargaison, escorte) sans pouvoir connaître l'issue.
- Le mécanisme est celui du Donjon : aucune brique nouvelle de plateforme.

### Négatives

- L'heure du rappel différé est stockée dans la boîte d'envoi : un administrateur de la base
  pourrait en déduire l'issue. Le joueur, lui, n'y a pas accès.
- Le générateur n'est pas cryptographique : qui connaîtrait la graine prévoirait l'issue. Il
  ne doit donc jamais être exposé.
- L'animation part jusqu'à 2,5 secondes après l'heure réelle de l'attaque, et la barre de
  progression recule alors au point de l'attaque.
- Les interrogations régulières de la vue de profil coûtent une requête toutes les 2,5
  secondes par joueur qui regarde une caravane.
- Le générateur est recopié du domaine du Donjon : un domaine n'importe aucun autre module.

## Alternatives écartées

- **Tirer l'issue à l'heure de l'arrivée, avec `Math.random`** : l'issue dépendrait de
  l'instant du constat, deux constats simultanés pourraient diverger, et aucun test ne
  pourrait la reproduire.
- **Une tâche planifiée qui constate les arrivées** : la tâche gratuite ne s'exécute qu'une fois
  par jour ; une tâche plus fréquente demanderait un hébergement payant.
- **Envoyer l'issue au navigateur dès le départ, et ne l'afficher qu'à l'heure** : un joueur
  la lirait dans les outils du navigateur.
- **Annoncer l'attaque par le canal temps réel, sans interroger** : le canal n'émet que ce que
  le journal contient, et l'attaque n'y entre qu'une fois constatée par une lecture ou par le
  rappel ; l'interrogation régulière reste nécessaire pour la déclencher à l'heure.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR, l'IA des brigands et le constat de l'issue, à partir de
la fiche de cadrage et des ADR 0004 et 0005. Le résultat a été vérifié par les tests des
brigands (déterminisme, fenêtre d'attaque, effet de l'escorte et de la cargaison, risque
annoncé égal à la fréquence observée sur 2 000 graines), les tests de l'API (attaque non
révélée avant son heure, rappel différé), et une relecture de l'auteur.
