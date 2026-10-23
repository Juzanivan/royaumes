import { iso } from '../geometry/iso'

/** Buisson au point (x, y). */
export function Bush({ x, y }: { x: number; y: number }) {
  const [px, py] = iso(x, y)
  return (
    <g>
      <circle cx={px - 5} cy={py - 4} r={6} fill="#4f8a43" />
      <circle cx={px + 4} cy={py - 5} r={7} fill="#3f7a3a" />
    </g>
  )
}
