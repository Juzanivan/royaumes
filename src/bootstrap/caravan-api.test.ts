import { sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import type {
  CaravanList,
  CaravanView,
  Cargo,
  Destination,
  Escort,
} from '@/modules/caravan/contracts'
import { brigandsPlan } from '@/modules/caravan/domain/brigands'
import { caveLoot } from '@/modules/caravan/domain/cave'
import type { Stock } from '@/modules/realm/contracts'
import { createTestApi, TEST_CRON_SECRET } from './testing'

type TestApi = Awaited<ReturnType<typeof createTestApi>>

/**
 * Application de test où Alice, Bob et Carol ont fondé leur village : chacun dispose de
 * 100 bois, 50 pierre et aucune pièce d'or. Carol ne reçoit ni n'envoie aucune caravane : son
 * stock sert de référence, car les villages produisent dès que le test fait avancer l'horloge.
 */
async function caravansWithVillages() {
  const api = await createTestApi()
  for (const [player, name] of [
    ['alice', 'Valombre'],
    ['bob', 'Roche-Haute'],
    ['carol', 'Bois-Dormant'],
  ]) {
    await api.post('/api/realm/village', { name }, player)
  }
  return api
}

/** Stock du village d'un joueur. */
async function stockOf(api: TestApi, player: string): Promise<Stock> {
  const res = await api.get('/api/realm/village', player)
  return ((await res.json()) as { view: { stock: Stock } }).view.stock
}

/** Écart entre le stock d'un joueur et celui de Carol, qui sert de référence. */
async function gapWithCarol(api: TestApi, player: string) {
  const [stock, carol] = await Promise.all([stockOf(api, player), stockOf(api, 'carol')])
  return {
    wood: stock.wood - carol.wood,
    stone: stock.stone - carol.stone,
    gold: stock.gold - carol.gold,
  }
}

/** Graine pour laquelle les brigands attaquent, ou épargnent, une caravane donnée. */
function seedWhere(attack: boolean, cargo: Cargo, escort: Escort = 'none') {
  for (let seed = 1; ; seed++)
    if (brigandsPlan({ cargo, escort, seed }).attack === attack) return seed
}

/** Envoie au nom d'Alice une caravane vers Bob ; renvoie la réponse et son corps. */
async function send(api: TestApi, body: Record<string, unknown> = {}, player = 'alice') {
  const res = await api.post(
    '/api/caravans',
    { recipientId: 'bob', cargo: { wood: 60, stone: 20 }, escort: 'none', ...body },
    player,
  )
  return { res, body: (await res.json()) as { caravanId: string; view: CaravanView; now: number } }
}

/** Vue d'une caravane pour un joueur. */
async function viewOf(api: TestApi, caravanId: string, player = 'alice') {
  const res = await api.get(`/api/caravans/${caravanId}`, player)
  return { res, view: ((await res.json()) as { view: CaravanView }).view }
}

describe('API du module Caravane', () => {
  it('refuse une requête anonyme (401)', async () => {
    const api = await createTestApi()
    expect((await api.get('/api/caravans', null)).status).toBe(401)
    expect((await api.get('/api/caravans/destinations', null)).status).toBe(401)
    expect((await api.get('/api/caravans/c1', null)).status).toBe(401)
    expect((await api.post('/api/caravans', {}, null)).status).toBe(401)
    expect((await api.post('/api/caravans/expeditions', {}, null)).status).toBe(401)
  })

  it('présente les villages des autres joueurs comme destinations', async () => {
    const api = await caravansWithVillages()
    const res = await api.get('/api/caravans/destinations')
    const { destinations } = (await res.json()) as { destinations: Destination[] }
    expect(destinations).toEqual([
      { playerId: 'carol', villageName: 'Bois-Dormant' },
      { playerId: 'bob', villageName: 'Roche-Haute' },
    ])
  })

  it('fait partir la caravane, et prélève sa cargaison dans le village de l’expéditeur', async () => {
    const api = await caravansWithVillages()
    const { res, body } = await send(api)
    expect(res.status).toBe(201)
    // La saga a progressé jusqu'au départ pendant la requête d'envoi.
    expect(body.view).toMatchObject({
      role: 'sender',
      senderName: 'alice',
      recipientName: 'Roche-Haute',
      status: 'travelling',
      departedAt: body.now,
      arrivesAt: body.now + 68_000,
      ambushedAt: null,
    })
    expect(body.view).not.toHaveProperty('seed')
    expect(await stockOf(api, 'alice')).toMatchObject({ wood: 40, stone: 30 })
  })

  it('valide le corps de la requête (400)', async () => {
    const api = await caravansWithVillages()
    for (const body of [
      { cargo: { wood: -5 } },
      { cargo: {} },
      { cargo: { wood: 10, iron: 3 } },
      { escort: 'army' },
      { recipientId: '' },
    ]) {
      expect((await send(api, body)).res.status).toBe(400)
    }
  })

  it('refuse un destinataire sans village, son propre village, et une cargaison trop lourde', async () => {
    const api = await caravansWithVillages()
    expect((await send(api, { recipientId: 'dave' })).body).toMatchObject({
      error: { code: 'UNKNOWN_RECIPIENT' },
    })
    expect((await send(api, { recipientId: 'alice' })).res.status).toBe(409)
    const heavy = await send(api, { cargo: { wood: 400, stone: 101 } })
    expect(heavy.res.status).toBe(409)
    expect(heavy.body).toMatchObject({ error: { code: 'OVER_CAPACITY', capacity: 500 } })
  })

  it("annule la caravane si l'expéditeur ne peut pas payer l'escorte, sans rien prélever", async () => {
    const api = await caravansWithVillages()
    const { body } = await send(api, { escort: 'guards' })
    expect(body.view).toMatchObject({ status: 'cancelled', missing: { gold: 20 } })
    expect(await stockOf(api, 'alice')).toMatchObject({ wood: 100, stone: 50, gold: 0 })
  })

  it("livre toute la cargaison au destinataire, à la première lecture après l'arrivée", async () => {
    const api = await caravansWithVillages()
    api.setCaravanSeed(seedWhere(false, { wood: 60, stone: 20 }))
    const { body } = await send(api)

    api.advance(1)
    expect((await viewOf(api, body.caravanId)).view.status).toBe('travelling')
    api.advance(1)
    const { view } = await viewOf(api, body.caravanId, 'bob')
    expect(view).toMatchObject({ role: 'recipient', status: 'delivered' })
    // Aucune ressource n'est créée : ce qu'Alice a perdu, Bob l'a reçu.
    expect(await gapWithCarol(api, 'bob')).toEqual({ wood: 60, stone: 20, gold: 0 })
    expect(await gapWithCarol(api, 'alice')).toEqual({ wood: -60, stone: -20, gold: 0 })
    // Le Classement, qui lit le langage publié de la Caravane, compte la livraison d'Alice.
    const { entries } = (await (await api.get('/api/ranking/players')).json()) as {
      entries: { playerId: string; caravans: number }[]
    }
    expect(entries.find((e) => e.playerId === 'alice')?.caravans).toBe(1)
    expect(entries.find((e) => e.playerId === 'bob')?.caravans ?? 0).toBe(0)
  })

  it("rend à l'expéditeur ce que les brigands ont laissé, et ne révèle l'attaque qu'à son heure", async () => {
    const api = await caravansWithVillages()
    const cargo = { wood: 61, stone: 20 }
    api.setCaravanSeed(seedWhere(true, cargo))
    const { body } = await send(api, { cargo })

    // Avant 30 % du trajet, aucune attaque n'a pu avoir lieu, et la vue n'en dit rien.
    const before = await viewOf(api, body.caravanId)
    expect(before.view).toMatchObject({ status: 'travelling', ambushedAt: null, stolen: null })

    api.advance(2)
    const { view } = await viewOf(api, body.caravanId)
    expect(view).toMatchObject({
      status: 'ambushed',
      stolen: { wood: 30, stone: 10 },
      returned: { wood: 31, stone: 10 },
    })
    expect(view.ambushedAt).toBeGreaterThanOrEqual(view.departedAt + 0.3 * 66_000)
    expect(view.ambushedAt).toBeLessThanOrEqual(view.departedAt + 0.8 * 66_000)
    expect(await gapWithCarol(api, 'alice')).toEqual({ wood: -30, stone: -10, gold: 0 })
    expect(await gapWithCarol(api, 'bob')).toEqual({ wood: 0, stone: 0, gold: 0 })
  })

  it("constate l'issue par le rappel différé, même si aucun joueur ne consulte la caravane", async () => {
    const api = await caravansWithVillages()
    api.setCaravanSeed(seedWhere(false, { wood: 60, stone: 20 }))
    await send(api)
    api.advance(2)
    await api.api.request('/api/cron/daily', {
      headers: { authorization: `Bearer ${TEST_CRON_SECRET}` },
    })
    expect(await gapWithCarol(api, 'bob')).toEqual({ wood: 60, stone: 20, gold: 0 })
  })

  it('refuse une quatrième caravane en route, puis accepte un envoi une fois une caravane arrivée', async () => {
    const api = await caravansWithVillages()
    for (let i = 0; i < 3; i++) {
      expect((await send(api, { cargo: { wood: 10 } })).body.view.status).toBe('travelling')
    }
    const fourth = await send(api, { cargo: { wood: 10 } })
    expect(fourth.res.status).toBe(409)
    expect(fourth.body).toMatchObject({ error: { code: 'TOO_MANY_CARAVANS', max: 3 } })
    api.advance(2)
    expect((await send(api, { cargo: { wood: 10 } })).res.status).toBe(201)
  })

  it("présente la caravane à l'expéditeur et au destinataire, et à eux seuls", async () => {
    const api = await caravansWithVillages()
    const { body } = await send(api)

    const forAlice = (await (await api.get('/api/caravans')).json()) as CaravanList
    expect(forAlice.caravans).toMatchObject([{ caravanId: body.caravanId, role: 'sender' }])
    const forBob = (await (await api.get('/api/caravans', 'bob')).json()) as CaravanList
    expect(forBob.caravans).toMatchObject([
      { caravanId: body.caravanId, role: 'recipient', senderName: 'alice' },
    ])
    const forCarol = (await (await api.get('/api/caravans', 'carol')).json()) as CaravanList
    expect(forCarol.caravans).toEqual([])

    expect((await viewOf(api, body.caravanId, 'carol')).res.status).toBe(404)
    expect((await api.get(`/api/stream/caravan-${body.caravanId}/events`, 'carol')).status).toBe(
      403,
    )
    const stream = await api.get(`/api/stream/caravan-${body.caravanId}/events`, 'bob')
    const { events } = (await stream.json()) as { events: { type: string; data: unknown }[] }
    // Le canal est discret : la graine contenue dans l'envoi n'est jamais transmise.
    expect(events[0]).toMatchObject({ type: 'CaravanSent' })
    expect(JSON.stringify(events)).not.toContain('seed')
  })

  it('exporte les caravanes du joueur, et efface son nom à la suppression de son compte', async () => {
    const api = await caravansWithVillages()
    const { body } = await send(api)

    const exported = await (await api.get('/api/account/export', 'bob')).json()
    expect(exported.sections.caravan).toMatchObject([
      { caravanId: body.caravanId, role: 'recipient' },
    ])

    await api.api.request('/api/account', { method: 'DELETE', headers: { 'x-test-user': 'bob' } })
    const rows = await api.db.execute(
      sql`SELECT data FROM platform.events WHERE stream = ${`caravan-${body.caravanId}`} AND type = 'CaravanSent'`,
    )
    const [sent] = (rows as unknown as { rows: { data: Record<string, unknown> }[] }).rows
    expect(sent.data).toMatchObject({ senderName: 'alice', recipientName: 'Village effacé' })
    const list = (await (await api.get('/api/caravans')).json()) as CaravanList
    expect(list.caravans[0].recipientName).toBe('Village effacé')
    const res = await api.get('/api/caravans/destinations')
    const { destinations } = (await res.json()) as { destinations: Destination[] }
    expect(destinations.map((d) => d.playerId)).toEqual(['carol'])
  })

  it("part en expédition vers la grotte, et ne verse le butin qu'à son retour", async () => {
    const api = await caravansWithVillages()
    const seed = (() => {
      for (let s = 1; ; s++) if (Object.keys(caveLoot({ seed: s, escort: 'none' })).length) return s
    })()
    const loot = caveLoot({ seed, escort: 'none' })
    api.setCaravanSeed(seed)
    const res = await api.post('/api/caravans/expeditions', { escort: 'none' })
    expect(res.status).toBe(201)
    const body = (await res.json()) as { caravanId: string; view: CaravanView; now: number }
    expect(body.view).toMatchObject({
      mission: 'expedition',
      status: 'travelling',
      arrivesAt: body.now + 120_000,
      loot: null,
    })
    expect(body.view).not.toHaveProperty('seed')
    // Les provisions sont prélevées au départ.
    expect(await gapWithCarol(api, 'alice')).toEqual({ wood: -30, stone: 0, gold: 0 })
    // L'expédition est réservée à son expéditeur, et validée.
    expect((await viewOf(api, body.caravanId, 'bob')).res.status).toBe(404)
    expect((await api.post('/api/caravans/expeditions', { escort: 'army' })).status).toBe(400)

    api.advance(2)
    const list = (await (await api.get('/api/caravans')).json()) as CaravanList
    expect(list.caravans[0]).toMatchObject({
      mission: 'expedition',
      status: 'returned',
      cargo: loot,
    })
    expect((await viewOf(api, body.caravanId)).view.loot).toEqual(loot)
    expect(await gapWithCarol(api, 'alice')).toEqual({
      wood: (loot.wood ?? 0) - 30,
      stone: loot.stone ?? 0,
      gold: loot.gold ?? 0,
    })
  })
})
