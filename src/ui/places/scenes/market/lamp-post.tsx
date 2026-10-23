import { Glow } from '../../parts/glow'

/** Réverbère à huile planté au point (x, y) : sa lanterne brille, surtout la nuit. */
export function LampPost({ x, y }: { x: number; y: number }) {
  const top = y - 330
  return (
    <g>
      <Glow x={x} y={top + 30} r={160} flicker />
      <rect x={x - 6} y={top + 50} width={12} height={280} fill="#2f2a2a" />
      <rect x={x - 16} y={y - 14} width={32} height={14} rx={3} fill="#2f2a2a" />
      <path d={`M${x - 22},${top + 10} h44 l-8,-14 h-28 z`} fill="#2f2a2a" />
      <rect
        className="place-lamp"
        x={x - 16}
        y={top + 10}
        width={32}
        height={40}
        rx={3}
        stroke="#2f2a2a"
        strokeWidth={4}
      />
      <path d={`M${x - 20},${top + 50} h40 l-6,8 h-28 z`} fill="#2f2a2a" />
    </g>
  )
}
