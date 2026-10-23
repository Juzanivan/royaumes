import { range } from '../../parts/range'

/** Tête de cheval qui dépasse de la porte d'une stalle, au point (x, y), de couleur color. */
function HorseHead({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g className="relay-horse" style={{ transformOrigin: `${x}px ${y + 60}px` }}>
      <path
        d={`M${x - 26},${y + 70} L${x - 20},${y} Q${x},${y - 30} ${x + 30},${y - 10} L${x + 74},${y + 30} Q${x + 80},${y + 52} ${x + 58},${y + 54} L${x + 18},${y + 40} L${x + 14},${y + 70} Z`}
        fill={color}
      />
      <path d={`M${x - 20},${y} q-6,-24 6,-34 l8,24 Z`} fill={color} />
      <path d={`M${x - 22},${y + 4} q-16,30 -6,66`} stroke="#2b1d12" strokeWidth={10} fill="none" />
      <circle cx={x + 32} cy={y + 10} r={5} fill="#1b120c" />
      <circle cx={x + 64} cy={y + 42} r={3} fill="#1b120c" />
    </g>
  )
}

/**
 * Écurie du relais : une rangée de stalles voûtées dans un mur de pierre, sous un auvent de
 * bois ; des chevaux passent la tête par-dessus les portes basses.
 */
export function Stable({ y, count }: { y: number; count: number }) {
  const w = 1600 / count
  const COLORS = ['#7a4e2c', '#e9e4da', '#3b2a1c', '#a0703f']
  return (
    <g>
      <rect y={y - 420} width={1600} height={420} fill="#b7a487" />
      {range(14).map((r) =>
        range(17).map((c) => (
          <rect
            key={`${r},${c}`}
            x={c * 100 - (r % 2) * 50}
            y={y - 420 + r * 30}
            width={96}
            height={26}
            rx={4}
            fill={(r + c) % 3 === 0 ? '#ab9878' : '#c2b092'}
          />
        )),
      )}
      {range(count).map((i) => {
        const cx = i * w + w / 2
        const half = w * 0.36
        return (
          <g key={i}>
            <path
              d={`M${cx - half},${y} V${y - 220} A${half},${half * 0.8} 0 0 1 ${cx + half},${y - 220} V${y} Z`}
              fill="#2c1e14"
            />
            <path
              d={`M${cx - half - 14},${y} V${y - 220} A${half + 14},${half * 0.8 + 14} 0 0 1 ${cx + half + 14},${y - 220} V${y}`}
              fill="none"
              stroke="#8f7c60"
              strokeWidth={14}
            />
            {i % 2 === 0 && <HorseHead x={cx - 20} y={y - 190} color={COLORS[i % COLORS.length]} />}
            {/* Porte basse de la stalle. */}
            <rect x={cx - half} y={y - 120} width={half * 2} height={120} fill="#7a4e2c" />
            <path
              d={`M${cx - half},${y - 120} L${cx + half},${y} M${cx + half},${y - 120} L${cx - half},${y}`}
              stroke="#5a3b22"
              strokeWidth={8}
            />
            <rect x={cx - half} y={y - 124} width={half * 2} height={10} fill="#5a3b22" />
          </g>
        )
      })}
      {/* Auvent de bois au-dessus des stalles. */}
      <path
        d={`M-20,${y - 420} L1620,${y - 420} L1620,${y - 380} L-20,${y - 380} Z`}
        fill="#5a3b22"
      />
      <path
        d={`M-20,${y - 470} L1620,${y - 470} L1620,${y - 420} L-20,${y - 420} Z`}
        fill="#6f6f3a"
      />
    </g>
  )
}
