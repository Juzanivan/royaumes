/**
 * Fenêtre cintrée de largeur w et de hauteur h, coin supérieur gauche en (x, y) : on y voit le
 * ciel, qui suit le jour et la nuit, derrière des meneaux et un encadrement de couleur frame.
 */
export function ArchedWindow({
  x,
  y,
  w,
  h,
  frame,
}: {
  x: number
  y: number
  w: number
  h: number
  frame: string
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
      <line x1={x + r} y1={y + 6} x2={x + r} y2={y + h} stroke={frame} strokeWidth={6} />
      <line x1={x} y1={y + h * 0.55} x2={x + w} y2={y + h * 0.55} stroke={frame} strokeWidth={6} />
      <rect x={x - 12} y={y + h} width={w + 24} height={12} rx={3} fill={frame} />
    </g>
  )
}
