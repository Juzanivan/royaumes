import { iso, pts } from '../geometry/iso'

/** Couleurs d'un toit à deux pans : pignon, pan visible et faîte. */
export interface GableShade {
  gable: string
  slope: string
  ridge: string
}

/** Débord du toit au-delà des murs, en cases. */
const OVERHANG = 0.12

/** Toit à deux pans, dont le faîte suit l'axe y, posé à l'altitude z sur les murs. */
export function GableRoof({
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
  shade: GableShade
}) {
  const xm = (x0 + x1) / 2
  const o = OVERHANG
  const r1 = iso(xm, y0 - o, z + rise)
  const r2 = iso(xm, y1 + o, z + rise)
  return (
    <g>
      <polygon
        points={pts([iso(x0, y1, z), iso(x1, y1, z), iso(xm, y1, z + rise)])}
        fill={shade.gable}
      />
      <polygon
        points={pts([iso(x1 + o, y1 + o, z - 3), iso(x1 + o, y0 - o, z - 3), r1, r2])}
        fill={shade.slope}
      />
      <line
        x1={r1[0]}
        y1={r1[1]}
        x2={r2[0]}
        y2={r2[1]}
        stroke={shade.ridge}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  )
}
