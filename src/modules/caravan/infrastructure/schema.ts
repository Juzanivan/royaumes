import { bigint, index, jsonb, pgSchema, text } from 'drizzle-orm/pg-core'

/**
 * Schéma PostgreSQL du module Caravane. Les événements des caravanes restent dans le journal
 * de la plateforme ; ce schéma ne contient que le modèle de lecture tenu par la projection.
 */
export const caravan = pgSchema('caravan')

/** Caravanes envoyées, avec leur état courant : la liste présentée à l'expéditeur et au destinataire. */
export const caravans = caravan.table(
  'caravans',
  {
    caravanId: text('caravan_id').primaryKey(),
    senderId: text('sender_id').notNull(),
    senderName: text('sender_name').notNull(),
    recipientId: text('recipient_id').notNull(),
    /** Nom du village du destinataire. */
    recipientName: text('recipient_name').notNull(),
    cargo: jsonb('cargo').notNull(),
    escort: text('escort').notNull(),
    /** loading, travelling, cancelled, delivered ou ambushed. */
    status: text('status').notNull(),
    sentAt: bigint('sent_at', { mode: 'number' }).notNull(),
    departedAt: bigint('departed_at', { mode: 'number' }).notNull().default(0),
    arrivesAt: bigint('arrives_at', { mode: 'number' }).notNull().default(0),
    /** Heure de la livraison ou de l'attaque, une fois constatée. */
    endedAt: bigint('ended_at', { mode: 'number' }),
  },
  (t) => [
    index('caravans_sender_idx').on(t.senderId),
    index('caravans_recipient_idx').on(t.recipientId),
  ],
)

/**
 * Villages vers lesquels une caravane peut être envoyée, tenus à jour à partir des événements
 * de fondation publiés par le Village.
 */
export const destinations = caravan.table('destinations', {
  playerId: text('player_id').primaryKey(),
  villageName: text('village_name').notNull(),
})
