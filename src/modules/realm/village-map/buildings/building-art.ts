import type { ReactNode } from 'react'
import type { Building } from '../../contracts'
import { buildingSize } from '../tiers'
import { Mine, mineMound } from './mine'
import { QUARRY_BASE, Quarry } from './quarry'
import { SAWMILL_BASE, Sawmill } from './sawmill'

/** Dessin d'un bâtiment construit, à son emplacement et à son palier. */
type Art = (props: { x: number; y: number; tier: number }) => ReactNode

/** Hauteur du blason de niveau au-dessus d'un chantier, en pixels. */
const SITE_BADGE = 40
/** Marge entre le sommet d'un bâtiment et son blason, en pixels. */
const BADGE_MARGIN = 16

/**
 * Pour chaque bâtiment : son dessin, et la hauteur à laquelle placer son blason de niveau,
 * juste au-dessus de son sommet, selon son palier.
 */
export const BUILDING_ART: Record<Building, { draw: Art; badgeHeight: (tier: number) => number }> =
  {
    sawmill: {
      draw: Sawmill,
      badgeHeight: (t) =>
        t === 0
          ? SITE_BADGE
          : buildingSize(t, SAWMILL_BASE).wall + buildingSize(t, SAWMILL_BASE).rise + BADGE_MARGIN,
    },
    quarry: {
      draw: Quarry,
      badgeHeight: (t) =>
        t === 0
          ? SITE_BADGE
          : buildingSize(t, QUARRY_BASE).wall + buildingSize(t, QUARRY_BASE).rise + BADGE_MARGIN,
    },
    mine: {
      draw: Mine,
      badgeHeight: (t) => (t === 0 ? SITE_BADGE : mineMound(t).height + 22),
    },
  }
