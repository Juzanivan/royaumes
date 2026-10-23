/**
 * Crieur public, debout au point (x, y), qui agite sa cloche au-dessus de sa tête : la cloche
 * se balance (classe news-bell, animée par la feuille de style).
 */
export function Crier({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.6)`}>
      <ellipse cx={0} cy={0} rx={34} ry={6} fill="rgb(0 0 0 / 0.25)" />
      <path d="M-14,0 v-42 h10 v42 z M4,0 v-42 h10 v42 z" fill="#3b2a1c" />
      <path d="M-26,-40 L-20,-110 h40 L26,-40 Z" fill="#2f5d8a" stroke="#1f3f5f" strokeWidth={2} />
      <path d="M-20,-110 h40 v10 h-40 z" fill="#c9a227" />
      <path d="M18,-100 L40,-138" stroke="#2f5d8a" strokeWidth={9} strokeLinecap="round" />
      <path d="M-18,-100 L-34,-70" stroke="#2f5d8a" strokeWidth={9} strokeLinecap="round" />
      <circle cx={0} cy={-124} r={15} fill="#e9c39b" />
      <path d="M-20,-132 Q0,-162 20,-132 Z" fill="#7a2e22" />
      <path d="M8,-148 q20,-10 26,4" stroke="#e8e0c8" strokeWidth={3} fill="none" />
      <g className="news-bell">
        <g transform="translate(42 -142)">
          <rect x={-2} y={-18} width={4} height={14} fill="#5a3b22" />
          <path
            d="M-11,10 Q-11,-6 0,-6 Q11,-6 11,10 Z"
            fill="#d4a62a"
            stroke="#8a6a14"
            strokeWidth={1.5}
          />
          <circle cx={0} cy={12} r={2.5} fill="#8a6a14" />
        </g>
      </g>
    </g>
  )
}
