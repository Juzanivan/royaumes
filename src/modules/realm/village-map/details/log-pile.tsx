import { Log } from './log'

/** Tas de grumes : trois au sol et deux par-dessus, à partir du point (x, y). */
export function LogPile({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <Log key={`bas-${i}`} x={x} y={y + i * 0.24} />
      ))}
      {[0, 1].map((i) => (
        <Log key={`haut-${i}`} x={x} y={y + 0.12 + i * 0.24} lift={8} />
      ))}
    </g>
  )
}
