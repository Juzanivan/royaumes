import type { EventStore, NewEvent } from '@/platform/event-store/event-store'
import type { CaravanRepository } from '../application/caravan-repository'
import { caravanStream } from '../contracts'
import { type CaravanEvent, replay } from '../domain/caravan'

/** Adaptateur du port CaravanRepository fondé sur le journal d'événements. */
export function createEventStoreCaravanRepository(store: EventStore): CaravanRepository {
  return {
    async load(caravanId) {
      const stored = await store.read(caravanStream(caravanId))
      const events = stored.map((e) => ({ type: e.type, data: e.data }) as CaravanEvent)
      return { state: replay(events), version: stored.at(-1)?.version ?? 0 }
    },

    async save(caravanId, expectedVersion, events, messages) {
      // Les événements de la caravane et les messages de la saga : une seule transaction.
      await store.append(
        caravanStream(caravanId),
        expectedVersion,
        events as unknown as NewEvent[],
        messages,
      )
    },
  }
}
