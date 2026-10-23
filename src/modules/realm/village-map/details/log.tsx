import { iso } from '../geometry/iso'

/** Grume vue de face, posée au point (x, y), soulevée de lift pixels dans un tas. */
export function Log({ x, y, lift = 0 }: { x: number; y: number; lift?: number }) {
  const [px, py] = iso(x, y)
  return <ellipse cx={px} cy={py - 5 - lift} rx={5.5} ry={4.5} fill="#b07a46" stroke="#7a4f2a" />
}
