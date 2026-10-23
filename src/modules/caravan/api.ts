import { Hono } from 'hono'
import type { AppEnv } from '@/platform/http/types'
import { validateJson } from '@/platform/http/validate'
import type { CaravanService, CommandResult } from './application/caravan-service'
import { type CaravanError, SendCaravanInput, SendExpeditionInput } from './contracts'

/** Code HTTP associé à chaque erreur métier. */
const STATUS: Record<CaravanError['code'], 400 | 404 | 409> = {
  CARAVAN_NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  OWN_VILLAGE: 409,
  UNKNOWN_RECIPIENT: 404,
  EMPTY_CARGO: 400,
  OVER_CAPACITY: 409,
  TOO_MANY_CARAVANS: 409,
  INVALID_ESCORT: 400,
  NOT_DUE: 409,
}

/**
 * Sous-application Hono du module Caravane, montée sur /api/caravans.
 * L'expéditeur est toujours le joueur que l'authentification a identifié : aucune route
 * n'accepte un identifiant d'expéditeur dans la requête.
 */
export function createCaravanApi(service: CaravanService) {
  /** Réponse d'une commande ou d'une lecture : la vue et l'heure du serveur, ou l'erreur. */
  const reply = (result: CommandResult) =>
    result.ok
      ? { body: { view: result.view, now: result.now }, status: 200 as const }
      : { body: { error: result.error }, status: STATUS[result.error.code] }

  return (
    new Hono<AppEnv>()
      // Villages vers lesquels le joueur peut envoyer une caravane.
      .get('/destinations', async (c) =>
        c.json({ destinations: await service.destinations(c.var.userId) }),
      )

      // Caravanes envoyées et reçues par le joueur.
      .get('/', async (c) => c.json(await service.list(c.var.userId)))

      // Envoi d'une caravane.
      .post('/', validateJson(SendCaravanInput), async (c) => {
        const player = { id: c.var.userId, name: c.var.userName }
        const { caravanId, result } = await service.send(player, c.req.valid('json'))
        const { body, status } = reply(result)
        return result.ok ? c.json({ caravanId, ...body }, 201) : c.json(body, status)
      })

      // Départ d'une expédition vers la grotte.
      .post('/expeditions', validateJson(SendExpeditionInput), async (c) => {
        const player = { id: c.var.userId, name: c.var.userName }
        const { caravanId, result } = await service.explore(player, c.req.valid('json'))
        const { body, status } = reply(result)
        return result.ok ? c.json({ caravanId, ...body }, 201) : c.json(body, status)
      })

      // Vue d'une caravane, réservée à son expéditeur et à son destinataire.
      .get('/:id', async (c) => {
        const { body, status } = reply(await service.getView(c.req.param('id'), c.var.userId))
        return c.json(body, status)
      })
  )
}

/** Type de la sous-application, utilisé par le client typé de l'interface. */
export type CaravanApi = ReturnType<typeof createCaravanApi>
