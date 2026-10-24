import { eq, or, sql } from 'drizzle-orm'
import type { Db } from '../db/client'
import type { StoredEvent } from '../event-store/event-store'
import { events } from '../event-store/schema'
import { erasures } from './schema'

/** Nom qui remplace celui d'un joueur effacé, dans le journal et dans les tables de lecture. */
export const ERASED_NAME = 'Joueur effacé'

/** Nom qui remplace celui du village d'un joueur effacé. */
export const ERASED_VILLAGE = 'Village effacé'

/**
 * Noms qui remplacent ceux d'un joueur dans le journal : ceux de l'effacement, ou le nouveau nom
 * choisi par le joueur (droit de rectification). Sans village, le nom du village ne change pas.
 */
export interface Replacement {
  name: string
  village?: string
}

/** Remplacement de l'effacement : le nom du joueur et celui de son village. */
export const ERASURE: Replacement = { name: ERASED_NAME, village: ERASED_VILLAGE }

/**
 * Participation d'un module, ou d'une brique de la plateforme, aux droits des joueurs.
 * Chaque module connaît ses propres données personnelles : il les exporte, désigne celles
 * de ses événements, efface celles de ses tables, et y reporte un changement de nom.
 * La plateforme ne connaît aucun module.
 */
export interface PersonalDataContributor {
  /** Nom de la section de l'export consacrée à ce module, par exemple « realm ». */
  name: string
  /** Données que le module conserve au sujet du joueur, sous une forme lisible. */
  export(playerId: string): Promise<unknown>
  /**
   * Réécrit un événement du module : renvoie ses données, où les noms du joueur sont remplacés
   * (par ceux de l'effacement, par défaut), ou null si l'événement n'a rien à changer. Le type,
   * la version et les autres données de l'événement ne doivent pas changer.
   */
  redact?(
    event: StoredEvent,
    playerId: string,
    replacement?: Replacement,
  ): Record<string, unknown> | null
  /**
   * Efface les données du joueur dans les tables du module, une fois le journal réécrit.
   * rewritten contient les événements réécrits, avec leurs nouvelles données.
   */
  erase?(playerId: string, rewritten: StoredEvent[]): Promise<void>
  /**
   * Reporte le nouveau nom du joueur dans les tables du module, une fois le journal réécrit
   * (droit de rectification). rewritten contient les événements réécrits.
   */
  rename?(playerId: string, name: string, rewritten: StoredEvent[]): Promise<void>
}

/** Convertit une ligne du journal en événement enregistré. */
const toStored = (row: typeof events.$inferSelect): StoredEvent => ({
  position: row.position,
  stream: row.stream,
  version: row.version,
  type: row.type,
  data: row.data as Record<string, unknown>,
  occurredAt: row.occurredAt,
})

/**
 * Service des droits des joueurs : export, rectification du nom et effacement de leurs
 * données personnelles.
 * L'ordre des contributeurs est celui de l'export et de l'effacement ; l'identité doit être
 * le dernier, afin qu'un effacement interrompu puisse être relancé par le joueur lui-même.
 */
export function createPrivacyService(
  db: Db,
  contributors: PersonalDataContributor[],
  clock = () => Date.now(),
) {
  /** Export de toutes les données personnelles d'un joueur, module par module. */
  async function exportData(playerId: string) {
    const sections: Record<string, unknown> = {}
    for (const contributor of contributors) {
      sections[contributor.name] = await contributor.export(playerId)
    }
    return { generatedAt: new Date(clock()).toISOString(), playerId, sections }
  }

  /**
   * Réécrit les événements du journal qui contiennent des données personnelles du joueur.
   * C'est la seule fonction du projet qui modifie un événement enregistré. Les réécritures
   * et l'entrée du registre des effacements sont enregistrées dans une même transaction.
   */
  async function rewriteJournal(playerId: string, replacement: Replacement) {
    return db.transaction(async (tx) => {
      // Événements candidats : ceux dont le flux ou les données mentionnent l'identifiant
      // du joueur. La fonction position() recherche une chaîne exacte, sans caractère spécial.
      const rows = await tx
        .select()
        .from(events)
        .where(
          or(
            sql`position(${playerId} in ${events.stream}) > 0`,
            sql`position(${playerId} in ${events.data}::text) > 0`,
          ),
        )

      const rewritten: StoredEvent[] = []
      for (const row of rows) {
        let event = toStored(row)
        let changed = false
        // Chaque module réécrit, s'il y a lieu, les événements qu'il reconnaît.
        for (const contributor of contributors) {
          const data = contributor.redact?.(event, playerId, replacement)
          if (data) {
            event = { ...event, data }
            changed = true
          }
        }
        if (changed) {
          await tx.update(events).set({ data: event.data }).where(eq(events.position, row.position))
          rewritten.push(event)
        }
      }

      // Seuls les effacements sont consignés au registre : une rectification n'efface rien.
      if (replacement === ERASURE)
        await tx.insert(erasures).values({ eventsRewritten: rewritten.length })
      return rewritten
    })
  }

  /**
   * Efface les données personnelles d'un joueur : le journal est d'abord réécrit, puis chaque
   * contributeur efface les données de ses tables, l'identité en dernier.
   * Chaque étape est idempotente : un effacement interrompu peut être relancé.
   */
  async function erase(playerId: string) {
    const rewritten = await rewriteJournal(playerId, ERASURE)
    for (const contributor of contributors) await contributor.erase?.(playerId, rewritten)
    return { eventsRewritten: rewritten.length }
  }

  /**
   * Droit de rectification : remplace le nom du joueur dans le journal, puis dans les tables de
   * chaque contributeur, l'identité comprise. Le nom de son village ne change pas. Comme
   * l'effacement, chaque étape est idempotente : une rectification interrompue peut être relancée.
   */
  async function rectify(playerId: string, name: string) {
    const rewritten = await rewriteJournal(playerId, { name })
    for (const contributor of contributors) await contributor.rename?.(playerId, name, rewritten)
    return { eventsRewritten: rewritten.length }
  }

  return { exportData, erase, rectify }
}

/** Type du service, déduit de sa fabrique. */
export type PrivacyService = ReturnType<typeof createPrivacyService>
