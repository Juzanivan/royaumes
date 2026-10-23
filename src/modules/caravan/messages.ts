import { z } from 'zod'
import type { MessageHandler } from '@/platform/outbox/outbox'
import type { CaravanService } from './application/caravan-service'
import { CARAVAN_TOPICS } from './contracts'
import { caravanIdOf } from './domain/caravan'

/** Réponse du Village à un mouvement de ressources (son type TransferResult, vérifié ici). */
const TransferResultMessage = z.object({
  transferId: z.string().min(1),
  outcome: z.enum(['withdrawn', 'refused', 'deposited']),
  missing: z.record(z.string(), z.number()).optional(),
})

/** Rappel différé d'une caravane, à l'heure de son issue. */
const ResolveMessage = z.object({ caravanId: z.string().min(1) })

/**
 * Gestionnaires des messages adressés à la Caravane : les réponses du Village, qui font
 * progresser la saga, et les rappels d'échéance. Ils ne font que traduire un message en appel
 * au service ; leur idempotence vient du domaine, qui ignore une réponse ou un rappel en double.
 */
export function createCaravanHandlers(service: CaravanService): Record<string, MessageHandler> {
  return {
    [CARAVAN_TOPICS.transferResult]: async (message) => {
      const { transferId, outcome, missing } = TransferResultMessage.parse(message.payload)
      // L'identifiant du mouvement a été construit par la Caravane : il désigne la caravane.
      await service.step(caravanIdOf(transferId), {
        type: 'RecordTransferResult',
        transferId,
        outcome,
        missing,
      })
    },

    [CARAVAN_TOPICS.resolve]: async (message) => {
      const { caravanId } = ResolveMessage.parse(message.payload)
      await service.step(caravanId, { type: 'ResolveDue' })
    },
  }
}
