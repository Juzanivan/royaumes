import { iso } from '../geometry/iso'

/** Rocher posé au point (x, y), à l'échelle s. */
export function Rock({ x, y, scale: s = 1 }: { x: number; y: number; scale?: number }) {
  const [px, py] = iso(x, y)
  return (
    <g>
      <path
        d={`M${px - 12 * s},${py} L${px - 6 * s},${py - 10 * s} L${px + 4 * s},${py - 12 * s} L${px + 12 * s},${py} Z`}
        fill="#9b958c"
      />
      <path
        d={`M${px + 4 * s},${py - 12 * s} L${px + 12 * s},${py} L${px + 2 * s},${py} Z`}
        fill="#7c766e"
      />
    </g>
  )
}
