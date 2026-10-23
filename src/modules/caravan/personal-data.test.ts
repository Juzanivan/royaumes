import { describe, expect, it } from 'vitest'
import type { StoredEvent } from '@/platform/event-store/event-store'
import { ERASED_NAME, ERASED_VILLAGE } from '@/platform/privacy/privacy'
import { createCaravanPersonalData } from './personal-data'

const sent: StoredEvent = {
  position: 1,
  stream: 'caravan-c1',
  version: 1,
  type: 'CaravanSent',
  data: {
    caravanId: 'c1',
    senderId: 'alice',
    senderName: 'Alice',
    recipientId: 'bob',
    recipientName: 'Bobville',
    cargo: { wood: 10 },
    escort: 'none',
    seed: 42,
    at: 0,
  },
  occurredAt: new Date(0),
}

/** Journal minimal, réduit à la lecture de tous les événements. */
const store = {
  readAll: async () => [sent],
} as unknown as Parameters<typeof createCaravanPersonalData>[0]

const contributor = createCaravanPersonalData(
  store,
  {} as Parameters<typeof createCaravanPersonalData>[1],
)

describe('Caravane - données personnelles', () => {
  it('exporte les caravanes envoyées et reçues par le joueur, sans la graine des brigands', async () => {
    const exported = (await contributor.export('bob')) as Record<string, unknown>[]
    expect(exported).toEqual([expect.objectContaining({ caravanId: 'c1', role: 'recipient' })])
    expect(exported[0]).not.toHaveProperty('seed')
    expect(await contributor.export('carol')).toEqual([])
  })

  it("remplace le nom de l'expéditeur, ou du village du destinataire, effacé", () => {
    expect(contributor.redact?.(sent, 'alice')).toMatchObject({
      senderName: ERASED_NAME,
      recipientName: 'Bobville',
      seed: 42,
    })
    expect(contributor.redact?.(sent, 'bob')).toMatchObject({
      senderName: 'Alice',
      recipientName: ERASED_VILLAGE,
    })
    expect(contributor.redact?.(sent, 'carol')).toBeNull()
    // Un événement déjà réécrit n'est plus modifié.
    const erased = { ...sent, data: { ...sent.data, senderName: ERASED_NAME } }
    expect(contributor.redact?.(erased, 'alice')).toBeNull()
  })

  it("remplace le nom de l'expéditeur d'une expédition, mais pas celui de la grotte", () => {
    const expedition: StoredEvent = {
      ...sent,
      stream: 'caravan-e1',
      type: 'ExpeditionSent',
      data: {
        caravanId: 'e1',
        senderId: 'alice',
        senderName: 'Alice',
        escort: 'none',
        seed: 7,
        at: 0,
      },
    }
    expect(contributor.redact?.(expedition, 'alice')).toMatchObject({
      senderName: ERASED_NAME,
      seed: 7,
    })
    expect(contributor.redact?.(expedition, 'bob')).toBeNull()
    const erased = { ...expedition, data: { ...expedition.data, senderName: ERASED_NAME } }
    expect(contributor.redact?.(erased, 'alice')).toBeNull()
  })
})
