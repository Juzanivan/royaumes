import { iso } from '../geometry/iso'

/**
 * Lignes horizontales sur la façade avant d'un bâtiment, entre (x0, y) et (x1, y),
 * aux fractions données de sa hauteur h : planches d'un mur de bois, assises d'un mur de pierre.
 */
export function FacadeLines({
  x0,
  x1,
  y,
  h,
  fractions,
  color,
}: {
  x0: number
  x1: number
  y: number
  h: number
  fractions: number[]
  color: string
}) {
  return (
    <g stroke={color} strokeWidth={0.8} opacity={0.65}>
      {fractions.map((f) => {
        const [ax, ay] = iso(x0, y, h * f)
        const [bx, by] = iso(x1, y, h * f)
        return <line key={f} x1={ax} y1={ay} x2={bx} y2={by} />
      })}
    </g>
  )
}
