import { describe, expect, it } from 'vitest'
import { brigandsPlan } from './brigands'
import {
  type CaravanCommand,
  type CaravanState,
  decide,
  evolve,
  initialState,
  outcomeOf,
} from './caravan'
import {
  BASE_TRAVEL_MS,
  CARAVAN_CAPACITY,
  type Cargo,
  type Escort,
  MAX_IN_TRANSIT,
  splitLoot,
  totalOf,
} from './rules'
import { requestsFor, type SagaRequest } from './saga'
import { toView } from './view'

const T0 = Date.UTC(2026, 0, 1)
const alice = { id: 'alice', name: 'Alice' }
const bob = { id: 'bob', name: 'Bob' }

/** Première graine pour laquelle les brigands attaquent, ou n'attaquent pas, une caravane. */
function seedWhere(attack: boolean, cargo: Cargo, escort: Escort = 'none') {
  for (let seed = 1; ; seed++)
    if (brigandsPlan({ cargo, escort, seed }).attack === attack) return seed
}

/** Applique une commande acceptée ; renvoie le nouvel état, ses événements et les demandes. */
function play(state: CaravanState, command: CaravanCommand, now = T0) {
  const decision = decide(state, command, now)
  if (!decision.ok) throw new Error(decision.error.code)
  let current = state
  const requests: SagaRequest[] = []
  for (const event of decision.events) {
    current = evolve(current, event)
    requests.push(...requestsFor(current, event))
  }
  return { state: current, events: decision.events, requests }
}

const send = (overrides: Partial<Extract<CaravanCommand, { type: 'SendCaravan' }>> = {}) =>
  ({
    type: 'SendCaravan',
    caravanId: 'c1',
    sender: alice,
    recipient: bob,
    cargo: { wood: 100, gold: 20 },
    escort: 'none',
    seed: 1,
    inTransit: 0,
    ...overrides,
  }) satisfies CaravanCommand

const loaded = (outcome: 'withdrawn' | 'refused', missing?: Cargo): CaravanCommand => ({
  type: 'RecordTransferResult',
  transferId: 'c1:load',
  outcome,
  missing,
})

/** Caravane partie à T0, avec une issue choisie. */
function departed(attack: boolean, cargo: Cargo = { wood: 100, gold: 20 }) {
  const seed = seedWhere(attack, cargo)
  const sent = play(initialState, send({ cargo, seed })).state
  return play(sent, loaded('withdrawn')).state
}

const errorOf = (state: CaravanState, command: CaravanCommand, now = T0) => {
  const decision = decide(state, command, now)
  return decision.ok ? null : decision.error.code
}

describe("Caravane - l'envoi (règles 1 à 3, et 6)", () => {
  it("refuse d'envoyer une caravane vers son propre village, ou vers un joueur sans village", () => {
    expect(errorOf(initialState, send({ recipient: alice }))).toBe('OWN_VILLAGE')
    expect(errorOf(initialState, send({ recipient: null }))).toBe('UNKNOWN_RECIPIENT')
  })

  it('refuse une cargaison vide, non entière, négative ou faite d’autres ressources', () => {
    for (const cargo of [{}, { wood: 0 }, { wood: -5 }, { wood: 2.5 }, { iron: 10 }]) {
      expect(errorOf(initialState, send({ cargo: cargo as Cargo }))).toBe('EMPTY_CARGO')
    }
  })

  it('refuse une cargaison qui dépasse la capacité de 500 unités, et accepte la capacité exacte', () => {
    expect(errorOf(initialState, send({ cargo: { wood: 300, stone: 201 } }))).toBe('OVER_CAPACITY')
    expect(errorOf(initialState, send({ cargo: { wood: 300, stone: 200 } }))).toBeNull()
    expect(CARAVAN_CAPACITY).toBe(500)
  })

  it('refuse une quatrième caravane en route', () => {
    expect(errorOf(initialState, send({ inTransit: MAX_IN_TRANSIT - 1 }))).toBeNull()
    expect(errorOf(initialState, send({ inTransit: MAX_IN_TRANSIT }))).toBe('TOO_MANY_CARAVANS')
  })

  it('refuse une escorte inconnue, et un second envoi de la même caravane', () => {
    expect(errorOf(initialState, send({ escort: 'army' as Escort }))).toBe('INVALID_ESCORT')
    const sent = play(initialState, send()).state
    expect(errorOf(sent, send())).toBe('ALREADY_EXISTS')
  })
})

describe('Caravane - le chargement (règles 4 à 6)', () => {
  it("prélève la cargaison et le prix de l'escorte avant le départ", () => {
    const { state, requests } = play(initialState, send({ escort: 'knights' }))
    expect(state.status).toBe('loading')
    expect(requests).toEqual([
      {
        kind: 'withdraw',
        transferId: 'c1:load',
        playerId: 'alice',
        resources: { wood: 100, gold: 70 },
      },
    ])
    // Les gardes coûtent 20 pièces d'or, même pour une cargaison sans or.
    const guarded = play(initialState, send({ cargo: { stone: 50 }, escort: 'guards' }))
    expect(guarded.requests[0]).toMatchObject({ resources: { stone: 50, gold: 20 } })
  })

  it("annule la caravane si le village de l'expéditeur ne dispose pas des ressources", () => {
    const sent = play(initialState, send()).state
    const { state, requests } = play(sent, loaded('refused', { gold: 15 }))
    expect(state).toMatchObject({ status: 'cancelled', missing: { gold: 15 } })
    expect(requests).toEqual([])
  })

  it("fixe l'heure d'arrivée au départ : 60 s plus 1 s par tranche de 10 unités", () => {
    const sent = play(initialState, send({ cargo: { wood: 255 } })).state
    const { state, requests } = play(sent, loaded('withdrawn'), T0 + 500)
    expect(state).toMatchObject({
      status: 'travelling',
      departedAt: T0 + 500,
      arrivesAt: T0 + 500 + BASE_TRAVEL_MS + 25_000,
    })
    expect(requests).toEqual([{ kind: 'resolve', caravanId: 'c1', at: outcomeOf(state).at }])
  })
})

