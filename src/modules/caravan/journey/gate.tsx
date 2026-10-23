import { ROAD } from './landscape'

/**
 * Porte du village de destination : une palissade de pieux, un porche de bois et sa bannière.
 * Elle apparaît au bout de la route quand la caravane arrive.
 */
export function VillageGate({ x, name }: { x: number; name: string }) {
  const y = ROAD + 10
  // La palissade ne s'étend qu'au-delà du porche : la route y entre par la gauche.
  const stakes = Array.from({ length: 8 }, (_, i) => x + 110 + i * 44)
  return (
    <g>
      {stakes.map((sx) => (
        <path
          key={sx}
          d={`M${sx},${y} V${y - 210} l18,-26 l18,26 V${y} Z`}
          fill="#8a5a2f"
          stroke="#5a3b22"
          strokeWidth={4}
        />
      ))}
      <rect x={x - 100} y={y - 330} width={26} height={330} fill="#6b4423" />
      <rect x={x + 74} y={y - 330} width={26} height={330} fill="#6b4423" />
      <path d={`M${x - 130},${y - 320} L${x},${y - 400} L${x + 130},${y - 320} Z`} fill="#9a4a2c" />
      <rect x={x - 112} y={y - 330} width={224} height={22} fill="#5a3b22" />
      <rect
        x={x - 90}
        y={y - 300}
        width={180}
        height={44}
        rx={6}
        fill="#f7efe0"
        stroke="#5a3b22"
        strokeWidth={4}
      />
      <text x={x} y={y - 270} textAnchor="middle" fontSize={26} fontWeight={700} fill="#4a3626">
        {name}
      </text>
      <path d={`M${x + 87},${y - 330} V${y - 460}`} stroke="#4a3626" strokeWidth={5} />
      <path
        className="journey-flag"
        d={`M${x + 87},${y - 460} h70 l-14,22 l14,22 h-70 Z`}
        fill="#c0392b"
      />
    </g>
  )
}
