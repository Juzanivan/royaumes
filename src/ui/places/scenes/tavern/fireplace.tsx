import { Flame } from '../../parts/flame'
import { Glow } from '../../parts/glow'

/** Cheminée de pierre au foyer allumé, centrée sur x et posée sur la ligne y. */
export function Fireplace({ x, y }: { x: number; y: number }) {
  const w = 360
  const h = 330
  const left = x - w / 2
  const stones: [number, number, number][] = []
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 6; c++)
      stones.push([left + c * 60 + (r % 2) * 30 - 15, y - h + r * 47, (r * 7 + c * 3) % 4])
  const SHADES = ['#8d8580', '#7e7671', '#958e88', '#857d78']
  return (
    <g>
      <rect x={left + 60} y={0} width={w - 120} height={y - h} fill="#7e7671" />
      <g>
        <clipPath id="tavern-hearth">
          <rect x={left} y={y - h} width={w} height={h} />
        </clipPath>
        <g clipPath="url(#tavern-hearth)">
          {stones.map(([sx, sy, s]) => (
            <rect
              key={`${sx},${sy}`}
              x={sx}
              y={sy}
              width={56}
              height={43}
              rx={6}
              fill={SHADES[s]}
            />
          ))}
        </g>
      </g>
      <rect x={left - 20} y={y - h - 20} width={w + 40} height={26} rx={4} fill="#5a3b22" />
      {/* Foyer : l'âtre noirci, les bûches et le feu. */}
      <path d={`M${x - 110},${y} V${y - 150} a110,90 0 0 1 220,0 V${y} Z`} fill="#1b120c" />
      <Glow x={x} y={y - 60} r={360} flicker />
      <rect
        x={x - 80}
        y={y - 26}
        width={160}
        height={18}
        rx={9}
        fill="#5a3b22"
        transform={`rotate(-6 ${x} ${y - 17})`}
      />
      <rect
        x={x - 70}
        y={y - 22}
        width={140}
        height={16}
        rx={8}
        fill="#6b4423"
        transform={`rotate(8 ${x} ${y - 14})`}
      />
      <Flame x={x - 30} y={y - 18} s={1.5} />
      <Flame x={x + 26} y={y - 18} s={1.2} />
      <Flame x={x} y={y - 22} s={2} />
      <path d={`M${x - 130},${y} h260 v-10 h-260 z`} fill="#3a2f2a" />
    </g>
  )
}
