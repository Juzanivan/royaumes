import { iso, type Pt, pts } from '../geometry/iso'
import { Block } from '../shapes/block'

const PLANK = { left: '#d7a86a', right: '#b88a52', top: '#e6bf86' }
/** Demi-côté des fondations, en cases. */
const HALF = 0.85

/** Chantier d'un bâtiment non construit : fondations, piquets d'angle, planches et panneau. */
export function ConstructionSite({ x, y }: { x: number; y: number }) {
  const corners: Pt[] = [
    iso(x - HALF, y - HALF),
    iso(x + HALF, y - HALF),
    iso(x + HALF, y + HALF),
    iso(x - HALF, y + HALF),
  ]
  const [sx, sy] = iso(x - 0.4, y + 0.5)
  return (
    <g>
      <polygon
        points={pts(corners)}
        fill="#c8a978"
        stroke="#8a6a3e"
        strokeDasharray="5 4"
        strokeWidth={1.5}
      />
      {corners.map(([px, py]) => (
        <rect key={`${px},${py}`} x={px - 1.5} y={py - 14} width={3} height={14} fill="#6b4a2f" />
      ))}
      {[0, 1, 2].map((i) => (
        <Block
          key={i}
          x0={x - 0.1 + i * 0.05}
          y0={y - 0.3}
          x1={x + 0.6 - i * 0.05}
          y1={y}
          h={5}
          z0={i * 5}
          shade={PLANK}
        />
      ))}
      <line x1={sx} y1={sy} x2={sx} y2={sy - 20} stroke="#6b4a2f" strokeWidth={2} />
      <rect x={sx - 13} y={sy - 30} width={26} height={13} rx={2} fill="#f3e3c3" stroke="#8a6a3e" />
      <text x={sx} y={sy - 20} textAnchor="middle">
        ⚒
      </text>
    </g>
  )
}
