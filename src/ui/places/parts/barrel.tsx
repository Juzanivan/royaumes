/** Tonneau de bois cerclé de fer, posé par sa base au point (x, y), de largeur w. */
export function Barrel({ x, y, w = 70 }: { x: number; y: number; w?: number }) {
  const h = w * 1.3
  const top = y - h
  return (
    <g>
      <path
        d={`M${x - w / 2},${top + 6} Q${x - w / 2 - 8},${y - h / 2} ${x - w / 2},${y - 6} L${x + w / 2},${y - 6} Q${x + w / 2 + 8},${y - h / 2} ${x + w / 2},${top + 6} Z`}
        fill="#8a5a2f"
      />
      {[0.12, 0.88].map((t) => (
        <rect
          key={t}
          x={x - w / 2 - 4}
          y={top + h * t - 4}
          width={w + 8}
          height={7}
          rx={3}
          fill="#3b3330"
        />
      ))}
      <rect x={x - w / 2 - 6} y={y - h / 2 - 4} width={w + 12} height={8} rx={3} fill="#3b3330" />
      {[-0.25, 0, 0.25].map((t) => (
        <line
          key={t}
          x1={x + w * t}
          y1={top + 8}
          x2={x + w * t}
          y2={y - 8}
          stroke="#6b4423"
          strokeWidth={2}
        />
      ))}
      <ellipse cx={x} cy={top + 6} rx={w / 2} ry={7} fill="#a8733f" />
    </g>
  )
}
