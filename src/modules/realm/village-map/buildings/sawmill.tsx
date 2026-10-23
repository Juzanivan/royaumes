import { FacadeLines } from '../details/facade-lines'
import { LogPile } from '../details/log-pile'
import { SawBlade } from '../details/saw-blade'
import { Block } from '../shapes/block'
import { Flag } from '../shapes/flag'
import { GableRoof } from '../shapes/gable-roof'
import { PyramidRoof } from '../shapes/pyramid-roof'
import { Smoke } from '../shapes/smoke'
import { buildingSize } from '../tiers'

const WALL = { left: '#c58a52', right: '#9c6639', top: '#d9a26b' }
const CHIMNEY = { left: '#8f8a84', right: '#6f6a64', top: '#a9a49d' }
const ROOF = { gable: '#b5513a', slope: '#8e3c2a', ridge: '#d6765c' }
const GOLDEN_ROOF = { gable: '#e2b043', slope: '#bf8f2c', ridge: '#f6da86' }
/** Demi-largeur de base de la scierie, en cases. */
export const SAWMILL_BASE = 0.55

/**
 * Scierie : bâtiment de bois à toit à deux pans et scie circulaire ; à partir du palier 2,
 * un tas de grumes et une cheminée qui fume ; au palier 3, une annexe ; au palier 4, un toit doré.
 */
export function Sawmill({ x, y, tier }: { x: number; y: number; tier: number }) {
  const roof = tier === 4 ? GOLDEN_ROOF : ROOF
  const { half, wall, rise } = buildingSize(tier, SAWMILL_BASE)
  const x0 = x - half
  const x1 = x + half * 0.9
  const y0 = y - half * 0.85
  const y1 = y + half * 0.85
  return (
    <g>
      {tier >= 3 && (
        <g>
          <Block x0={x1 - 0.1} y0={y0 - 0.2} x1={x1 + 0.6} y1={y0 + 0.5} h={20} shade={WALL} />
          <PyramidRoof
            x0={x1 - 0.16}
            y0={y0 - 0.26}
            x1={x1 + 0.66}
            y1={y0 + 0.56}
            z={20}
            rise={13}
            shade={{ left: roof.gable, right: roof.slope }}
          />
        </g>
      )}
      <Block x0={x0} y0={y0} x1={x1} y1={y1} h={wall} shade={WALL} />
      <FacadeLines x0={x0} x1={x1} y={y1} h={wall} fractions={[0.25, 0.5, 0.75]} color="#8a5530" />
      {tier >= 2 && (
        <Block
          x0={x + 0.05}
          y0={y0 + 0.1}
          x1={x + 0.25}
          y1={y0 + 0.3}
          h={wall + rise + 4}
          shade={CHIMNEY}
        />
      )}
      <GableRoof x0={x0} y0={y0} x1={x1} y1={y1} z={wall} rise={rise} shade={roof} />
      <SawBlade x={x - half * 0.3} y={y1} z={wall * 0.5} r={6 + tier * 1.5} />
      {tier >= 2 && <LogPile x={x1 + 0.35} y={y} />}
      {tier >= 2 && <Smoke x={x + 0.15} y={y0 + 0.2} z={wall + rise + 6} />}
      {tier === 4 && <Flag x={x - half * 0.05} y={y} z={wall + rise} color="#e0b23a" />}
    </g>
  )
}
