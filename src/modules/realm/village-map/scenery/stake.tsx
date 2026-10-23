import { iso } from '../geometry/iso'

/** Pieu de palissade, planté au point (x, y). */
export function Stake({ x, y }: { x: number; y: number }) {
  const [px, py] = iso(x, y)
  return <rect className="vmap-stake" x={px - 2} y={py - 14} width={4} height={14} rx={1.5} />
}
