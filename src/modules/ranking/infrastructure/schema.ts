import { integer, pgSchema, primaryKey, text } from 'drizzle-orm/pg-core'

/** Schéma PostgreSQL du module Classement : il ne contient que des modèles de lecture. */
export const ranking = pgSchema('ranking')

/** Totaux de chaque joueur, tenus à jour par la projection du classement. */
export const players = ranking.table('players', {
  playerId: text('player_id').primaryKey(),
  /** Nom du joueur, connu par les événements du Donjon ; null s'il n'y a jamais joué. */
  name: text('name'),
  /** Nom de son village, connu par l'événement VillageFounded ; null s'il n'en a pas fondé. */
  village: text('village'),
  gamesPlayed: integer('games_played').notNull().default(0),
  gamesWon: integer('games_won').notNull().default(0),
  gold: integer('gold').notNull().default(0),
  upgrades: integer('upgrades').notNull().default(0),
  /** Or rapporté par la meilleure expédition gagnée ; ajouté par la version 2 de la projection. */
  bestLoot: integer('best_loot').notNull().default(0),
  /** Caravanes livrées par le joueur à d'autres villages ; ajouté par la version 3. */
  caravans: integer('caravans').notNull().default(0),
})

/**
 * Expéditeur de chaque caravane en route, retenu jusqu'à son issue : l'événement
 * CaravanDelivered ne désigne que la caravane, et cette table indique à qui attribuer la
 * livraison. Une caravane annulée ou attaquée en sort sans rien compter.
 */
export const caravanSenders = ranking.table('caravan_senders', {
  caravanId: text('caravan_id').primaryKey(),
  senderId: text('sender_id').notNull(),
})

/**
 * Joueurs de chaque expédition, retenus jusqu'à sa fin : l'événement GameEnded désigne
 * l'expédition, et cette table indique à quels joueurs attribuer son résultat.
 * Les compagnons n'y figurent pas, puisqu'ils n'arrivent pas par GameCreated ou PlayerJoined.
 */
export const gamePlayers = ranking.table(
  'game_players',
  {
    gameId: text('game_id').notNull(),
    playerId: text('player_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.playerId] })],
)
