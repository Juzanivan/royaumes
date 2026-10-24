import { and, eq, ne } from 'drizzle-orm'
import type { Db } from '@/platform/db/client'
import type { EventStore } from '@/platform/event-store/event-store'
import {
  ERASED_NAME,
  ERASED_VILLAGE,
  ERASURE,
  type PersonalDataContributor,
} from '@/platform/privacy/privacy'
import { CARAVAN_STREAM_PREFIX } from './contracts'
import { type CaravanEvent, replay } from './domain/caravan'
import { toView } from './domain/view'
import { caravans, destinations } from './infrastructure/schema'

/**
 * Données personnelles de la Caravane : l'identifiant et le nom de l'expéditeur, et
 * l'identifiant et le nom du village du destinataire, copiés dans l'événement d'envoi de
 * chaque caravane et dans le modèle de lecture ; celui de l'expéditeur, pour une expédition.
 */
export function createCaravanPersonalData(store: EventStore, db: Db): PersonalDataContributor {
  return {
    name: 'caravan',

    /**
     * Les caravanes envoyées et reçues par le joueur, telles que sa vue les présente : sans la
     * graine des brigands, et sans l'issue d'un voyage qui n'a pas encore été constatée.
     */
    async export(playerId) {
      const stored = await store.readAll({ streamPrefix: CARAVAN_STREAM_PREFIX })
      const streams = new Map<string, CaravanEvent[]>()
      for (const event of stored) {
        const events = streams.get(event.stream) ?? []
        events.push({ type: event.type, data: event.data } as CaravanEvent)
        streams.set(event.stream, events)
      }
      return [...streams.values()]
        .map((events) => toView(replay(events), playerId))
        .filter((view) => view !== null)
    },

    // Le nom de l'expéditeur est remplacé ; le nom du village du destinataire ne l'est que par
    // l'effacement, une rectification ne portant que sur le nom du joueur.
    redact(event, playerId, { name, village } = ERASURE) {
      if (!event.stream.startsWith(CARAVAN_STREAM_PREFIX)) return null
      if (event.type === 'ExpeditionSent') {
        const own = event.data.senderId === playerId && event.data.senderName !== name
        return own ? { ...event.data, senderName: name } : null
      }
      if (event.type !== 'CaravanSent') return null
      const data = { ...event.data }
      if (data.senderId === playerId) data.senderName = name
      if (village && data.recipientId === playerId) data.recipientName = village
      const changed =
        data.senderName !== event.data.senderName || data.recipientName !== event.data.recipientName
      return changed ? data : null
    },

    // Les tables tenues par la projection contiennent les mêmes noms ; le village du joueur
    // effacé cesse d'être une destination.
    async erase(playerId) {
      await db
        .update(caravans)
        .set({ senderName: ERASED_NAME })
        .where(eq(caravans.senderId, playerId))
      await db
        .update(caravans)
        .set({ recipientName: ERASED_VILLAGE })
        // Une expédition n'a pas d'autre destinataire que la grotte, dont le nom reste.
        .where(and(eq(caravans.recipientId, playerId), ne(caravans.senderId, playerId)))
      await db.delete(destinations).where(eq(destinations.playerId, playerId))
    },

    // Droit de rectification : le nouveau nom de l'expéditeur, dans la liste des caravanes.
    async rename(playerId, name) {
      await db.update(caravans).set({ senderName: name }).where(eq(caravans.senderId, playerId))
    },
  }
}
