import { Block } from '../shapes/block'

const STONE = { left: '#d8d2c7', right: '#ada79b', top: '#e8e3da' }
/** Demi-côté d'un bloc, en cases, et hauteur, en pixels. */
const HALF = 0.15
export const STONE_BLOCK_HEIGHT = 9

/** Bloc de pierre taillée, centré au point (x, y), éventuellement posé sur un autre (z). */
export function StoneBlock({ x, y, z = 0 }: { x: number; y: number; z?: number }) {
  return (
    <Block
      x0={x - HALF}
      y0={y - HALF}
      x1={x + HALF}
      y1={y + HALF}
      h={STONE_BLOCK_HEIGHT}
      z0={z}
      shade={STONE}
    />
  )
}
