import { Crane } from '../details/crane'
import { FacadeLines } from '../details/facade-lines'
import { STONE_BLOCK_HEIGHT, StoneBlock } from '../details/stone-block'
import type { Pt } from '../geometry/iso'
import { Block } from '../shapes/block'
import { Flag } from '../shapes/flag'
import { PyramidRoof } from '../shapes/pyramid-roof'
import { buildingSize } from '../tiers'

const WALL = { left: '#bdb7ad', right: '#958f85', top: '#d1ccc3' }
const ROOF = { left: '#6f7f8f', right: '#55626f' }
const GOLDEN_ROOF = { left: '#e2b043', right: '#bf8f2c' }
/** Demi-largeur de base de la carrière, en cases. */
export const QUARRY_BASE = 0.5

/** Position des blocs taillés devant la carrière ; le dernier est posé sur les autres. */
const BLOCKS: Pt[] = [
  [0.25, 0.35],
  [0.6, 0.35],
  [0.25, 0.7],
  [0.6, 0.7],
  [0.42, 0.52],
]

/**
 * Carrière : maison de pierre à toit en pyramide, et un bloc taillé de plus à chaque palier ;
 * au palier 3, une grue de levage ; au palier 4, un toit doré.
 */
export function Quarry({ x, y, tier }: { x: number; y: number; tier: number }) {
  const { half, wall, rise } = buildingSize(tier, QUARRY_BASE)
  const front = x + half * 0.7
  return (
    <g>
      <Block x0={x - half} y0={y - half} x1={front} y1={y + half * 0.7} h={wall} shade={WALL} />
      <FacadeLines
        x0={x - half}
        x1={front}
        y={y + half * 0.7}
        h={wall}
        fractions={[0.33, 0.66]}
        color="#8a847a"
      />
      <PyramidRoof
        x0={x - half - 0.08}
        y0={y - half - 0.08}
        x1={front + 0.08}
        y1={y + half * 0.7 + 0.08}
        z={wall}
        rise={rise}
        shade={tier === 4 ? GOLDEN_ROOF : ROOF}
      />
      {BLOCKS.slice(0, 1 + tier).map(([dx, dy], i) => (
        <StoneBlock
          key={`${dx},${dy}`}
          x={front + dx}
          y={y + dy}
          z={i === 4 ? STONE_BLOCK_HEIGHT : 0}
        />
      ))}
      {tier >= 3 && <Crane x={x + half + 0.5} y={y - half} tipX={x + half + 0.3} tipY={y + 0.4} />}
      {tier === 4 && (
        <Flag x={x - half * 0.15} y={y - half * 0.15} z={wall + rise} color="#e0b23a" />
      )}
    </g>
  )
}
