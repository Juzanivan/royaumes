import { Flame } from './flame'
import { Glow } from './glow'

/** Torche fixée au mur par un support de fer, au point (x, y), avec son halo vacillant. */
export function WallTorch({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Glow x={x} y={y - 30} r={170} flicker />
      <path
        d={`M${x - 18},${y + 30} L${x},${y + 10} L${x + 18},${y + 30}`}
        stroke="#2a2328"
        strokeWidth={5}
        fill="none"
      />
      <rect x={x - 6} y={y - 4} width={12} height={40} rx={3} fill="#5a3a22" />
      <rect x={x - 9} y={y - 8} width={18} height={8} rx={2} fill="#3b2c22" />
      <Flame x={x} y={y - 6} s={0.9} />
    </g>
  )
}
