import { iso, pts } from '../geometry/iso'
import { Block } from '../shapes/block'

const COUNTER = { left: '#c58a52', right: '#9c6639', top: '#d9a26b' }

/** Étal du marché, centré au point (x, y) : un comptoir de bois, des marchandises et un auvent rayé. */
export function MarketStall({
  x,
  y,
  color,
  goods,
}: {
  x: number
  y: number
  color: string
  goods: string[]
}) {
  const h = 12
  const top = 30
  const corners = [
    iso(x - 0.42, y - 0.32, top),
    iso(x + 0.42, y - 0.32, top),
    iso(x + 0.48, y + 0.42, top - 8),
    iso(x - 0.36, y + 0.42, top - 8),
  ]
  return (
    <g>
      {/* Poteaux de l'auvent. */}
      {[iso(x - 0.36, y + 0.36), iso(x + 0.42, y + 0.36)].map(([px, py]) => (
        <line
          key={px}
          x1={px}
          y1={py}
          x2={px}
          y2={py - (top - 8)}
          stroke="#6b4a2f"
          strokeWidth={2}
        />
      ))}
      <Block x0={x - 0.4} y0={y - 0.25} x1={x + 0.4} y1={y + 0.25} h={h} shade={COUNTER} />
      {goods.map((g, i) => {
        const [px, py] = iso(x - 0.2 + i * 0.2, y, h + 3)
        return (
          <circle key={`${px},${py}`} cx={px} cy={py} r={3.4} fill={g} stroke="rgb(0 0 0 / 0.2)" />
        )
      })}
      <polygon points={pts(corners)} fill={color} />
      <polygon points={pts(corners)} fill="url(#vmap-stripes)" />
    </g>
  )
}
