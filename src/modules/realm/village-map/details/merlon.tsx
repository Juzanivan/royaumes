import { Block, type Shade } from '../shapes/block'

/** Merlon : petit bloc de pierre du crénelage d'une tour, posé à l'altitude z. */
export function Merlon({ x, y, z, shade }: { x: number; y: number; z: number; shade: Shade }) {
  return <Block x0={x} y0={y} x1={x + 0.18} y1={y + 0.18} h={7} z0={z} shade={shade} />
}
