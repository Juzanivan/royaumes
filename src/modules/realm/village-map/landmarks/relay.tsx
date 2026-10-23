import { ArchedDoor } from '../details/arched-door'
import { iso, pts } from '../geometry/iso'
import { Block } from '../shapes/block'
import { GableRoof } from '../shapes/gable-roof'
import { OnFace } from '../shapes/on-face'

const WALL = { left: '#d9c29a', right: '#b49c74', top: '#e6d2ad' }
const BEAM = '#6b4a2f'
const ROOF = { gable: '#5f6f3a', slope: '#4b5a2c', ridge: '#7e9150' }

/** Botte de foin, posée au point (x, y) du terrain. */
function HayBale({ x, y }: { x: number; y: number }) {
  const [bx, by] = iso(x, y)
  return (
    <g>
      <ellipse cx={bx} cy={by + 1} rx={7} ry={3} fill="rgb(0 0 0 / 0.18)" />
      <rect x={bx - 7} y={by - 8} width={14} height={8} rx={3} fill="#e2c15a" />
      <path
        d={`M${bx - 6},${by - 5} h12 M${bx - 6},${by - 2.5} h12`}
        stroke="#b8952f"
        strokeWidth={1}
      />
    </g>
  )
}

/**
 * Relais des caravanes : une grande écurie de bois au toit de chaume vert, dont le portail
 * cintré s'ouvre sur le chemin. Une botte de foin et une barre d'attache l'accompagnent.
 */
export function Relay({ x, y }: { x: number; y: number }) {
  const x0 = x - 0.6
  const x1 = x + 0.55
  const y0 = y - 0.55
  const y1 = y + 0.45
  const wall = 26
  // Barre d'attache des chevaux, devant le portail.
  const [p0x, p0y] = iso(x1 + 0.35, y - 0.45, 0)
  const [p1x, p1y] = iso(x1 + 0.35, y + 0.3, 0)
  return (
    <g>
      <Block x0={x0} y0={y0} x1={x1} y1={y1} h={wall} shade={WALL} />
      {/* Planches verticales du mur gauche. */}
      <g stroke={BEAM} strokeWidth={1.4} opacity={0.7}>
        {[0.2, 0.4, 0.6, 0.8].map((t) => {
          const bx = x0 + (x1 - x0) * t
          const [ax, ay] = iso(bx, y1, 0)
          const [tx, ty] = iso(bx, y1, wall)
          return <line key={t} x1={ax} y1={ay} x2={tx} y2={ty} />
        })}
      </g>
      <polygon
        points={pts([
          iso(x0, y1, wall),
          iso(x1, y1, wall),
          iso(x1, y1, wall - 4),
          iso(x0, y1, wall - 4),
        ])}
        fill={BEAM}
      />
      {/* Grand portail des chariots, côté chemin. */}
      <OnFace face="right" x={x1} y={y - 0.05}>
        <ArchedDoor w={18} h={20} color="#3b2a1c" frame={BEAM} />
      </OnFace>
      <GableRoof x0={x0} y0={y0} x1={x1} y1={y1} z={wall} rise={20} shade={ROOF} />
      <line x1={p0x} y1={p0y - 7} x2={p1x} y2={p1y - 7} stroke={BEAM} strokeWidth={2} />
      <line x1={p0x} y1={p0y} x2={p0x} y2={p0y - 8} stroke={BEAM} strokeWidth={2} />
      <line x1={p1x} y1={p1y} x2={p1x} y2={p1y - 8} stroke={BEAM} strokeWidth={2} />
      <HayBale x={x1 + 0.3} y={y0 - 0.1} />
      <HayBale x={x1 + 0.15} y={y0 - 0.45} />
    </g>
  )
}
