import { range } from '../../parts/range'
/** Chaîne pendue au mur, du point (x, y) sur la longueur l, terminée par un anneau. */
export function Chain({ x, y, l }: { x: number; y: number; l: number }) {
  const links = Math.floor(l / 22)
  return (
    <g className="dungeon-chain" style={{ transformOrigin: `${x}px ${y}px` }}>
      {range(links)
        .map((i) => y + i * 22)
        .map((cy, i) => (
          <ellipse
            key={cy}
            cx={x}
            cy={cy}
            rx={i % 2 === 0 ? 7 : 3}
            ry={13}
            fill="none"
            stroke="#5c5862"
            strokeWidth={4}
          />
        ))}
      <circle cx={x} cy={y + links * 22 + 14} r={18} fill="none" stroke="#5c5862" strokeWidth={6} />
    </g>
  )
}
