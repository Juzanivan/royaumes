import { and, desc, eq, inArray, ne, or, sql } from 'drizzle-orm'
import type { Db } from '@/platform/db/client'
import type { ProjectionRunner } from '@/platform/projection/projection'
import type { CaravansReader } from '../application/caravans-reader'
import type { CaravanSummary } from '../contracts'
import type { CaravanStatus } from '../domain/caravan'
import type { Cargo, Escort } from '../domain/rules'
import { caravansProjection } from './caravans-projection'
import { caravans, destinations } from './schema'

/** Nombre maximal de caravanes présentées à un joueur. */
const LIST_SIZE = 20

/** États dans lesquels une caravane est en route : elle compte dans la limite de la règle 3. */
const IN_TRANSIT: CaravanStatus[] = ['loading', 'travelling']

/** Adaptateur du port CaravansReader, fondé sur les tables tenues par la projection. */
export function createDrizzleCaravansReader(db: Db, projections: ProjectionRunner): CaravansReader {
  const upToDate = () => projections.catchUp(caravansProjection)

  return {
    async list(viewerId) {
      await upToDate()
      const rows = await db
        .select()
        .from(caravans)
        .where(or(eq(caravans.senderId, viewerId), eq(caravans.recipientId, viewerId)))
        .orderBy(desc(caravans.sentAt))
        .limit(LIST_SIZE)
      return rows.map(
        (row): CaravanSummary => ({
          caravanId: row.caravanId,
          role: row.senderId === viewerId ? 'sender' : 'recipient',
          senderName: row.senderName,
          recipientName: row.recipientName,
          cargo: row.cargo as Cargo,
          escort: row.escort as Escort,
          status: row.status as CaravanStatus,
          departedAt: row.departedAt,
          arrivesAt: row.arrivesAt,
          endedAt: row.endedAt,
        }),
      )
    },

    async inTransit(senderId) {
      await upToDate()
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(caravans)
        .where(and(eq(caravans.senderId, senderId), inArray(caravans.status, IN_TRANSIT)))
      return row?.count ?? 0
    },

    async destinations(viewerId) {
      await upToDate()
      return db
        .select({ playerId: destinations.playerId, villageName: destinations.villageName })
        .from(destinations)
        .where(ne(destinations.playerId, viewerId))
        .orderBy(destinations.villageName)
    },

    async destination(playerId) {
      await upToDate()
      const [row] = await db.select().from(destinations).where(eq(destinations.playerId, playerId))
      return row ? { id: row.playerId, name: row.villageName } : null
    },
  }
}
