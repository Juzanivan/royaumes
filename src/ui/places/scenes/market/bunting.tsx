import { range } from '../../parts/range'
/** Guirlande de fanions tendue entre (x1, y1) et (x2, y2), avec un léger affaissement. */
export function Bunting({
  x1,
  y1,
  x2,
  y2,
  sag = 60,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  sag?: number
}) {
  const COLORS = ['#c0392b', '#f1c40f', '#2e86c1', '#27ae60', '#8e44ad']
  const count = Math.round((x2 - x1) / 46)
  const at = (t: number): [number, number] => [
    x1 + (x2 - x1) * t,
    y1 + (y2 - y1) * t + sag * 4 * t * (1 - t),
  ]
  const [mx, my] = at(0.5)
  return (
    <g className="place-bunting">
      <path
        d={`M${x1},${y1} Q${mx},${my + sag} ${x2},${y2}`}
        stroke="#4a3a2a"
        strokeWidth={2.5}
        fill="none"
      />
      {range(count).map((i) => {
        const [px, py] = at((i + 0.5) / count)
        return (
          <path
            key={px}
            d={`M${px - 14},${py} L${px + 14},${py} L${px},${py + 32} Z`}
            fill={COLORS[i % COLORS.length]}
            style={{ animationDelay: `${(i % 4) * 0.3}s` }}
          />
        )
      })}
    </g>
  )
}
