import { eq } from 'drizzle-orm'
import type { Db } from '@/platform/db/client'
import type { EventStore } from '@/platform/event-store/event-store'
import {
  ERASED_NAME,
  ERASED_VILLAGE,
  type PersonalDataContributor,
} from '@/platform/privacy/privacy'
import { CARAVAN_STREAM_PREFIX } from './contracts'
import { type CaravanEvent, replay } from './domain/caravan'
import { toView } from './domain/view'
import { caravans, destinations } from './infrastructure/schema'

/**
 * Données personnelles de la Caravane : l'identifiant et le nom de l'expéditeur, et
 * l'identifiant et le nom du village du destinataire, copiés dans l'événement d'envoi de
 * chaque caravane et dans le modèle de lecture.
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

    redact(event, playerId) {
      if (!event.stream.startsWith(CARAVAN_STREAM_PREFIX) || event.type !== 'CaravanSent') {
        return null
      }
      const data = { ...event.data }
      if (data.senderId === playerId) data.senderName = ERASED_NAME
      if (data.recipientId === playerId) data.recipientName = ERASED_VILLAGE
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
        .where(eq(caravans.recipientId, playerId))
      await db.delete(destinations).where(eq(destinations.playerId, playerId))
    },
  }
}
