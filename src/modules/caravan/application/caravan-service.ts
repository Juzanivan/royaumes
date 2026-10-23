import { REALM_TOPICS } from '@/modules/realm/contracts'
import { withOptimisticRetry } from '@/platform/event-store/retry'
import type { NewMessage } from '@/platform/outbox/outbox'
import { CARAVAN_TOPICS, type CaravanList } from '../contracts'
import {
  type CaravanCommand,
  type CaravanError,
  type CaravanEvent,
  type CaravanState,
  decide,
  evolve,
} from '../domain/caravan'
import type { Cargo, Escort } from '../domain/rules'
import { requestsFor, type SagaRequest } from '../domain/saga'
import { type CaravanView, toView } from '../domain/view'
import type { CaravanRepository } from './caravan-repository'
import type { CaravansReader } from './caravans-reader'

/** Vue d'une caravane, avec l'heure du serveur ; ou l'erreur métier. */
export type CommandResult =
  | { ok: true; view: CaravanView; now: number }
  | { ok: false; error: CaravanError }

/** Joueur à l'origine d'une commande. */
export interface Player {
  id: string
  name: string
}

/** Envoi demandé par un joueur. */
export interface SendRequest {
  recipientId: string
  cargo: Cargo
  escort: Escort
}

export interface CaravanServiceOptions {
  /** Distribution de la boîte d'envoi, déclenchée après chaque commande et chaque consultation. */
  dispatch: () => Promise<unknown>
  /** Horloge de référence ; l'heure réelle par défaut. */
  clock?: () => number
  /** Identifiant d'une nouvelle caravane ; un UUID aléatoire par défaut. */
  newId?: () => string
  /** Graine des brigands d'une nouvelle caravane ; un entier aléatoire sur 32 bits par défaut. */
  newSeed?: () => number
}

/** Traduit une demande de la saga en message de la boîte d'envoi. */
function toMessage(request: SagaRequest, now: number): NewMessage {
  switch (request.kind) {
    case 'withdraw':
      return {
        topic: REALM_TOPICS.withdraw,
        payload: {
          transferId: request.transferId,
          playerId: request.playerId,
          resources: request.resources,
          // Adresse de retour : la réponse du Village fera progresser la saga.
          replyTo: CARAVAN_TOPICS.transferResult,
        },
      }
    case 'deposit':
      return {
        topic: REALM_TOPICS.deposit,
        payload: {
          transferId: request.transferId,
          playerId: request.playerId,
          resources: request.resources,
        },
      }
    case 'resolve':
      return {
        topic: CARAVAN_TOPICS.resolve,
        payload: { caravanId: request.caravanId },
        delayMs: Math.max(0, request.at - now),
      }
  }
}

/** Messages déclenchés par une suite d'événements, appliqués un à un à l'état de la caravane. */
function messagesFor(state: CaravanState, events: CaravanEvent[], now: number): NewMessage[] {
  const messages: NewMessage[] = []
  let current = state
  for (const event of events) {
    current = evolve(current, event)
    for (const request of requestsFor(current, event)) messages.push(toMessage(request, now))
  }
  return messages
}

/**
 * Service applicatif de la Caravane : orchestrateur de la saga avec le Village. Chaque
 * décision est enregistrée avec les messages qu'elle déclenche, dans une même transaction.
 *
 * L'issue d'un voyage est constatée sans tâche de fond : à la première lecture qui dépasse
 * son heure, ou à défaut par le rappel différé programmé au départ.
 */
