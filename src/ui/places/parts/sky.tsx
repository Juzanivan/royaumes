/** Positions des étoiles, visibles seulement de nuit. */
const STARS: [number, number][] = [
  [80, 60],
  [210, 140],
  [340, 50],
  [520, 110],
  [700, 40],
  [860, 130],
  [1010, 70],
  [1180, 150],
  [1330, 50],
  [1480, 120],
  [1560, 40],
  [140, 230],
  [980, 210],
]

/**
 * Ciel d'un lieu en plein air, sur la largeur de la scène et jusqu'à la hauteur h : son
 * dégradé suit le jour et la nuit (variables --sky-top et --sky-bottom), et les étoiles
 * n'apparaissent que la nuit (--stars).
 */
export function Sky({ h }: { h: number }) {
  return (
    <g>
      <rect width={1600} height={h} fill="url(#place-sky)" />
      <g className="place-stars">
        {STARS.map(([x, y]) => (
          <circle key={`${x},${y}`} cx={x} cy={y} r={1.8} />
        ))}
      </g>
    </g>
  )
}

/**
 * Dégradé du ciel, partagé par le ciel et par les fenêtres qui donnent sur l'extérieur. Il est
 * placé une fois par le cadre des lieux (place.tsx), pour toutes les scènes.
 */
export function SkyGradient() {
  return (
    <defs>
      <linearGradient id="place-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" className="place-sky-top" />
        <stop offset="1" className="place-sky-bottom" />
      </linearGradient>
    </defs>
  )
}
