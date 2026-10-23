import { iso } from '../geometry/iso'
import { Block } from '../shapes/block'

const STONE = { left: '#ddd5c6', right: '#b6ad9d', top: '#eee8dd' }
/** Demi-largeur et demi-profondeur d'une marche, en cases. */
const HALF_X = 0.22
const HALF_Y = 0.3

/** Marche du podium, centrée au point (x, y), de hauteur h, avec son rang gravé en façade. */
export function PodiumStep({ x, y, h, rank }: { x: number; y: number; h: number; rank: number }) {
  const [px, py] = iso(x, y + HALF_Y, h / 2)
  return (
    <g>
      <Block x0={x - HALF_X} y0={y - HALF_Y} x1={x + HALF_X} y1={y + HALF_Y} h={h} shade={STONE} />
      <text className="vmap-rank" x={px - 4} y={py + 4} textAnchor="middle">
        {rank}
      </text>
    </g>
  )
}
