import { range } from './range'
/** Plancher en perspective, de la ligne y au bas de la scène : les lattes fuient vers le centre. */
export function FloorBoards({ y }: { y: number }) {
  const lines = range(25).map((i) => -800 + i * 133)
  return (
    <g>
      <rect y={y} width={1600} height={900 - y} fill="#6a4426" />
      {lines.map((bx) => (
        <line
          key={bx}
          x1={800 + (bx - 800) * 0.35}
          y1={y}
          x2={bx}
          y2={900}
          stroke="#4f311a"
          strokeWidth={3}
        />
      ))}
      {[0.18, 0.42, 0.72].map((t) => (
        <line
          key={t}
          x1={0}
          y1={y + (900 - y) * t}
          x2={1600}
          y2={y + (900 - y) * t}
          stroke="#5a391f"
          strokeWidth={2}
          opacity={0.6}
        />
      ))}
    </g>
  )
}
