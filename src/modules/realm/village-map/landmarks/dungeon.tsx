import { Merlon } from '../details/merlon'
import { Torch } from '../details/torch'
import { iso } from '../geometry/iso'
import { Block } from '../shapes/block'

const STONE = { left: '#6f6a74', right: '#55505a', top: '#85808a' }

/** Donjon : tour de pierre sombre et crénelée, porte ouverte sur une lueur inquiétante, torches. */
export function Dungeon({ x, y }: { x: number; y: number }) {
  const h = 70
  const x0 = x - 0.55
  const x1 = x + 0.55
  const y0 = y - 0.55
  const y1 = y + 0.55
  const [dx, dy] = iso(x - 0.05, y1, 0)
  // Merlons le long des deux bords visibles du sommet.
  const merlons = [0, 0.3, 0.6, 0.92].flatMap((t) => [
    { mx: x0 + t, my: y1 - 0.18 },
    { mx: x1 - 0.18, my: y0 + t },
  ])
  return (
    <g>
      <Block x0={x0} y0={y0} x1={x1} y1={y1} h={h} shade={STONE} />
      {merlons.map(({ mx, my }) => (
        <Merlon key={`${mx},${my}`} x={mx} y={my} z={h} shade={STONE} />
      ))}
      <path className="vmap-portal" d={`M${dx - 9},${dy} l0,-16 q9,-12 18,0 l0,16 z`} />
      <Torch px={dx - 16} py={dy - 18} />
      <Torch px={dx + 16} py={dy - 18} />
      {/* Meurtrières. */}
      {[30, 50].map((z) => {
        const [wx, wy] = iso(x1, y, z)
        return <rect key={z} x={wx - 1.5} y={wy - 6} width={3} height={8} fill="#2a211b" />
      })}
    </g>
  )
}
