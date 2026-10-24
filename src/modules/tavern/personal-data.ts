import { asc, eq } from 'drizzle-orm'
import type { Db } from '@/platform/db/client'
import type { PersonalDataContributor } from '@/platform/privacy/privacy'
import { messages, presence } from './infrastructure/schema'

/**
 * Données personnelles de la Taverne : les messages du joueur et sa présence.
 * La Taverne n'enregistre pas d'événements : l'effacement est une simple suppression, et la
 * rectification une simple mise à jour.
 */
export function createTavernPersonalData(db: Db): PersonalDataContributor {
  return {
    name: 'tavern',

    async export(playerId) {
      return {
        messages: await db
          .select({ body: messages.body, postedAt: messages.postedAt })
          .from(messages)
          .where(eq(messages.authorId, playerId))
          .orderBy(asc(messages.id)),
        presence: await db
          .select({ lastSeen: presence.lastSeen })
          .from(presence)
          .where(eq(presence.playerId, playerId)),
      }
    },

    async erase(playerId) {
      await db.delete(messages).where(eq(messages.authorId, playerId))
      await db.delete(presence).where(eq(presence.playerId, playerId))
    },

    // Droit de rectification : les messages et la présence du joueur portent son nouveau nom.
    async rename(playerId, name) {
      await db.update(messages).set({ authorName: name }).where(eq(messages.authorId, playerId))
      await db.update(presence).set({ playerName: name }).where(eq(presence.playerId, playerId))
    },
  }
}
