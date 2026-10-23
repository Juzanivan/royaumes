import { iso } from '../geometry/iso'

/** Grue de levage en bois : un mât au point (x, y), une flèche vers (tipX, tipY), un bloc suspendu. */
export function Crane({ x, y, tipX, tipY }: { x: number; y: number; tipX: number; tipY: number }) {
  const [a1, a2] = iso(x, y)
  const [t1, t2] = iso(x, y, 60)
  const [e1, e2] = iso(tipX, tipY, 64)
  return (
    <g stroke="#6b4a2f" strokeWidth={2.5} fill="none">
      <line x1={a1} y1={a2} x2={t1} y2={t2} />
      <line x1={t1} y1={t2} x2={e1} y2={e2} />
      <line x1={e1} y1={e2} x2={e1} y2={e2 + 22} stroke="#4a3626" strokeWidth={1} />
      <rect
        x={e1 - 5}
        y={e2 + 22}
        width={10}
        height={7}
        fill="#d8d2c7"
        stroke="#958f85"
        strokeWidth={1}
      />
    </g>
  )
}
