import { iso } from '../geometry/iso'

/** Sapin planté au point (x, y), à l'échelle s. */
export function Tree({ x, y, scale: s = 1 }: { x: number; y: number; scale?: number }) {
  const [px, py] = iso(x, y)
  return (
    <g>
      <ellipse cx={px} cy={py + 2} rx={10 * s} ry={4 * s} fill="rgb(0 0 0 / 0.18)" />
      <rect x={px - 2 * s} y={py - 10 * s} width={4 * s} height={11 * s} fill="#6b4a2f" />
      <path
        d={`M${px},${py - 40 * s} L${px + 13 * s},${py - 10 * s} L${px - 13 * s},${py - 10 * s} Z`}
        fill="#3f7a3a"
      />
      <path
        d={`M${px},${py - 40 * s} L${px + 13 * s},${py - 10 * s} L${px},${py - 10 * s} Z`}
        fill="#2f6230"
      />
    </g>
  )
}
