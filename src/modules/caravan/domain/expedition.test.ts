import { describe, expect, it } from 'vitest'
import {
  type CaravanCommand,
  type CaravanState,
  decide,
  evolve,
  initialState,
  outcomeOf,
} from './caravan'
import { CAVE_NAME, caveLoot } from './cave'
import { type Escort, EXPEDITION_MS, MAX_IN_TRANSIT, totalOf } from './rules'
import { requestsFor, type SagaRequest } from './saga'
import { toView } from './view'

const T0 = Date.UTC(2026, 0, 1)
const alice = { id: 'alice', name: 'Alice' }

/** Première graine pour laquelle une expédition revient bredouille, ou avec un butin. */
function seedWhere(empty: boolean, escort: Escort = 'none') {
  for (let seed = 1; ; seed++)
    if ((totalOf(caveLoot({ seed, escort })) === 0) === empty) return seed
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

const explore = (overrides: Partial<Extract<CaravanCommand, { type: 'SendExpedition' }>> = {}) =>
  ({
    type: 'SendExpedition',
    caravanId: 'e1',
    sender: alice,
    escort: 'none',
    seed: 1,
    inTransit: 0,
    ...overrides,
  }) satisfies CaravanCommand

const withdrawn: CaravanCommand = {
  type: 'RecordTransferResult',
  transferId: 'e1:load',
  outcome: 'withdrawn',
}

/** Expédition partie à T0, avec une graine choisie. */
function departed(seed: number, escort: Escort = 'none') {
  return play(play(initialState, explore({ seed, escort })).state, withdrawn).state
}

describe('Caravane - les expéditions vers la grotte (règles 13 à 17)', () => {
  it("prélève les provisions et le prix de l'escorte au départ, vers la grotte (règle 13)", () => {
    const { state, requests } = play(initialState, explore({ escort: 'knights' }))
    expect(state).toMatchObject({ mission: 'expedition', recipientName: CAVE_NAME })
    expect(requests).toEqual([
      {
        kind: 'withdraw',
        transferId: 'e1:load',
        playerId: 'alice',
        resources: { wood: 30, gold: 50 },
      },
    ])
  })

  it('compte dans la limite des caravanes en route, et refuse une escorte inconnue', () => {
    const tooMany = decide(initialState, explore({ inTransit: MAX_IN_TRANSIT }), T0)
    expect(tooMany).toEqual({ ok: false, error: { code: 'TOO_MANY_CARAVANS', max: 3 } })
    const invalid = decide(initialState, explore({ escort: 'dragons' as Escort }), T0)
    expect(invalid).toEqual({ ok: false, error: { code: 'INVALID_ESCORT' } })
  })

  it('est annulée si le village ne dispose pas des provisions', () => {
    const sent = play(initialState, explore()).state
    const { state, requests } = play(sent, {
      type: 'RecordTransferResult',
      transferId: 'e1:load',
      outcome: 'refused',
      missing: { wood: 12 },
    })
    expect(state.status).toBe('cancelled')
    expect(requests).toEqual([])
  })

  it('revient deux minutes après son départ, et jamais attaquée par les brigands (règle 14)', () => {
    const state = departed(seedWhere(false))
    expect(state.arrivesAt).toBe(T0 + EXPEDITION_MS)
    expect(outcomeOf(state)).toEqual({ kind: 'arrival', at: T0 + EXPEDITION_MS })
    expect(decide(state, { type: 'ResolveDue' }, T0 + EXPEDITION_MS - 1)).toEqual({
      ok: false,
      error: { code: 'NOT_DUE' },
    })
  })

  it('ne révèle pas son butin avant son retour (règle 16)', () => {
    const state = departed(seedWhere(false))
    expect(play(state, { type: 'Resolve' }, T0 + EXPEDITION_MS - 1).events).toEqual([])
    const view = toView(state, 'alice')
    expect(view).toMatchObject({ mission: 'expedition', status: 'travelling', loot: null })
    expect(view).not.toHaveProperty('seed')
  })

  it("verse le butin de la grotte à l'expéditeur, une seule fois (règle 17)", () => {
    const seed = seedWhere(false, 'knights')
    const loot = caveLoot({ seed, escort: 'knights' })
    const back = play(departed(seed, 'knights'), { type: 'Resolve' }, T0 + EXPEDITION_MS + 5_000)
    expect(back.events).toEqual([
      { type: 'ExpeditionReturned', data: { at: T0 + EXPEDITION_MS, loot } },
    ])
    expect(back.requests).toEqual([
      { kind: 'deposit', transferId: 'e1:loot', playerId: 'alice', resources: loot },
    ])
    expect(toView(back.state, 'alice')?.loot).toEqual(loot)
    // Un second constat, ou le rappel différé, n'a plus d'effet.
    expect(play(back.state, { type: 'Resolve' }, T0 + EXPEDITION_MS * 2).events).toEqual([])
    expect(play(back.state, { type: 'ResolveDue' }, T0 + EXPEDITION_MS * 2).events).toEqual([])
  })

  it('revient bredouille sans rien verser, et reste réservée à son expéditeur', () => {
    const back = play(departed(seedWhere(true)), { type: 'Resolve' }, T0 + EXPEDITION_MS)
    expect(back.state.status).toBe('returned')
    expect(back.state.loot).toEqual({})
    expect(back.requests).toEqual([])
    expect(toView(back.state, 'bob')).toBeNull()
  })
})
