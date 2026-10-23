import { iso, pts } from '../geometry/iso'

/** Couleurs d'un toit en pyramide : pan gauche éclairé, pan droit dans l'ombre. */
export interface PyramidShade {
  left: string
  right: string
}

/** Toit en pyramide, posé à l'altitude z sur un pavé. */
export function PyramidRoof({
  x0,
  y0,
  x1,
  y1,
  z,
  rise,
  shade,
}: {
  x0: number
  y0: number
  x1: number
  y1: number
  z: number
  rise: number
  shade: PyramidShade
}) {
  const apex = iso((x0 + x1) / 2, (y0 + y1) / 2, z + rise)
  return (
    <g>
      <polygon points={pts([iso(x0, y1, z), iso(x1, y1, z), apex])} fill={shade.left} />
      <polygon points={pts([iso(x1, y1, z), iso(x1, y0, z), apex])} fill={shade.right} />
    </g>
  )
}
