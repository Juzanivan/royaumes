import { range } from '../../parts/range'
/** Pavés de la place, du haut du sol (y) jusqu'au bas de la scène, de plus en plus grands. */
export function Cobbles({ y }: { y: number }) {
  const rows: { cy: number; h: number }[] = []
  for (let cy = y + 10, h = 16; cy < 920; cy += h + 6, h *= 1.18) rows.push({ cy, h })
  return (
    <g>
      <rect y={y} width={1600} height={900 - y} className="place-ground" />
      {rows.map(({ cy, h }, r) => {
        const w = h * 2.4
        const offset = r % 2 === 0 ? 0 : w / 2
        return range(Math.ceil(1600 / w) + 2).map((i) => (
          <rect
            key={`${cy},${i}`}
            className="place-cobble"
            x={i * w - offset}
            y={cy}
            width={w - 6}
            height={h}
            rx={h / 3}
          />
        ))
      })}
    </g>
  )
}
