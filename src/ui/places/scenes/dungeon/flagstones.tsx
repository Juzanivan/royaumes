import { range } from '../../parts/range'
/** Sol de dalles en perspective, de la ligne y au bas de la scène. */
export function Flagstones({ y }: { y: number }) {
  const rays = range(17).map((i) => -800 + i * 200)
  return (
    <g>
      <rect y={y} width={1600} height={900 - y} fill="#2a2630" />
      {rays.map((bx) => (
        <line
          key={bx}
          x1={800 + (bx - 800) * 0.3}
          y1={y}
          x2={bx}
          y2={900}
          stroke="#18151c"
          strokeWidth={4}
        />
      ))}
      {[0.15, 0.38, 0.7].map((t) => (
        <line
          key={t}
          x1={0}
          y1={y + (900 - y) * t}
          x2={1600}
          y2={y + (900 - y) * t}
          stroke="#18151c"
          strokeWidth={4}
        />
      ))}
    </g>
  )
}
