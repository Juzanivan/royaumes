/** Sapin, posé par le pied de son tronc au point (x, y), de hauteur h. */
export function Pine({ x, y, h, color }: { x: number; y: number; h: number; color: string }) {
  const w = h * 0.42
  return (
    <g>
      <rect x={x - h * 0.03} y={y - h * 0.18} width={h * 0.06} height={h * 0.18} fill="#4a3220" />
      <path
        d={`M${x},${y - h} L${x + w * 0.6},${y - h * 0.62} L${x + w * 0.35},${y - h * 0.62} L${x + w},${y - h * 0.15} L${x - w},${y - h * 0.15} L${x - w * 0.35},${y - h * 0.62} L${x - w * 0.6},${y - h * 0.62} Z`}
        fill={color}
      />
    </g>
  )
}

/** Feuillu à la couronne ronde, posé au point (x, y), de hauteur h. */
export function Oak({ x, y, h, color }: { x: number; y: number; h: number; color: string }) {
  const r = h * 0.3
  return (
    <g>
      <rect x={x - h * 0.04} y={y - h * 0.45} width={h * 0.08} height={h * 0.45} fill="#5a3b22" />
      <circle cx={x} cy={y - h * 0.62} r={r} fill={color} />
      <circle cx={x - r * 0.7} cy={y - h * 0.5} r={r * 0.7} fill={color} />
      <circle cx={x + r * 0.7} cy={y - h * 0.52} r={r * 0.75} fill={color} />
      <circle cx={x - r * 0.25} cy={y - h * 0.72} r={r * 0.45} fill="rgb(255 255 255 / 0.12)" />
    </g>
  )
}

/** Buisson bas, posé au point (x, y), de largeur w. */
export function Bush({ x, y, w, color }: { x: number; y: number; w: number; color: string }) {
  return (
    <g fill={color}>
      <ellipse cx={x} cy={y - w * 0.22} rx={w * 0.5} ry={w * 0.28} />
      <ellipse cx={x - w * 0.3} cy={y - w * 0.12} rx={w * 0.3} ry={w * 0.18} />
      <ellipse cx={x + w * 0.32} cy={y - w * 0.14} rx={w * 0.28} ry={w * 0.2} />
    </g>
  )
}
