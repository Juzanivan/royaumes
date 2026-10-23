import { iso, type Pt } from '../geometry/iso'

/** Part de la hauteur couverte par la neige, sur les sommets assez hauts pour en porter. */
const SNOW = 0.24
const SNOW_MIN_HEIGHT = 70

/** Point situé à la fraction f du segment allant de a à b. */
const lerp = (a: Pt, b: Pt, f: number): Pt => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
const pts = (list: Pt[]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ')

/**
 * Montagne posée sur le bord arrière du terrain, centrée au point (x, y), de hauteur h et de
 * demi-largeur w en cases le long du bord (axe donné par « along »). Sa face gauche est
 * éclairée, sa face droite dans l'ombre ; les plus hautes portent une calotte de neige.
 */
export function RidgePeak({
  x,
  y,
  h,
  w,
  along,
}: {
  x: number
  y: number
  h: number
  w: number
  along: 'x' | 'y'
}) {
  const a = along === 'x' ? iso(x - w, y) : iso(x, y + w)
  const b = along === 'x' ? iso(x + w, y) : iso(x, y - w)
  const p = iso(x, y, h)
  const base = iso(x, y)
  // Le pied de l'arête centrale est un peu décalé vers la droite, pour une montagne moins symétrique.
  const m: Pt = [base[0] + w * 6, base[1] + 6]
  const snow = h >= SNOW_MIN_HEIGHT
  const ca = lerp(p, a, SNOW)
  const cb = lerp(p, b, SNOW * 0.8)
  const cm = lerp(p, m, SNOW * 0.9)
  const ja = lerp(ca, cm, 0.5)
  const jb = lerp(cm, cb, 0.5)
  return (
    <g>
      <polygon points={pts([a, p, m])} className="vmap-peak-lit" />
      <polygon points={pts([m, p, b])} className="vmap-peak-shade" />
      {snow && (
        <g>
          <polygon points={pts([p, ca, [ja[0], ja[1] + 6], cm])} className="vmap-peak-snow" />
          <polygon points={pts([p, cm, [jb[0], jb[1] + 5], cb])} className="vmap-peak-snow-shade" />
        </g>
      )}
    </g>
  )
}
