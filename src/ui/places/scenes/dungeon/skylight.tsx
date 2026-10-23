import { range } from '../../parts/range'
import { SceneCelestial } from '../../parts/scene-celestial'

/**
 * Soupirail du donjon : une ouverture ronde, haut dans le mur, fermée par des barreaux. C'est
 * la seule vue sur le dehors : on y aperçoit le ciel, et le soleil ou la lune, qu'un clic fait
 * se coucher pour passer du jour à la nuit. Les barreaux restent devant l'astre.
 */
export function Skylight({ x, y, r }: { x: number; y: number; r: number }) {
  const opening = `M${x - r},${y} a${r},${r} 0 1 0 ${2 * r},0 a${r},${r} 0 1 0 ${-2 * r},0 Z`
  return (
    <g>
      <circle cx={x} cy={y} r={r + 18} fill="#4a4452" />
      <circle
        cx={x}
        cy={y}
        r={r + 18}
        fill="none"
        stroke="#2f2b35"
        strokeWidth={4}
        strokeDasharray="22 10"
      />
      <path d={opening} fill="url(#place-sky)" />
      <g className="place-stars">
        <circle cx={x - r * 0.4} cy={y - r * 0.3} r={1.8} />
        <circle cx={x + r * 0.2} cy={y + r * 0.4} r={1.4} />
      </g>
      <SceneCelestial
        x={x + r * 0.2}
        y={y - r * 0.15}
        scale={r / 55}
        drop={r * 1.8}
        clip={opening}
      />
      {/* Barreaux, dessinés devant l'astre : ils ne captent pas les clics. */}
      <g className="dungeon-bars" stroke="#16131a" strokeWidth={7} strokeLinecap="round">
        {range(3).map((i) => {
          const bx = x - r * 0.5 + i * r * 0.5
          const half = Math.sqrt(r * r - (bx - x) ** 2)
          return <line key={i} x1={bx} y1={y - half} x2={bx} y2={y + half} />
        })}
        <line x1={x - r} y1={y} x2={x + r} y2={y} />
      </g>
      <path d={opening} fill="none" stroke="#1f1c24" strokeWidth={6} />
    </g>
  )
}
