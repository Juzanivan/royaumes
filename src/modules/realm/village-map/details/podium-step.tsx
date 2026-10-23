import { Block } from '../shapes/block'
import { OnFace } from '../shapes/on-face'

const STONE = { left: '#ddd5c6', right: '#b6ad9d', top: '#eee8dd' }
/** Demi-largeur d'une marche le long de l'axe x, et demi-profondeur, en cases. */
export const STEP_HALF_X = 0.22
const HALF_Y = 0.3

/**
 * Marche du podium, centrée au point (x, y), de hauteur h. Son rang est gravé sur sa façade
 * avant, celle qui fait face au joueur : les trois marches sont côte à côte le long de l'axe
 * x, si bien que les trois façades sont visibles.
 */
export function PodiumStep({ x, y, h, rank }: { x: number; y: number; h: number; rank: number }) {
  return (
    <g>
      <Block
        x0={x - STEP_HALF_X}
        y0={y - HALF_Y}
        x1={x + STEP_HALF_X}
        y1={y + HALF_Y}
        h={h}
        shade={STONE}
      />
      <OnFace face="left" x={x} y={y + HALF_Y} z={h / 2}>
        <text className="vmap-rank" x={0} y={4.5} textAnchor="middle">
          {rank}
        </text>
      </OnFace>
    </g>
  )
}
