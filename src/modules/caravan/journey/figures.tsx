import { ROAD } from './landscape'

/** Garde à pied, lance à l'épaule et bouclier au bras, au point x de la route. */
export function Guard({ x, delay = 0 }: { x: number; delay?: number }) {
  const y = ROAD + 40
  return (
    <g className="journey-walker" style={{ animationDelay: `${delay}s` }}>
      <rect
        x={x - 12}
        y={y - 50}
        width={9}
        height={50}
        rx={4}
        fill="#3b3f4a"
        className="journey-leg"
      />
      <rect
        x={x + 3}
        y={y - 50}
        width={9}
        height={50}
        rx={4}
        fill="#3b3f4a"
        className="journey-leg is-odd"
      />
      <rect x={x - 22} y={y - 120} width={44} height={74} rx={12} fill="#7b1f2e" />
      <circle cx={x} cy={y - 138} r={18} fill="#f1c9a0" />
      <path d={`M${x - 20},${y - 140} a20,20 0 0 1 40,0 Z`} fill="#9aa1a8" />
      <line x1={x + 30} y1={y - 210} x2={x + 30} y2={y - 20} stroke="#6b4423" strokeWidth={6} />
      <path d={`M${x + 30},${y - 232} l-8,24 h16 Z`} fill="#c9ccd1" />
      <path
        d={`M${x - 46},${y - 112} h38 v40 q-19,22 -38,0 Z`}
        fill="#2c3e8f"
        stroke="#d4a017"
        strokeWidth={4}
      />
    </g>
  )
}

/** Chevalier en armure, monté, sa lance pointée vers l'avant, au point x de la route. */
export function Knight({ x, delay = 0 }: { x: number; delay?: number }) {
  const y = ROAD + 46
  return (
    <g className="journey-horse" style={{ animationDelay: `${delay}s` }}>
      {[-40, -24, 26, 40].map((dx, i) => (
        <rect
          key={dx}
          className={i % 2 === 0 ? 'journey-leg' : 'journey-leg is-odd'}
          x={x + dx - 5}
          y={y - 56}
          width={10}
          height={56}
          rx={4}
          fill="#e9e4da"
        />
      ))}
      <ellipse cx={x} cy={y - 72} rx={56} ry={26} fill="#e9e4da" />
      <path
        d={`M${x + 40},${y - 84} L${x + 70},${y - 136} L${x + 88},${y - 126} L${x + 62},${y - 74} Z`}
        fill="#e9e4da"
      />
      <path d={`M${x + 66},${y - 138} l32,-4 a9,9 0 0 1 4,20 l-26,6 Z`} fill="#e9e4da" />
      {/* Caparaçon aux couleurs du royaume. */}
      <path d={`M${x - 56},${y - 80} h112 v30 q-56,18 -112,0 Z`} fill="#2c3e8f" />
      <path d={`M${x - 56},${y - 62} h112`} stroke="#d4a017" strokeWidth={4} />
      {/* Cavalier. */}
      <rect x={x - 16} y={y - 150} width={34} height={56} rx={10} fill="#9aa1a8" />
      <rect x={x - 12} y={y - 182} width={28} height={34} rx={8} fill="#c9ccd1" />
      <rect x={x - 6} y={y - 170} width={18} height={4} fill="#3b3f4a" />
      <path d={`M${x + 2},${y - 182} q8,-22 22,-18`} stroke="#c0392b" strokeWidth={6} fill="none" />
      <line x1={x + 6} y1={y - 120} x2={x + 190} y2={y - 150} stroke="#6b4423" strokeWidth={7} />
      <path d={`M${x + 190},${y - 150} l24,-6 l-20,16 Z`} fill="#c9ccd1" />
    </g>
  )
}

/** Brigand encapuchonné, poignard à la main, au point x de la route ; flip le tourne vers la gauche. */
export function Brigand({ x, flip = false }: { x: number; flip?: boolean }) {
  const y = ROAD + 50
  // Les brigands sont dessinés un peu plus grands que nature : ils sont au premier plan.
  const grow = `translate(${x} ${y}) scale(1.3) translate(${-x} ${-y})`
  return (
    <g transform={flip ? `translate(${2 * x} 0) scale(-1 1) ${grow}` : grow}>
      <g className="journey-walker">
        <rect
          x={x - 12}
          y={y - 50}
          width={9}
          height={50}
          rx={4}
          fill="#2b2620"
          className="journey-leg"
        />
        <rect
          x={x + 3}
          y={y - 50}
          width={9}
          height={50}
          rx={4}
          fill="#2b2620"
          className="journey-leg is-odd"
        />
        <path
          d={`M${x - 26},${y - 46} L${x - 18},${y - 124} L${x + 18},${y - 124} L${x + 26},${y - 46} Z`}
          fill="#3d3a2e"
        />
        <path
          d={`M${x - 22},${y - 120} a22,26 0 0 1 44,0 l-4,-6 q-18,-30 -36,0 Z`}
          fill="#2a2721"
        />
        <circle cx={x + 2} cy={y - 136} r={16} fill="#2a2721" />
        <path d={`M${x - 20},${y - 136} a22,24 0 0 1 44,-4 l-6,26 h-34 Z`} fill="#3d3a2e" />
        <circle cx={x + 10} cy={y - 136} r={2.6} fill="#ffdf6b" />
        <line
          x1={x + 26}
          y1={y - 96}
          x2={x + 52}
          y2={y - 118}
          stroke="#c9ccd1"
          strokeWidth={5}
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

/** Étincelle d'un choc d'armes, au point (x, y). */
export function Clash({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <path
      className="journey-clash"
      style={{ animationDelay: `${delay}s` }}
      d={`M${x},${y - 34} l9,24 l25,-8 l-17,20 l20,16 l-26,-2 l-6,26 l-8,-24 l-24,10 l15,-20 l-20,-16 l26,2 Z`}
    />
  )
}
