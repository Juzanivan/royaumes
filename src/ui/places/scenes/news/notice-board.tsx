/** Feuilles clouées sur le panneau : position relative, largeur, hauteur, inclinaison. */
const SHEETS: [number, number, number, number, number][] = [
  [24, 30, 92, 120, -4],
  [130, 22, 104, 84, 3],
  [134, 118, 86, 100, -2],
  [36, 166, 80, 64, 5],
]

/**
 * Panneau d'affichage du crieur, posé au sol au point (x, y) : deux poteaux, un auvent et des
 * feuilles clouées, dont les lignes d'écriture sont figurées par des traits.
 */
export function NoticeBoard({ x, y }: { x: number; y: number }) {
  const top = y - 420
  return (
    <g transform={`translate(${x} ${top})`}>
      <rect x={-6} y={40} width={18} height={380} fill="#5a3b22" />
      <rect x={250} y={40} width={18} height={380} fill="#5a3b22" />
      <path d="M-30,46 L131,0 L292,46 Z" fill="#7a2e22" stroke="#4a1a12" strokeWidth={4} />
      <rect
        x={4}
        y={56}
        width={254}
        height={250}
        rx={4}
        fill="#8a5d36"
        stroke="#5a3b22"
        strokeWidth={8}
      />
      {SHEETS.map(([sx, sy, w, h, a]) => (
        <g
          key={`${sx},${sy}`}
          transform={`translate(${sx + 4} ${sy + 56}) rotate(${a} ${w / 2} 0)`}
        >
          <rect width={w} height={h} fill="#f3e6c8" stroke="#c9b48a" strokeWidth={1.5} />
          {Array.from({ length: Math.floor((h - 18) / 12) }, (_, i) => 16 + i * 12).map((ly) => (
            <line
              key={ly}
              x1={8}
              y1={ly}
              x2={w - 8 - (ly % 3) * 6}
              y2={ly}
              stroke="#8c7a5c"
              strokeWidth={2}
            />
          ))}
          <circle cx={w / 2} cy={6} r={3.5} fill="#5b5b5b" />
        </g>
      ))}
    </g>
  )
}
