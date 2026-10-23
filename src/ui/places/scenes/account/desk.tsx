import { Candle } from './candle'

/** Parchemin roulé, posé au point (x, y). */
function Scroll({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <rect x={x - 70} y={y - 22} width={140} height={22} rx={11} fill="#e9dcbf" />
      <rect x={x - 76} y={y - 24} width={14} height={26} rx={6} fill="#c9b48a" />
      <rect x={x + 62} y={y - 24} width={14} height={26} rx={6} fill="#c9b48a" />
      <rect x={x - 6} y={y - 24} width={12} height={26} fill="#9b2335" />
    </g>
  )
}

/**
 * Bureau de l'archiviste, centré sur x, plateau à la hauteur y : un registre ouvert, une plume
 * dans son encrier, des parchemins et une bougie.
 */
export function Desk({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 340} y={y + 24} width={40} height={900 - y} fill="#4a2f1b" />
      <rect x={x + 300} y={y + 24} width={40} height={900 - y} fill="#4a2f1b" />
      <rect x={x - 300} y={y + 24} width={600} height={90} fill="#5e3b20" />
      <rect x={x - 380} y={y} width={760} height={28} rx={4} fill="#7a4e2c" />
      {/* Registre ouvert. */}
      <path
        d={`M${x - 170},${y} L${x - 160},${y - 30} Q${x - 80},${y - 46} ${x},${y - 30} Q${x + 80},${y - 46} ${x + 160},${y - 30} L${x + 170},${y} Z`}
        fill="#f3ead7"
      />
      <path d={`M${x},${y - 30} V${y}`} stroke="#c9b48a" strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <g key={i} stroke="#a89878" strokeWidth={2}>
          <line x1={x - 140} y1={y - 26 + i * 8} x2={x - 20} y2={y - 26 + i * 8} />
          <line x1={x + 20} y1={y - 26 + i * 8} x2={x + 140} y2={y - 26 + i * 8} />
        </g>
      ))}
      {/* Encrier et plume. */}
      <rect x={x + 210} y={y - 34} width={40} height={34} rx={6} fill="#1f2a3a" />
      <path
        d={`M${x + 232},${y - 30} Q${x + 270},${y - 120} ${x + 320},${y - 170} Q${x + 290},${y - 100} ${x + 236},${y - 30} Z`}
        fill="#f8f4ec"
        stroke="#c9c1b0"
        strokeWidth={2}
      />
      <Scroll x={x - 270} y={y} angle={-4} />
      <Scroll x={x - 250} y={y - 22} angle={3} />
      <Candle x={x + 300} y={y} />
    </g>
  )
}
