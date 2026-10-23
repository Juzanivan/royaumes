import { range } from '../../parts/range'

/** Couleurs des reliures, alternées le long des rayons. */
const BINDINGS = ['#7b1f2e', '#2c3e8f', '#1e6b4a', '#8a5a2f', '#5b3d8a', '#a67c2e']

/** Rangée de livres posée sur un rayon, de x à x + w, à la hauteur y. */
function Books({ x, y, w, seed }: { x: number; y: number; w: number; seed: number }) {
  const books: { bx: number; bw: number; bh: number; c: number; lean: boolean }[] = []
  for (let bx = x + 6, i = seed; bx < x + w - 30; i++) {
    const bw = 18 + ((i * 7) % 4) * 5
    books.push({
      bx,
      bw,
      bh: 70 + ((i * 11) % 5) * 8,
      c: (i * 5) % BINDINGS.length,
      lean: i % 9 === 4,
    })
    bx += bw + 2
  }
  return (
    <g>
      {books.map(({ bx, bw, bh, c, lean }) => (
        <g key={bx} transform={lean ? `rotate(12 ${bx + bw} ${y})` : undefined}>
          <rect x={bx} y={y - bh} width={bw} height={bh} rx={2} fill={BINDINGS[c]} />
          <rect x={bx + 3} y={y - bh + 12} width={bw - 6} height={4} fill="#d4a017" opacity={0.8} />
          <rect x={bx + 3} y={y - 20} width={bw - 6} height={4} fill="#d4a017" opacity={0.8} />
        </g>
      ))}
    </g>
  )
}

/** Bibliothèque de bois, de largeur w, du plafond (top) au sol (bottom), garnie de livres. */
export function Bookshelf({
  x,
  w,
  top,
  bottom,
  seed = 0,
}: {
  x: number
  w: number
  top: number
  bottom: number
  seed?: number
}) {
  const shelves = Math.floor((bottom - top - 40) / 120)
  return (
    <g>
      <rect x={x} y={top} width={w} height={bottom - top} fill="#3e2716" />
      <rect x={x + 18} y={top + 20} width={w - 36} height={bottom - top - 40} fill="#2c1b0f" />
      {range(shelves).map((i) => {
        const y = top + 20 + (i + 1) * 120
        return (
          <g key={y}>
            <Books x={x + 18} y={y} w={w - 36} seed={seed + i * 13} />
            <rect x={x + 18} y={y} width={w - 36} height={12} fill="#5e3b20" />
          </g>
        )
      })}
      <rect x={x - 10} y={top} width={w + 20} height={24} fill="#5e3b20" />
    </g>
  )
}
