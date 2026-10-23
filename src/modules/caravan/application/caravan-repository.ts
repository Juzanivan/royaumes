import type { NewMessage } from '@/platform/outbox/outbox'
import type { CaravanEvent, CaravanState } from '../domain/caravan'

/** Port de persistance des caravanes, défini par la couche application. */
export interface CaravanRepository {
  /** Charge l'état d'une caravane, reconstruit à partir de ses événements, et sa version. */
  load(caravanId: string): Promise<{ state: CaravanState; version: number }>

  /**
   * Enregistre de nouveaux événements, et les messages de la saga qu'ils déclenchent, dans une
   * même transaction. Une ConcurrencyError est levée en cas de conflit de version.
   */
  save(
    caravanId: string,
    expectedVersion: number,
    events: CaravanEvent[],
    messages: NewMessage[],
  ): Promise<void>
}