describe("Caravane - l'issue du voyage (règles 7 à 11)", () => {
  it("livre toute la cargaison au destinataire à l'heure d'arrivée, et pas avant", () => {
    const state = departed(false)
    expect(play(state, { type: 'Resolve' }, state.arrivesAt - 1).events).toEqual([])
    expect(errorOf(state, { type: 'ResolveDue' }, state.arrivesAt - 1)).toBe('NOT_DUE')
    const { state: after, events, requests } = play(state, { type: 'Resolve' }, state.arrivesAt + 9)
    expect(after.status).toBe('delivered')
    // L'événement porte l'heure prévue, et non celle du constat.
    expect(events).toEqual([{ type: 'CaravanDelivered', data: { at: state.arrivesAt } }])
    expect(requests).toEqual([
      { kind: 'deposit', transferId: 'c1:deliver', playerId: 'bob', resources: state.cargo },
    ])
  })

  it("attaque la caravane entre 30 % et 80 % du trajet, et rend le reste à l'expéditeur", () => {
    const state = departed(true, { wood: 101, stone: 40, gold: 1 })
    const ambush = outcomeOf(state)
    const duration = state.arrivesAt - state.departedAt
    expect(ambush.kind).toBe('ambush')
    expect(ambush.at).toBeGreaterThanOrEqual(state.departedAt + 0.3 * duration)
    expect(ambush.at).toBeLessThanOrEqual(state.departedAt + 0.8 * duration)

    expect(play(state, { type: 'Resolve' }, ambush.at - 1).events).toEqual([])
    const { state: after, requests } = play(state, { type: 'Resolve' }, ambush.at)
    // La moitié de chaque ressource, arrondie à l'entier inférieur, est perdue.
    expect(after).toMatchObject({
      status: 'ambushed',
      ambushedAt: ambush.at,
      stolen: { wood: 50, stone: 20 },
      returned: { wood: 51, stone: 20, gold: 1 },
    })
    expect(requests).toEqual([
      {
        kind: 'deposit',
        transferId: 'c1:return',
        playerId: 'alice',
        resources: { wood: 51, stone: 20, gold: 1 },
      },
    ])
  })

  it("donne toujours la même issue à une même caravane, quel que soit l'instant du constat", () => {
    const state = departed(true)
    const due = outcomeOf(state).at
    const early = play(state, { type: 'Resolve' }, due).events
    const late = play(state, { type: 'Resolve' }, due + 3_600_000).events
    expect(late).toEqual(early)
  })

  it('ne crée aucune ressource : la cargaison est livrée, ou partagée entre volé et rendu', () => {
    for (const cargo of [{ wood: 1 }, { wood: 77, stone: 3, gold: 499 - 80 }, { gold: 9 }]) {
      const { stolen, returned } = splitLoot(cargo)
      expect(totalOf(stolen) + totalOf(returned)).toBe(totalOf(cargo))
      for (const resource of ['wood', 'stone', 'gold'] as const) {
        expect((stolen[resource] ?? 0) + (returned[resource] ?? 0)).toBe(cargo[resource] ?? 0)
      }
    }
  })

  it("n'applique l'issue qu'une fois, malgré les constats répétés et les messages en double", () => {
    const state = departed(false)
    const delivered = play(state, { type: 'Resolve' }, state.arrivesAt).state
    expect(play(delivered, { type: 'Resolve' }, state.arrivesAt + 1).events).toEqual([])
    expect(play(delivered, { type: 'ResolveDue' }, state.arrivesAt + 1).events).toEqual([])
    // Une réponse du Village en double, ou tardive, ne fait rien.
    expect(play(delivered, loaded('withdrawn')).events).toEqual([])
    expect(play(state, loaded('withdrawn')).events).toEqual([])
  })
})

describe('Caravane - la vue (règles 7 et 12)', () => {
  it("n'est présentée qu'à l'expéditeur et au destinataire", () => {
    const state = departed(false)
    expect(toView(state, 'alice')?.role).toBe('sender')
    expect(toView(state, 'bob')?.role).toBe('recipient')
    expect(toView(state, 'carol')).toBeNull()
  })

  it("ne révèle ni la graine, ni l'attaque, avant qu'elle soit constatée", () => {
    const state = departed(true)
    const view = toView(state, 'alice')
    expect(view).not.toHaveProperty('seed')
    expect(view).toMatchObject({ status: 'travelling', ambushedAt: null, stolen: null })
    const after = play(state, { type: 'Resolve' }, outcomeOf(state).at).state
    expect(toView(after, 'bob')).toMatchObject({ status: 'ambushed', stolen: after.stolen })
  })

  it("ne présente les ressources manquantes d'une caravane annulée qu'à son expéditeur", () => {
    const sent = play(initialState, send()).state
    const cancelled = play(sent, loaded('refused', { gold: 15 })).state
    expect(toView(cancelled, 'alice')?.missing).toEqual({ gold: 15 })
    expect(toView(cancelled, 'bob')?.missing).toBeNull()
  })
})
