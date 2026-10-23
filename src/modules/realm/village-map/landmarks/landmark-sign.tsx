/** Écriteau qui nomme un lieu, centré à la position (px, py) de l'écran. */
export function LandmarkSign({
  px,
  py,
  glyph,
  label,
}: {
  px: number
  py: number
  glyph: string
  label: string
}) {
  const width = 22 + label.length * 7.4
  return (
    <g className="vmap-sign">
      <rect x={px - width / 2} y={py - 11} width={width} height={22} rx={11} />
      <text x={px} y={py + 4.5} textAnchor="middle">
        {glyph} {label}
      </text>
    </g>
  )
}
