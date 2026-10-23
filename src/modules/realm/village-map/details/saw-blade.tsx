import { iso } from '../geometry/iso'

/** Scie circulaire qui tourne, fixée en façade au point (x, y, z), de rayon r. */
export function SawBlade({ x, y, z, r }: { x: number; y: number; z: number; r: number }) {
  const [px, py] = iso(x, y, z)
  return (
    <g className="vmap-saw" style={{ transformOrigin: `${px}px ${py}px` }}>
      <circle
        cx={px}
        cy={py}
        r={r}
        fill="#d8dde3"
        stroke="#7d868f"
        strokeWidth={1.4}
        strokeDasharray="2 2"
      />
      <circle cx={px} cy={py} r={1.8} fill="#5c636a" />
    </g>
  )
}
