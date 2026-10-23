import { iso, pts } from '../geometry/iso'

/** Demi-largeur d'un chemin, en cases. */
const HALF_WIDTH = 0.32

/** Tronçon de chemin de terre, en ligne droite le long d'un axe, de (x0, y0) à (x1, y1). */
export function PathSegment({
  x0,
  y0,
  x1,
  y1,
}: {
  x0: number
  y0: number
  x1: number
  y1: number
}) {
  const w = HALF_WIDTH
  const ax = Math.min(x0, x1) - (x0 === x1 ? w : 0)
  const bx = Math.max(x0, x1) + (x0 === x1 ? w : 0)
  const ay = Math.min(y0, y1) - (y0 === y1 ? w : 0)
  const by = Math.max(y0, y1) + (y0 === y1 ? w : 0)
  return (
    <polygon
      className="vmap-path"
      points={pts([iso(ax, ay), iso(bx, ay), iso(bx, by), iso(ax, by)])}
    />
  )
}
