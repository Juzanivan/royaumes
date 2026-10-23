import type { DecorItem } from '../layout'
import { Bush } from './bush'
import { Rock } from './rock'
import { Tree } from './tree'

/** Élément du décor, dessiné selon sa nature. */
export function Decor({ item }: { item: DecorItem }) {
  const { kind, x, y, scale } = item
  if (kind === 'tree') return <Tree x={x} y={y} scale={scale} />
  if (kind === 'rock') return <Rock x={x} y={y} scale={scale} />
  return <Bush x={x} y={y} />
}
