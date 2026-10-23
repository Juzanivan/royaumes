/** Colonne de pierre centrée sur x, du plafond (top) au sol (bottom), avec base et chapiteau. */
export function Column({
  x,
  top,
  bottom,
  w = 90,
}: {
  x: number
  top: number
  bottom: number
  w?: number
}) {
  return (
    <g>
      <rect x={x - w / 2} y={top} width={w} height={bottom - top} fill="#c9bfae" />
      {[-0.25, 0, 0.25].map((t) => (
        <line
          key={t}
          x1={x + w * t}
          y1={top + 40}
          x2={x + w * t}
          y2={bottom - 40}
          stroke="#a89d8a"
          strokeWidth={4}
        />
      ))}
      <rect
        x={x - w / 2}
        y={top}
        width={w * 0.22}
        height={bottom - top}
        fill="rgb(255 255 255 / 0.18)"
      />
      <rect
        x={x + w * 0.28}
        y={top}
        width={w * 0.22}
        height={bottom - top}
        fill="rgb(0 0 0 / 0.12)"
      />
      <rect x={x - w / 2 - 16} y={top} width={w + 32} height={34} rx={4} fill="#b5aa96" />
      <rect x={x - w / 2 - 22} y={bottom - 40} width={w + 44} height={40} rx={4} fill="#b5aa96" />
    </g>
  )
}
