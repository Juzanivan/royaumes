import type { Cargo } from '../domain/rules'
import { ROAD } from './landscape'
import { range } from './parallax'

/** Roue à rayons, centrée sur (x, y), de rayon r : elle tourne quand la caravane avance. */
function Wheel({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#3b2a1c" strokeWidth={r * 0.16} />
      <g className="journey-wheel">
        {range(8).map((i) => {
          const a = (i * Math.PI) / 4
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x + Math.cos(a) * r}
              y2={y + Math.sin(a) * r}
              stroke="#5a3b22"
              strokeWidth={r * 0.09}
            />
          )
        })}
      </g>
      <circle cx={x} cy={y} r={r * 0.18} fill="#3b2a1c" />
    </g>
  )
}

/** Cheval de trait, vu de profil vers la droite, les sabots sur la route, au point x. */
export function Horse({
  x,
  color = '#7a4e2c',
  delay = 0,
}: {
  x: number
  color?: string
  delay?: number
}) {
  const y = ROAD
  const legs = [-48, -30, 30, 46]
  return (
    <g transform={`translate(${x} ${y}) scale(1.2) translate(${-x} ${-y})`}>
      <g className="journey-horse" style={{ animationDelay: `${delay}s` }}>
        {legs.map((dx, i) => (
          <rect
            key={dx}
            className={i % 2 === 0 ? 'journey-leg' : 'journey-leg is-odd'}
            x={x + dx - 5}
            y={y - 62}
            width={10}
            height={62}
            rx={4}
            fill={color}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
        <ellipse cx={x} cy={y - 78} rx={64} ry={30} fill={color} />
        <path
          d={`M${x + 44},${y - 92} L${x + 78},${y - 150} L${x + 98},${y - 140} L${x + 70},${y - 80} Z`}
          fill={color}
        />
        <path d={`M${x + 74},${y - 152} l36,-4 a10,10 0 0 1 4,22 l-30,6 Z`} fill={color} />
        <path
          d={`M${x + 70},${y - 150} q-26,20 -30,58`}
          stroke="#2b1d12"
          strokeWidth={9}
          fill="none"
        />
        <path
          d={`M${x - 62},${y - 86} q-26,10 -22,48`}
          stroke="#2b1d12"
          strokeWidth={8}
          fill="none"
        />
        <circle cx={x + 100} cy={y - 146} r={3} fill="#1b120c" />
        {/* Harnais. */}
        <path
          d={`M${x - 40},${y - 100} Q${x},${y - 60} ${x + 50},${y - 96}`}
          stroke="#3b2a1c"
          strokeWidth={6}
          fill="none"
        />
      </g>
    </g>
  )
}

/** Couleur et symbole de chaque ressource chargée dans le chariot. */
const CRATE: Record<string, string> = { wood: '#9b6a3a', stone: '#9aa1a8', gold: '#e2b33c' }

/**
 * Chariot bâché, vu de profil vers la droite, ses roues posées sur la route. Sa cargaison
 * apparaît à l'arrière, en caisses colorées selon la ressource ; les caisses volées par les
 * brigands disparaissent (lost).
 */
export function WagonSide({ x, cargo, lost }: { x: number; cargo: Cargo; lost: boolean }) {
  const y = ROAD
  const crates = Object.entries(cargo).filter(([, amount]) => (amount ?? 0) > 0)
  return (
    <g className="journey-wagon">
      <ellipse cx={x} cy={y + 6} rx={230} ry={14} fill="rgb(0 0 0 / 0.2)" />
      {/* Timon qui relie le chariot aux chevaux. */}
      <rect x={x + 150} y={y - 92} width={150} height={9} rx={4} fill="#5a3b22" />
      {/* Caisses de la cargaison, posées à l'arrière. */}
      <g className={lost ? 'journey-crates is-lost' : 'journey-crates'}>
        {crates.map(([resource], i) => (
          <g key={resource}>
            <rect
              x={x - 210 + i * 46}
              y={y - 190 - (i % 2) * 18}
              width={44}
              height={40}
              fill={CRATE[resource] ?? '#9b6a3a'}
              stroke="#4a3626"
              strokeWidth={4}
            />
            <path
              d={`M${x - 210 + i * 46},${y - 190 - (i % 2) * 18} l44,40 m0,-40 l-44,40`}
              stroke="#4a3626"
              strokeWidth={3}
            />
          </g>
        ))}
      </g>
      {/* Caisse du chariot. */}
      <rect x={x - 200} y={y - 150} width={360} height={58} rx={6} fill="#8a5a2f" />
      <path
        d={`M${x - 200},${y - 130} H${x + 160} M${x - 200},${y - 110} H${x + 160}`}
        stroke="#6b4423"
        strokeWidth={4}
      />
      {/* Bâche tendue sur ses arceaux. */}
      <path
        d={`M${x - 150},${y - 150} C${x - 150},${y - 300} ${x + 150},${y - 300} ${x + 150},${y - 150} Z`}
        className="journey-canvas"
      />
      {[-90, -20, 50, 110].map((dx) => (
        <path
          key={dx}
          d={`M${x + dx},${y - 150} Q${x + dx + 4},${y - 220} ${x + dx * 0.8},${y - 266 + Math.abs(dx) * 0.4}`}
          stroke="#cbbd9f"
          strokeWidth={4}
          fill="none"
        />
      ))}
      {/* Lanterne accrochée à l'avant de la bâche : elle ne s'allume que la nuit. */}
      <line x1={x + 150} y1={y - 160} x2={x + 172} y2={y - 176} stroke="#3b2a1c" strokeWidth={4} />
      <circle className="journey-lantern-glow" cx={x + 174} cy={y - 150} r={70} />
      <rect
        x={x + 164}
        y={y - 172}
        width={20}
        height={26}
        rx={4}
        className="journey-lantern"
        stroke="#3b2a1c"
        strokeWidth={3}
      />
      <Wheel x={x - 140} y={y - 52} r={52} />
      <Wheel x={x + 100} y={y - 52} r={52} />
    </g>
  )
}
