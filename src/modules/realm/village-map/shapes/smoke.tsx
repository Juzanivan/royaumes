import { iso } from '../geometry/iso'

/** Panache de fumée qui s'élève du point (x, y, z), par exemple d'une cheminée. */
export function Smoke({ x, y, z }: { x: number; y: number; z: number }) {
  const [px, py] = iso(x, y, z)
  return (
    <g className="vmap-smoke">
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={px} cy={py} r={4 + i} style={{ animationDelay: `${i * 0.9}s` }} />
      ))}
    </g>
  )
}
