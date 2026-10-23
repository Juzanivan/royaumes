/** Une marche du podium, centrée sur x et posée sur la ligne y, avec son rang gravé. */
function Step({
  x,
  y,
  h,
  rank,
  color,
}: {
  x: number
  y: number
  h: number
  rank: number
  color: string
}) {
  return (
    <g>
      <rect x={x - 90} y={y - h} width={180} height={h} fill={color} />
      <rect x={x - 90} y={y - h} width={180} height={14} fill="rgb(255 255 255 / 0.25)" />
      <text
        x={x}
        y={y - h / 2 + 22}
        textAnchor="middle"
        fontSize={64}
        fontWeight={800}
        fill="rgb(0 0 0 / 0.35)"
      >
        {rank}
      </text>
    </g>
  )
}

/** Coupe d'or posée par sa base au point (x, y), qui scintille. */
function Trophy({ x, y }: { x: number; y: number }) {
  return (
    <g className="ranking-trophy">
      <rect x={x - 40} y={y - 22} width={80} height={22} rx={4} fill="#8a5a2f" />
      <rect x={x - 10} y={y - 60} width={20} height={40} fill="#d4a017" />
      <path
        d={`M${x - 55},${y - 150} H${x + 55} Q${x + 50},${y - 60} ${x},${y - 56} Q${x - 50},${y - 60} ${x - 55},${y - 150} Z`}
        fill="#f1c40f"
      />
      <path
        d={`M${x - 55},${y - 136} q-40,6 -30,40 q8,20 34,16`}
        stroke="#d4a017"
        strokeWidth={9}
        fill="none"
      />
      <path
        d={`M${x + 55},${y - 136} q40,6 30,40 q-8,20 -34,16`}
        stroke="#d4a017"
        strokeWidth={9}
        fill="none"
      />
      <path
        d={`M${x - 34},${y - 140} Q${x - 30},${y - 90} ${x - 8},${y - 74}`}
        stroke="rgb(255 255 255 / 0.5)"
        strokeWidth={8}
        fill="none"
      />
      <path
        className="ranking-sparkle"
        d={`M${x + 70},${y - 190} l6,18 l18,6 l-18,6 l-6,18 l-6,-18 l-18,-6 l18,-6 Z`}
        fill="#fff6c2"
      />
    </g>
  )
}

/** Podium des trois premiers, centré sur x et posé sur la ligne y, surmonté du trophée. */
export function Podium({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 4} rx={320} ry={24} fill="rgb(0 0 0 / 0.2)" />
      <Step x={x - 180} y={y} h={130} rank={2} color="#b8c1c9" />
      <Step x={x + 180} y={y} h={95} rank={3} color="#c98b4a" />
      <Step x={x} y={y} h={180} rank={1} color="#e2b33c" />
      <Trophy x={x} y={y - 180} />
    </g>
  )
}
