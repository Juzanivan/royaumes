/** Blason qui affiche le niveau d'un bâtiment, à la position (px, py) de l'écran. */
export function LevelBadge({ px, py, level }: { px: number; py: number; level: number }) {
  return (
    <g className="vmap-badge">
      <circle cx={px} cy={py} r={11} />
      <text x={px} y={py + 4} textAnchor="middle">
        {level}
      </text>
    </g>
  )
}
