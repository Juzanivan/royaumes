import { range } from './parallax'

/** Ciel de la route : son dégradé suit le jour et la nuit, comme celui de la carte du village. */
export function JourneySky() {
  return (
    <g>
      <defs>
        <radialGradient id="journey-glow">
          <stop offset="0" stopColor="#ffcf73" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="journey-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="journey-sky-top" />
          <stop offset="1" className="journey-sky-bottom" />
        </linearGradient>
      </defs>
      <rect width={1600} height={700} fill="url(#journey-sky)" />
      <g className="journey-stars">
        {range(40).map((i) => (
          <circle key={i} cx={(i * 397) % 1600} cy={(i * 131) % 380} r={1.2 + (i % 3) * 0.5} />
        ))}
      </g>
      <g className="journey-clouds">
        {[
          [200, 120, 1],
          [760, 70, 0.8],
          [1250, 150, 1.1],
        ].map(([x, y, s]) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <ellipse cx={0} cy={0} rx={80} ry={26} />
            <ellipse cx={-45} cy={10} rx={50} ry={20} />
            <ellipse cx={50} cy={8} rx={55} ry={22} />
            <ellipse cx={10} cy={-18} rx={45} ry={24} />
          </g>
        ))}
      </g>
    </g>
  )
}
