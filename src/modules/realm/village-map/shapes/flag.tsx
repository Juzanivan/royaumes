import { iso } from '../geometry/iso'

/** Fanion qui flotte au vent, en haut d'un mât de hauteur h planté au point (x, y, z). */
export function Flag({
  x,
  y,
  z,
  h = 22,
  color,
}: {
  x: number
  y: number
  z: number
  h?: number
  color: string
}) {
  const [px, py] = iso(x, y, z)
  return (
    <g>
      <line x1={px} y1={py} x2={px} y2={py - h} stroke="#4a3626" strokeWidth={1.6} />
      <path className="vmap-flag" d={`M${px},${py - h} l14,4 l-14,5 z`} fill={color} />
    </g>
  )
}
