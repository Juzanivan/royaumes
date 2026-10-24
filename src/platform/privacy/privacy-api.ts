import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../http/types'
import { validateJson } from '../http/validate'
import { ERASED_NAME, type PrivacyService } from './privacy'

/**
 * Corps attendu pour changer de nom : de 2 à 30 caractères, sans espace aux extrémités ; le nom
 * réservé aux joueurs effacés est refusé.
 */
export const RenameInput = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .refine((name) => name !== ERASED_NAME, { message: 'Nom réservé' }),
})

/**
 * Sous-application des droits du joueur connecté, montée sur /api/account.
 * Comme ailleurs, le joueur est celui que l'authentification a identifié : personne
 * ne peut exporter ni effacer les données d'un autre joueur.
 */
export function createPrivacyApi(service: PrivacyService) {
  return (
    new Hono<AppEnv>()
      // Droit d'accès et à la portabilité : un fichier JSON, téléchargé par le navigateur.
      .get('/export', async (c) => {
        const data = await service.exportData(c.var.userId)
        c.header('Content-Disposition', 'attachment; filename="royaumes-mes-donnees.json"')
        return c.json(data)
      })

      // Droit de rectification : le nouveau nom remplace l'ancien dans tout le jeu.
      .patch('/name', validateJson(RenameInput), async (c) => {
        const { name } = c.req.valid('json')
        const result = await service.rectify(c.var.userId, name)
        return c.json({ name, ...result })
      })

      // Droit à l'effacement : suppression du compte et de toutes les données personnelles.
      .delete('/', async (c) => {
        const result = await service.erase(c.var.userId)
        return c.json(result)
      })
  )
}
