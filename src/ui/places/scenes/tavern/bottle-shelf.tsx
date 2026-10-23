import { range } from '../../parts/range'

/** Couleurs des bouteilles, alternées le long d'une étagère. */
const GLASS = ['#2f7d4a', '#8b2f3a', '#c58a2a', '#3a5f8b', '#6b3a8b']

/** Bouteille posée par sa base au point (x, y). */
function Bottle({ x, y, color, tall }: { x: number; y: number; color: string; tall: boolean }) {
  const h = tall ? 56 : 42
  return (
    <g>
      <rect x={x - 9} y={y - h} width={18} height={h} rx={5} fill={color} />
      <rect x={x - 4} y={y - h - 16} width={8} height={18} fill={color} />
      <rect x={x - 5} y={y - h - 20} width={10} height={6} fill="#4a2f1b" />
      <rect x={x - 6} y={y - h + 12} width={4} height={h - 22} fill="rgb(255 255 255 / 0.25)" />
    </g>
  )
}

/** Étagère de largeur w, au point (x, y), chargée de bouteilles. */
export function BottleShelf({ x, y, w }: { x: number; y: number; w: number }) {
  const count = Math.floor(w / 34)
  return (
    <g>
      {range(count).map((i) => (
        <Bottle
          key={i}
          x={x + 20 + i * 34}
          y={y}
          color={GLASS[(i * 3) % GLASS.length]}
          tall={i % 3 !== 1}
        />
      ))}
      <rect x={x} y={y} width={w} height={12} fill="#4a2f1b" />
      <path
        d={`M${x + 20},${y + 12} l20,26 M${x + w - 20},${y + 12} l-20,26`}
        stroke="#4a2f1b"
        strokeWidth={6}
      />
    </g>
  )
}
