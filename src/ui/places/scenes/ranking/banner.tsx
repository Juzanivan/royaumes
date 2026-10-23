/** Emblème brodé au centre d'une bannière. */
type Emblem = 'crown' | 'sword' | 'tower'

function EmblemShape({ x, y, emblem }: { x: number; y: number; emblem: Emblem }) {
  if (emblem === 'crown')
    return (
      <path
        d={`M${x - 30},${y + 18} V${y - 14} l15,14 l15,-24 l15,24 l15,-14 V${y + 18} Z`}
        fill="#f1c40f"
      />
    )
  if (emblem === 'sword')
    return (
      <g fill="#ecf0f1">
        <path d={`M${x - 5},${y + 10} V${y - 40} l5,-10 l5,10 V${y + 10} Z`} />
        <rect x={x - 22} y={y + 10} width={44} height={8} rx={3} fill="#f1c40f" />
        <rect x={x - 4} y={y + 18} width={8} height={22} fill="#8a5a2f" />
      </g>
    )
  return (
    <g fill="#ecf0f1">
      <rect x={x - 20} y={y - 20} width={40} height={50} />
      <path d={`M${x - 26},${y - 20} v-14 h10 v8 h10 v-8 h12 v8 h10 v-8 h10 v14 Z`} />
    </g>
  )
}

/**
 * Bannière héraldique suspendue à une hampe au point (x, y), de largeur w et de longueur l :
 * elle ondule doucement.
 */
export function Banner({
  x,
  y,
  w,
  l,
  color,
  emblem,
}: {
  x: number
  y: number
  w: number
  l: number
  color: string
  emblem: Emblem
}) {
  return (
    <g>
      <rect x={x - w / 2 - 20} y={y - 8} width={w + 40} height={10} rx={5} fill="#5a3b22" />
      <circle cx={x - w / 2 - 22} cy={y - 3} r={9} fill="#d4a017" />
      <circle cx={x + w / 2 + 22} cy={y - 3} r={9} fill="#d4a017" />
      <g className="ranking-banner" style={{ transformOrigin: `${x}px ${y}px` }}>
        <path
          d={`M${x - w / 2},${y} H${x + w / 2} V${y + l} L${x},${y + l - w * 0.4} L${x - w / 2},${y + l} Z`}
          fill={color}
        />
        <path
          d={`M${x - w / 2 + 10},${y} V${y + l - 18} M${x + w / 2 - 10},${y} V${y + l - 18}`}
          stroke="#d4a017"
          strokeWidth={5}
        />
        <EmblemShape x={x} y={y + l * 0.4} emblem={emblem} />
      </g>
    </g>
  )
}
