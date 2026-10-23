import type { ReactNode } from 'react'
import type { DestinationKind } from '@/ui/destinations'
import { Dungeon } from './dungeon'
import { Market } from './market'
import { Ranking } from './ranking'
import { Relay } from './relay'
import { Tavern } from './tavern'

/**
 * Pour chaque lieu du jeu : son dessin, et la hauteur de son écriteau au-dessus du sol.
 * L'écriteau n'apparaît qu'au survol : au-dessus du lieu, il peut masquer un instant un
 * bâtiment voisin, mais reste à l'écart de la palissade, dessinée par-dessus tout le reste.
 * Un module qui reçoit une entrée dans src/ui/destinations.ts reçoit aussi un dessin ici,
 * et un emplacement dans layout.ts.
 */
export const LANDMARK_ART: Record<
  DestinationKind,
  { draw: (p: { x: number; y: number }) => ReactNode; signHeight: number }
> = {
  dungeon: { draw: Dungeon, signHeight: 96 },
  ranking: { draw: Ranking, signHeight: 74 },
  market: { draw: Market, signHeight: 52 },
  tavern: { draw: Tavern, signHeight: 92 },
  caravan: { draw: Relay, signHeight: 80 },
}
