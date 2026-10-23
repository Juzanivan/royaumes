import type { Pt } from '../geometry/iso'

/** Villageois qui fait l'aller-retour entre deux points de l'écran, en duration secondes. */
export function Villager({
  from,
  to,
  color,
  duration,
  delay = 0,
}: {
  from: Pt
  to: Pt
  color: string
  duration: number
  delay?: number
}) {
  return (
    <g
      className="vmap-walker"
      style={{
        offsetPath: `path('M${from[0]},${from[1]} L${to[0]},${to[1]}')`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <ellipse cx={0} cy={1} rx={4} ry={1.6} fill="rgb(0 0 0 / 0.2)" />
      <rect x={-2.5} y={-9} width={5} height={8} rx={2} fill={color} />
      <circle cx={0} cy={-11.5} r={2.6} fill="#f1c9a0" />
    </g>
  )
}
