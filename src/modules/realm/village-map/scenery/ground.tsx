import type { ReactNode } from 'react'
import { iso, pts, SIZE } from '../geometry/iso'

/** Épaisseur de terre visible sous le terrain, en pixels. */
const DEPTH = 18

/** Terrain : le losange d'herbe, son épaisseur de terre et le quadrillage discret des cases. */
export function Ground() {
  const top = iso(0, 0)
  const right = iso(SIZE, 0)
  const bottom = iso(SIZE, SIZE)
  const left = iso(0, SIZE)
  const lines: ReactNode[] = []
  for (let i = 1; i < SIZE; i++) {
    const a = iso(i, 0)
    const b = iso(i, SIZE)
    const c = iso(0, i)
    const d = iso(SIZE, i)
    lines.push(<line key={`x${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />)
    lines.push(<line key={`y${i}`} x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />)
  }
  return (
    <g>
      <polygon
        points={pts([left, bottom, [bottom[0], bottom[1] + DEPTH], [left[0], left[1] + DEPTH]])}
        fill="#8a5f3c"
      />
      <polygon
        points={pts([bottom, right, [right[0], right[1] + DEPTH], [bottom[0], bottom[1] + DEPTH]])}
        fill="#6e4a2e"
      />
      <polygon points={pts([top, right, bottom, left])} fill="url(#vmap-grass)" />
      <g className="vmap-grid">{lines}</g>
    </g>
  )
}
