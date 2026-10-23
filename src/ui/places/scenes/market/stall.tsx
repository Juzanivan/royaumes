import { Crate } from '../../parts/crate'
import { range } from '../../parts/range'

/** Marchandise posée sur un étal : un petit tas de fruits, de pierres ou de bûches. */
type Goods = 'apples' | 'stone' | 'wood' | 'fabric'

function Pile({ x, y, goods }: { x: number; y: number; goods: Goods }) {
  if (goods === 'wood')
    return (
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const cx = x + (i < 3 ? i * 26 : 13 + (i - 3) * 26)
          const cy = y - (i < 3 ? 12 : 34)
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={12} fill="#9b6a3a" />
              <circle cx={cx} cy={cy} r={6} fill="#d9a86a" />
            </g>
          )
        })}
      </g>
    )
  if (goods === 'fabric')
    return (
      <g>
        <rect x={x - 6} y={y - 20} width={70} height={20} rx={8} fill="#2e86c1" />
        <rect x={x} y={y - 38} width={60} height={18} rx={8} fill="#c0392b" />
        <rect x={x + 6} y={y - 54} width={50} height={16} rx={8} fill="#f1c40f" />
      </g>
    )
  const color = goods === 'apples' ? '#d64533' : '#9aa1a8'
  const pts: [number, number][] = [
    [0, 0],
    [22, 0],
    [44, 0],
    [11, -18],
    [33, -18],
    [22, -36],
  ]
  return (
    <g>
      {pts.map(([dx, dy]) => (
        <circle
          key={`${dx},${dy}`}
          cx={x + dx}
          cy={y - 12 + dy}
          r={12}
          fill={color}
          stroke="rgb(0 0 0 / 0.2)"
          strokeWidth={2}
        />
      ))}
    </g>
  )
}

/**
 * Étal du marché, vu de face : comptoir de largeur w posé sur la ligne y, deux poteaux et un
 * auvent rayé de couleur stripe, sous lequel reposent deux tas de marchandises.
 */
export function Stall({
  x,
  y,
  w,
  stripe,
  goods,
}: {
  x: number
  y: number
  w: number
  stripe: string
  goods: [Goods, Goods]
}) {
  const counter = y - 90
  const awning = y - 250
  const bands = 6
  const bw = (w + 40) / bands
  return (
    <g>
      <rect x={x + 6} y={awning} width={10} height={250} fill="#5a3b22" />
      <rect x={x + w - 16} y={awning} width={10} height={250} fill="#5a3b22" />
      <Pile x={x + 30} y={counter} goods={goods[0]} />
      <Pile x={x + w - 100} y={counter} goods={goods[1]} />
      <rect x={x - 6} y={counter} width={w + 12} height={18} rx={3} fill="#8a5a2f" />
      <rect x={x} y={counter + 18} width={w} height={72} fill="#a8733f" />
      <path
        d={`M${x + 10},${counter + 40} H${x + w - 10} M${x + 10},${counter + 64} H${x + w - 10}`}
        stroke="#6b4423"
        strokeWidth={3}
      />
      <Crate x={x + w - 40} y={y} s={56} />
      {/* Auvent : bandes alternées, terminées par des festons arrondis. */}
      <g className="place-awning">
        {range(bands).map((i) => {
          const bx = x - 20 + i * bw
          return (
            <path
              key={bx}
              d={`M${bx},${awning - 50} L${bx + bw},${awning - 50} L${bx + bw},${awning} a${bw / 2},${bw / 3} 0 0 1 ${-bw},0 Z`}
              fill={i % 2 === 0 ? stripe : '#f8f1e4'}
            />
          )
        })}
        <rect x={x - 26} y={awning - 62} width={w + 52} height={14} rx={4} fill="#5a3b22" />
      </g>
    </g>
  )
}
