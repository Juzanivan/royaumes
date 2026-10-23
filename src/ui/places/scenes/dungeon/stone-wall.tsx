/** Teintes des pierres, choisies de façon régulière pour que le mur ne paraisse pas uniforme. */
const SHADES = ['#3a3540', '#34303a', '#403a46', '#2f2b35']

/** Mur de grosses pierres taillées, de la ligne top à la ligne bottom. */
export function StoneWall({ top, bottom }: { top: number; bottom: number }) {
  const W = 120
  const H = 64
  const stones: [number, number, number][] = []
  for (let r = 0; top + r * H < bottom; r++)
    for (let c = -1; c * W < 1600; c++)
      stones.push([c * W + (r % 2) * (W / 2), top + r * H, (r * 5 + c * 3 + 8) % 4])
  return (
    <g>
      <rect y={top} width={1600} height={bottom - top} fill="#1f1c24" />
      {stones.map(([x, y, s]) => (
        <rect
          key={`${x},${y}`}
          x={x + 3}
          y={y + 3}
          width={W - 6}
          height={H - 6}
          rx={8}
          fill={SHADES[s]}
        />
      ))}
    </g>
  )
}
