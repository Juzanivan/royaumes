import { iso, pts } from '../geometry/iso'

/** Fenêtre éclairée sur la façade avant (y fixé), entre x et x + w, de z à z + h. */
export function Window({
  x,
  y,
  w,
  z,
  h,
}: {
  x: number
  y: number
  w: number
  z: number
  h: number
}) {
  return (
    <polygon
      className="vmap-window"
      points={pts([iso(x, y, z), iso(x + w, y, z), iso(x + w, y, z + h), iso(x, y, z + h)])}
    />
  )
}
