import { eq } from 'drizzle-orm'
import { VILLAGE_CHANNEL_PREFIX } from '@/modules/realm/contracts'
import type { StoredEvent } from '@/platform/event-store/event-store'
import { ERASED_VILLAGE } from '@/platform/privacy/privacy'
import type { Projection } from '@/platform/projection/projection'
import { CARAVAN_STREAM_PREFIX } from '../contracts'
import type { CaravanEvent } from '../domain/caravan'
import { caravans, destinations } from './schema'

/*
 * Événement du Village lu par la Caravane : il fait partie du « langage publié » du Village,
 * dont la Caravane dépend comme tout lecteur du journal. Seul le champ utile est décrit.
 */
interface VillageFoundedData {
  name: string
}

/** Identifiant tiré du nom d'un flux : « caravan-7f3a » donne « 7f3a ». */
const idFrom = (event: StoredEvent, prefix: string) => event.stream.slice(prefix.length)

/**
 * Projection de la Caravane : la liste des caravanes, à partir des événements du module, et
 * celle des destinations, à partir des fondations de villages.
 */
export const caravansProjection: Projection = {
  name: 'caravans',
  version: 1,
  eventTypes: [
    'VillageFounded',
    'CaravanSent',
    'CaravanCancelled',
    'CaravanDeparted',
    'CaravanAmbushed',
    'CaravanDelivered',
  ],

  async apply(stored, tx) {
    if (stored.type === 'VillageFounded') {
      if (!stored.stream.startsWith(VILLAGE_CHANNEL_PREFIX)) return
      const { name } = stored.data as unknown as VillageFoundedData
      // Le village d'un joueur effacé n'est plus une destination, même après une reconstruction.
      if (name === ERASED_VILLAGE) return
      const playerId = idFrom(stored, VILLAGE_CHANNEL_PREFIX)
      await tx
        .insert(destinations)
        .values({ playerId, villageName: name })
        .onConflictDoUpdate({ target: destinations.playerId, set: { villageName: name } })
      return
    }

    if (!stored.stream.startsWith(CARAVAN_STREAM_PREFIX)) return
    const caravanId = idFrom(stored, CARAVAN_STREAM_PREFIX)
    const event = { type: stored.type, data: stored.data } as CaravanEvent
    const update = (values: Partial<typeof caravans.$inferInsert>) =>
      tx.update(caravans).set(values).where(eq(caravans.caravanId, caravanId))

    switch (event.type) {
      case 'CaravanSent':
        // La graine des brigands n'est pas recopiée : elle ne quitte jamais le journal.
        await tx.insert(caravans).values({
          caravanId,
          senderId: event.data.senderId,
          senderName: event.data.senderName,
          recipientId: event.data.recipientId,
          recipientName: event.data.recipientName,
          cargo: event.data.cargo,
          escort: event.data.escort,
          status: 'loading',
          sentAt: event.data.at,
        })
        return
      case 'CaravanCancelled':
        await update({ status: 'cancelled', endedAt: event.data.at })
        return
      case 'CaravanDeparted':
        await update({
          status: 'travelling',
          departedAt: event.data.at,
          arrivesAt: event.data.arrivesAt,
        })
        return
      case 'CaravanAmbushed':
        await update({ status: 'ambushed', endedAt: event.data.at })
        return
      case 'CaravanDelivered':
        await update({ status: 'delivered', endedAt: event.data.at })
        return
    }
  },

  async reset(tx) {
    await tx.delete(caravans)
    await tx.delete(destinations)
  },
}
