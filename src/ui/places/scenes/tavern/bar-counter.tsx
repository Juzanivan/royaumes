import { range } from '../../parts/range'
/** Comptoir de la taverne, de x1 à x2, plateau à la hauteur y, avec ses tireuses et ses chopes. */
export function BarCounter({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const taps = [x1 + 80, x1 + 130, x1 + 180]
  return (
    <g>
      {taps.map((t) => (
        <g key={t}>
          <rect x={t - 5} y={y - 70} width={10} height={70} fill="#b08d57" />
          <rect x={t - 14} y={y - 70} width={18} height={8} rx={3} fill="#b08d57" />
          <rect x={t - 6} y={y - 104} width={12} height={36} rx={4} fill="#3a2a1c" />
        </g>
      ))}
      <Mug x={x2 - 140} y={y} />
      <Mug x={x2 - 90} y={y} />
      <rect x={x1 - 10} y={y} width={x2 - x1 + 20} height={22} rx={4} fill="#4a2f1b" />
      <rect x={x1} y={y + 22} width={x2 - x1} height={190} fill="#6b4423" />
      {range(Math.floor((x2 - x1) / 120)).map((i) => (
        <rect
          key={i}
          x={x1 + 20 + i * 120}
          y={y + 46}
          width={96}
          height={140}
          rx={6}
          fill="#5e3b20"
          stroke="#4a2f1b"
          strokeWidth={4}
        />
      ))}
    </g>
  )
}

/** Chope de bière posée au point (x, y), coiffée de mousse. */
export function Mug({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M${x + 26},${y - 34} h8 a10,10 0 0 1 0,22 h-8`}
        stroke="#b08d57"
        strokeWidth={5}
        fill="none"
      />
      <rect
        x={x}
        y={y - 44}
        width={28}
        height={44}
        rx={4}
        fill="#d9a441"
        stroke="#8a5a2f"
        strokeWidth={3}
      />
      <ellipse cx={x + 14} cy={y - 44} rx={17} ry={8} fill="#fff8e8" />
    </g>
  )
}
