import { OnFace } from '../shapes/on-face'

/** Scie circulaire qui tourne, fixée sur le mur avant gauche au point (x, y, z), de rayon r. */
export function SawBlade({ x, y, z, r }: { x: number; y: number; z: number; r: number }) {
  return (
    <OnFace face="left" x={x} y={y} z={z}>
      <g className="vmap-saw" style={{ transformOrigin: '0px 0px' }}>
        <circle
          cx={0}
          cy={0}
          r={r}
          fill="#d8dde3"
          stroke="#7d868f"
          strokeWidth={1.4}
          strokeDasharray="2 2"
        />
        <circle cx={0} cy={0} r={1.8} fill="#5c636a" />
      </g>
    </OnFace>
  )
}
