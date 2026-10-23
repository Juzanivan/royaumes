/**
 * Entrée publique « serveur » du module Caravane.
 * Avec contracts.ts et ui.tsx, c'est le seul fichier du module qui peut être
 * importé depuis l'extérieur.
 */
import type { Db } from '@/platform/db/client'
import type { EventStore } from '@/platform/event-store/event-store'
import type { ProjectionRunner } from '@/platform/projection/projection'
import type { ChannelPolicy } from '@/platform/realtime/channel-policy'
import { createCaravanApi } from './api'
import { createCaravanService } from './application/caravan-service'
import { CARAVAN_STREAM_PREFIX } from './contracts'
import { createDrizzleCaravansReader } from './infrastructure/drizzle-caravans-reader'
import { createEventStoreCaravanRepository } from './infrastructure/event-store-caravan-repository'
import { createCaravanHandlers } from './messages'
import { createCaravanPersonalData } from './personal-data'

export interface CaravanModuleDeps {
  /** Journal d'événements de la plateforme. */
  store: EventStore
  /** Base de données, dans laquelle le module tient la liste des caravanes et des destinations. */
  db: Db
  /** Moteur des projections de la plateforme. */
  projections: ProjectionRunner
  /** Distribution de la boîte d'envoi, déclenchée après les commandes et les lectures. */
  dispatch: () => Promise<unknown>
  /** Horloge de référence ; l'heure réelle par défaut. */
  clock?: () => number
  /** Graine des brigands d'une nouvelle caravane ; aléatoire par défaut, choisie dans les tests. */
  newSeed?: () => number
}

/**
 * Fabrique du module : assemble les adaptateurs, le service, l'API, la règle du canal
 * et les gestionnaires de messages.
 */
export function createCaravanModule({
  store,
  db,
  projections,
  dispatch,
  clock,
  newSeed,
}: CaravanModuleDeps) {
  const repo = createEventStoreCaravanRepository(store)
  const reader = createDrizzleCaravansReader(db, projections)
  const service = createCaravanService(repo, reader, { dispatch, clock, newSeed })

  // Canal d'une caravane : il porte le nom de son flux, et n'est ouvert qu'à son expéditeur et
  // à son destinataire. Il est discret : les données de l'envoi contiennent la graine des
  // brigands, qui ne doit jamais être transmise. L'interface relit la vue à chaque annonce.
  const channelPolicy: ChannelPolicy = {
    prefix: CARAVAN_STREAM_PREFIX,
    redact: true,
    canSubscribe: async (channel, userId) => {
      const { state } = await repo.load(channel.slice(CARAVAN_STREAM_PREFIX.length))
      return state.exists && (state.senderId === userId || state.recipientId === userId)
    },
  }

  return {
    api: createCaravanApi(service),
    channelPolicy,
    handlers: createCaravanHandlers(service),
    personalData: createCaravanPersonalData(store, db),
  }
}

export type { CaravanApi } from './api'
