# ADR-0003 - Les Server-Sent Events, alimentés par le journal d'événements, pour la diffusion en temps réel

- Statut : accepté
- Date : 2026-10-19

## Contexte

Les joueurs doivent être informés des changements sans recharger leur page : d'abord entre
les onglets ou les appareils d'un même joueur pour le Village, puis entre les participants
d'une partie du Donjon (TD6).

Les actions des joueurs passent déjà par l'API, au moyen de requêtes HTTP ordinaires,
authentifiées par le cookie de session et validées par les modules. Seul manque un moyen,
pour le serveur, de notifier le navigateur.

L'hébergement impose ses contraintes : la durée d'exécution d'une fonction Vercel est
plafonnée (300 secondes dans la configuration du projet), plusieurs instances peuvent
fonctionner simultanément sans partager de mémoire, et le projet repose sur des offres
gratuites, sans infrastructure supplémentaire.

Le projet dispose d'un journal d'événements dont chaque flux porte des versions
croissantes et uniques (ADR 0002).

## Décision

Les changements sont diffusés par des Server-Sent Events, sur la route
`/api/stream/<canal>` (`src/platform/realtime/stream-api.ts`).

Un canal correspond exactement à un flux du journal d'événements. L'identifiant de chaque
message est la version de l'événement dans son flux : le navigateur le renvoie dans
l'en-tête `Last-Event-ID` lorsqu'il se reconnecte, et le flux reprend exactement après
cette version.

Le flux ne conserve aucun état en mémoire : il relit le journal toutes les demi-secondes et
transmet les événements apparus depuis la dernière lecture. Il se ferme de lui-même au bout
de 240 secondes, sous le plafond de Vercel, et le navigateur s'y reconnecte après le délai
indiqué par le champ `retry`.

L'accès est réservé aux joueurs connectés (`requireUser`). Chaque module déclare la règle
d'accès à ses canaux (`ChannelPolicy`), transmise par la racine de composition ; un canal
qu'aucune règle ne couvre est refusé. Le canal `village-<joueur>` n'est accessible qu'à son
propriétaire.

L'interface s'abonne par le hook `useChannel` et relit sa vue auprès de l'API à chaque
notification, plutôt que d'appliquer elle-même le contenu des événements.

## Conséquences

### Positives

- Les Server-Sent Events sont du HTTP ordinaire : ils traversent les serveurs mandataires et
  les pare-feu sans configuration, et bénéficient de l'authentification par cookie du TD4.
- L'interface `EventSource` du navigateur gère d'elle-même la reconnexion et l'envoi de
  `Last-Event-ID` : aucun événement n'est perdu ni reçu deux fois après une interruption.
- Le flux étant sans état, n'importe quelle instance peut servir n'importe quel joueur, et
  une reconnexion peut aboutir sur une autre instance.
- Aucune infrastructure supplémentaire n'est nécessaire : le journal est la source unique
  de l'état et des notifications.
- La règle « notifier, puis relire » garde l'interface simple, et permettra de ne
  transmettre qu'un signal lorsque le contenu d'un événement ne doit pas être connu de tous
  les abonnés.

### Négatives

- Chaque flux ouvert relit le journal deux fois par seconde : la charge de la base croît
  linéairement avec le nombre de joueurs connectés, même lorsque rien ne change.
- Un événement est reçu avec un délai pouvant atteindre l'intervalle de lecture, soit une
  demi-seconde, auquel s'ajoute la relecture de la vue.
- Chaque flux occupe une fonction Vercel pendant toute sa durée, et se reconnecte toutes
  les quatre minutes environ, ce qui consomme du temps d'exécution de l'offre gratuite.
- La communication est unidirectionnelle : un besoin d'échange à très faible délai du
  navigateur vers le serveur ne serait pas couvert.
- Chaque notification provoque une requête supplémentaire de relecture de la vue.

## Alternatives écartées

- **WebSocket** : connexion bidirectionnelle permanente, mais incompatible avec des
  fonctions Vercel à durée plafonnée, dont la prise en charge était encore expérimentale ;
  un serveur de WebSocket aurait exigé un hébergement permanent supplémentaire.
- **Interrogation périodique par le navigateur** : simple, mais impose un compromis entre
  requêtes inutiles et délai de réception, et multiplie les requêtes HTTP authentifiées.
- **Mécanisme de notification partagé entre instances** (`LISTEN/NOTIFY` de PostgreSQL,
  service de messagerie comme Redis) : il éviterait la relecture périodique, mais exige des
  connexions permanentes ou un service supplémentaire, non disponibles dans l'offre
  retenue, pour un gain inutile au nombre de joueurs du projet.

## Réexamen

Cette décision devra être réexaminée si le nombre de joueurs connectés simultanément rend
les lectures du journal significatives pour la base (par exemple plusieurs centaines de
flux ouverts, soit plusieurs centaines de requêtes par seconde), si un besoin de
communication du navigateur vers le serveur à très faible délai apparaît, ou si
l'hébergeur propose une prise en charge stable des WebSocket.

## Usage de l'IA générative

Claude (Anthropic) a rédigé cet ADR à partir des éléments imposés par le support du TD5,
et a vérifié sa cohérence avec le code (`src/platform/realtime/`) et avec le fonctionnement
observé (reconnexion avec `Last-Event-ID` dans un navigateur).
