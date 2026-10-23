import { SceneCelestial } from './scene-celestial'

/**
 * Fenêtre cintrée de largeur w et de hauteur h, coin supérieur gauche en (x, y) : on y voit le
 * ciel, qui suit le jour et la nuit, derrière des meneaux et un encadrement de couleur frame.
 * Avec celestial, le soleil ou la lune y apparaît, derrière les meneaux : un clic dessus fait
 * passer du jour à la nuit, et l'astre se couche sous l'appui de la fenêtre.
 */
export function ArchedWindow({
  x,
  y,
  w,
  h,
  frame,
  celestial = false,
}: {
  x: number
  y: number
  w: number
  h: number
  frame: string
  celestial?: boolean
}) {
  const r = w / 2
  const d = `M${x},${y + h} L${x},${y + r} A${r},${r} 0 0 1 ${x + w},${y + r} L${x + w},${y + h} Z`
  return (
    <g>
      <path d={d} fill="url(#place-sky)" stroke={frame} strokeWidth={10} />
      <g className="place-stars">
        <circle cx={x + w * 0.3} cy={y + h * 0.35} r={1.6} />
        <circle cx={x + w * 0.7} cy={y + h * 0.2} r={1.4} />
      </g>
      {celestial && (
        <SceneCelestial x={x + w * 0.62} y={y + h * 0.3} scale={w / 110} drop={h * 0.9} clip={d} />
      )}
      {/* Meneaux et appui, devant l'astre : ils laissent passer les clics jusqu'à lui. */}
      <g className="window-frame">
        <line x1={x + r} y1={y + 6} x2={x + r} y2={y + h} stroke={frame} strokeWidth={6} />
        <line
          x1={x}
          y1={y + h * 0.55}
          x2={x + w}
          y2={y + h * 0.55}
          stroke={frame}
          strokeWidth={6}
        />
        <rect x={x - 12} y={y + h} width={w + 24} height={12} rx={3} fill={frame} />
      </g>
    </g>
  )
}