export function createCaravanService(
  repo: CaravanRepository,
  reader: CaravansReader,
  {
    dispatch,
    clock = () => Date.now(),
    newId = () => crypto.randomUUID(),
    newSeed = () => crypto.getRandomValues(new Uint32Array(1))[0],
  }: CaravanServiceOptions,
) {
  /**
   * Décide et enregistre une commande sur une caravane, avec les messages de la saga. En cas
   * de conflit de version, l'ensemble est rejoué sur l'état à jour : deux lectures simultanées
   * ne peuvent pas constater deux fois la même issue (règle 11).
   */
  function process(caravanId: string, command: CaravanCommand) {
    return withOptimisticRetry(async () => {
      const { state, version } = await repo.load(caravanId)
      const now = clock()
      const decision = decide(state, command, now)
      if (!decision.ok || decision.events.length === 0) return decision
      await repo.save(caravanId, version, decision.events, messagesFor(state, decision.events, now))
      return decision
    })
  }

  /** Vue d'une caravane pour un joueur, avec l'heure du serveur. */
  async function viewOf(caravanId: string, viewerId: string): Promise<CommandResult> {
    const { state } = await repo.load(caravanId)
    const view = toView(state, viewerId)
    return view
      ? { ok: true, view, now: clock() }
      : { ok: false, error: { code: 'CARAVAN_NOT_FOUND' } }
  }

  /**
   * Constate l'issue des caravanes en route d'un joueur dont l'heure est passée, puis
   * distribue la boîte d'envoi : les versements de ressources suivent aussitôt.
   */
  async function resolveFor(viewerId: string) {
    const travelling = (await reader.list(viewerId)).filter((c) => c.status === 'travelling')
    let resolved = false
    for (const { caravanId } of travelling) {
      const decision = await process(caravanId, { type: 'Resolve' })
      if (decision.ok && decision.events.length > 0) resolved = true
    }
    await dispatch()
    return resolved
  }

  /**
   * Envoie une caravane au nom d'un joueur. Dans le cas ordinaire, la saga a progressé
   * jusqu'au départ, ou jusqu'à l'annulation, lorsque la vue est renvoyée.
   */
  async function send(player: Player, { recipientId, cargo, escort }: SendRequest) {
    // Les caravanes arrivées libèrent leur place avant le décompte de la règle 3.
    await resolveFor(player.id)
    const caravanId = newId()
    // DETTE TECHNIQUE DT-016 (docs/qualite/dette-technique.md) : le décompte des caravanes en
    // route est lu avant l'envoi, hors de la transaction ; deux envois simultanés peuvent
    // ensemble dépasser la limite de trois caravanes.
    const decision = await process(caravanId, {
      type: 'SendCaravan',
      caravanId,
      sender: player,
      recipient: await reader.destination(recipientId),
      cargo,
      escort,
      seed: newSeed(),
      inTransit: await reader.inTransit(player.id),
    })
    if (!decision.ok) return { caravanId, result: decision as CommandResult }
    await dispatch()
    return { caravanId, result: await viewOf(caravanId, player.id) }
  }

  /** Vue d'une caravane : son issue est d'abord constatée, si son heure est passée. */
  async function getView(caravanId: string, viewerId: string): Promise<CommandResult> {
    const { state } = await repo.load(caravanId)
    // La caravane d'un autre joueur n'est ni constatée, ni présentée.
    if (!toView(state, viewerId)) return { ok: false, error: { code: 'CARAVAN_NOT_FOUND' } }
    await process(caravanId, { type: 'Resolve' })
    await dispatch()
    return viewOf(caravanId, viewerId)
  }

  /** Caravanes envoyées et reçues par un joueur, une fois constatées celles qui sont arrivées. */
  async function list(viewerId: string): Promise<CaravanList> {
    await resolveFor(viewerId)
    return { now: clock(), caravans: await reader.list(viewerId) }
  }

  /** Villages vers lesquels un joueur peut envoyer une caravane. */
  const destinations = (viewerId: string) => reader.destinations(viewerId)

  /**
   * Étape de la saga, déclenchée par un message. Une erreur métier y est une anomalie, ou une
   * échéance pas encore atteinte : elle est levée, et le message sera retenté.
   */
  async function step(caravanId: string, command: CaravanCommand) {
    const decision = await process(caravanId, command)
    if (!decision.ok) throw new Error(`Caravane ${caravanId} : ${decision.error.code}`)
  }

  return { send, getView, list, destinations, step }
}

/** Type du service, déduit de sa fabrique. */
export type CaravanService = ReturnType<typeof createCaravanService>
