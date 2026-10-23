import { range } from '../../parts/range'
/** Mur de planches verticales, de la ligne du plafond (top) à celle du sol (bottom). */
export function PlankWall({ top, bottom }: { top: number; bottom: number }) {
  const W = 80
  return (
    <g>
      <rect y={top} width={1600} height={bottom - top} fill="#7a4e2c" />
      {range(1600 / W).map((i) => (
        <g key={i}>
          <rect
            x={i * W}
            y={top}
            width={W - 4}
            height={bottom - top}
            fill={i % 3 === 0 ? '#80532f' : i % 3 === 1 ? '#744a29' : '#7d5130'}
          />
          <circle cx={i * W + 12} cy={top + 40} r={3} fill="#4a2f1b" />
          <circle cx={i * W + 12} cy={bottom - 40} r={3} fill="#4a2f1b" />
        </g>
      ))}
      {/* Lambris du bas du mur. */}
      <rect y={bottom - 150} width={1600} height={150} fill="#5e3b20" />
      <rect y={bottom - 156} width={1600} height={12} fill="#4a2f1b" />
    </g>
  )
}
