/** Sommets d'une chaîne de montagnes : position du pic, hauteur et demi-largeur de la base. */
type Peak = [number, number, number]

/**
 * Chaîne de montagnes posée sur la ligne y, d'une couleur donnée ; les sommets les plus hauts
 * portent un manteau de neige.
 */
export function Mountains({
  y,
  peaks,
  color,
  snow,
}: {
  y: number
  peaks: Peak[]
  color: string
  snow?: string
}) {
  return (
    <g>
      {peaks.map(([x, h, w]) => (
        <g key={x}>
          <path d={`M${x - w},${y} L${x},${y - h} L${x + w},${y} Z`} fill={color} />
          <path
            d={`M${x},${y - h} L${x + w},${y} L${x + w * 0.2},${y} Z`}
            fill="rgb(0 0 0 / 0.12)"
          />
          {snow && h > 220 && (
            <path
              d={`M${x},${y - h} L${x + w * 0.24},${y - h * 0.76} L${x + w * 0.08},${y - h * 0.8} L${x - w * 0.06},${y - h * 0.72} L${x - w * 0.24},${y - h * 0.76} Z`}
              fill={snow}
            />
          )}
        </g>
      ))}
    </g>
  )
}
