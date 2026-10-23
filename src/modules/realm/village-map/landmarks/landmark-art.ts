import type { ReactNode } from 'react'
import type { DestinationKind } from '@/ui/destinations'
import { Dungeon } from './dungeon'
import { Market } from './market'
import { Ranking } from './ranking'
import { Tavern } from './tavern'

/**
 * Pour chaque lieu du jeu : son dessin, et la hauteur de son écriteau au-dessus du sol ; une
 * hauteur négative place l'écriteau devant le lieu, lorsqu'au-dessus il masquerait un bâtiment.
 * Un module qui reçoit une entrée dans src/ui/destinations.ts reçoit aussi un dessin ici,
 * et un emplacement dans layout.ts.
 */
export const LANDMARK_ART: Record<
  DestinationKind,
  { draw: (p: { x: number; y: number }) => ReactNode; signHeight: number }
> = {
  dungeon: { draw: Dungeon, signHeight: 96 },
  ranking: { draw: Ranking, signHeight: -30 },
  market: { draw: Market, signHeight: -34 },
  tavern: { draw: Tavern, signHeight: -32 },
}
