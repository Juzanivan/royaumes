import { iso, pts } from '../geometry/iso'

/** Couleurs d'un volume : face gauche éclairée, face droite dans l'ombre, dessus. */
export interface Shade {
  left: string
  right: string
  top: string
}

/**
 * Volume en forme de pavé, posé entre les cases (x0, y0) et (x1, y1), à l'altitude z0,
 * de hauteur h. Seules les trois faces visibles depuis le point de vue sont dessinées.
 */
export function Block({
  x0,
  y0,
  x1,
  y1,
  h,
  z0 = 0,
  shade,
}: {
  x0: number
  y0: number
  x1: number
  y1: number
  h: number
  z0?: number
  shade: Shade
}) {
  const z1 = z0 + h
  return (
    <g>
      <polygon
        points={pts([iso(x0, y1, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x0, y1, z1)])}
        fill={shade.left}
      />
      <polygon
        points={pts([iso(x1, y1, z0), iso(x1, y0, z0), iso(x1, y0, z1), iso(x1, y1, z1)])}
        fill={shade.right}
      />
      <polygon
        points={pts([iso(x0, y0, z1), iso(x1, y0, z1), iso(x1, y1, z1), iso(x0, y1, z1)])}
        fill={shade.top}
      />
    </g>
  )
}
