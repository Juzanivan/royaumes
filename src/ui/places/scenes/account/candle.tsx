import { Flame } from '../../parts/flame'
import { Glow } from '../../parts/glow'

/** Bougie sur son bougeoir, posée au point (x, y), à la flamme vacillante. */
export function Candle({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Glow x={x} y={y - 90} r={260} flicker />
      <ellipse cx={x} cy={y - 4} rx={40} ry={10} fill="#b08d57" />
      <rect x={x - 6} y={y - 24} width={12} height={20} fill="#b08d57" />
      <rect x={x - 14} y={y - 90} width={28} height={68} rx={3} fill="#f3ead7" />
      <path d={`M${x + 6},${y - 90} q4,14 0,26`} stroke="#e2d5bb" strokeWidth={5} fill="none" />
      <line x1={x} y1={y - 90} x2={x} y2={y - 98} stroke="#2b2118" strokeWidth={2} />
      <Flame x={x} y={y - 96} s={0.75} />
    </g>
  )
}
