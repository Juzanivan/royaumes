import { Window } from '../details/window'
import { iso } from '../geometry/iso'
import { Block } from '../shapes/block'
import { GableRoof } from '../shapes/gable-roof'
import { Smoke } from '../shapes/smoke'

const WALL = { left: '#f0e2c2', right: '#cdbd9b', top: '#f7ecd3' }
const ROOF = { gable: '#9a4a2c', slope: '#7a3820', ridge: '#c46a45' }
const CHIMNEY = { left: '#8f8a84', right: '#6f6a64', top: '#a9a49d' }

/** Taverne : maison à colombages, fenêtres éclairées, cheminée qui fume et enseigne à la chope. */
export function Tavern({ x, y }: { x: number; y: number }) {
  const x0 = x - 0.65
  const x1 = x + 0.55
  const y0 = y - 0.5
  const y1 = y + 0.5
  const wall = 30
  const [sx, sy] = iso(x0 - 0.05, y1, 26)
  return (
    <g>
      <Block x0={x0} y0={y0} x1={x1} y1={y1} h={wall} shade={WALL} />
      {/* Colombages. */}
      <g stroke="#6b4a2f" strokeWidth={2}>
        {[x0 + 0.3, x0 + 0.6, x0 + 0.9].map((bx) => {
          const [ax, ay] = iso(bx, y1, 0)
          const [tx, ty] = iso(bx, y1, wall)
          return <line key={bx} x1={ax} y1={ay} x2={tx} y2={ty} />
        })}
        {(() => {
          const [ax, ay] = iso(x0, y1, wall / 2)
          const [bx, by] = iso(x1, y1, wall / 2)
          return <line x1={ax} y1={ay} x2={bx} y2={by} />
        })()}
      </g>
      <Window x={x0 + 0.05} y={y1} w={0.2} z={18} h={8} />
      <Window x={x0 + 0.65} y={y1} w={0.2} z={18} h={8} />
      <Window x={x0 + 0.35} y={y1} w={0.2} z={2} h={12} />
      <Block
        x0={x + 0.15}
        y0={y0 + 0.1}
        x1={x + 0.35}
        y1={y0 + 0.3}
        h={wall + 30}
        shade={CHIMNEY}
      />
      <GableRoof x0={x0} y0={y0} x1={x1} y1={y1} z={wall} rise={22} shade={ROOF} />
      <Smoke x={x + 0.25} y={y0 + 0.2} z={wall + 34} />
      {/* Enseigne suspendue. */}
      <line x1={sx} y1={sy} x2={sx - 14} y2={sy + 4} stroke="#4a3626" strokeWidth={2} />
      <rect x={sx - 24} y={sy + 4} width={18} height={14} rx={2} fill="#e0b23a" stroke="#7a5532" />
      <text x={sx - 15} y={sy + 15} textAnchor="middle" fontSize={10}>
        🍺
      </text>
    </g>
  )
}
