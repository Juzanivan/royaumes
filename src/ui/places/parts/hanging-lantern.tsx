import { Glow } from './glow'

/** Lanterne suspendue au plafond par une chaîne, de longueur l, au point (x, 0). */
export function HangingLantern({ x, l }: { x: number; l: number }) {
  return (
    <g>
      <line x1={x} y1={0} x2={x} y2={l} stroke="#2b2118" strokeWidth={3} />
      <Glow x={x} y={l + 26} r={120} flicker />
      <path d={`M${x - 16},${l + 6} h32 l-6,10 h-20 z`} fill="#3a2a1c" />
      <rect
        x={x - 12}
        y={l + 16}
        width={24}
        height={30}
        rx={3}
        fill="#ffd27a"
        stroke="#3a2a1c"
        strokeWidth={3}
      />
      <path d={`M${x - 14},${l + 46} h28 l-5,8 h-18 z`} fill="#3a2a1c" />
    </g>
  )
}
