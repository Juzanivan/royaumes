import { ROAD } from './landscape'

/** Stalactites qui pendent à la voûte de l'entrée : position et longueur. */
const STALACTITES: [number, number][] = [
  [1340, 38],
  [1372, 22],
  [1405, 46],
  [1440, 28],
  [1478, 40],
  [1510, 20],
]

/** Lueurs des lanternes de l'escorte qui fouille la grotte : position et décalage d'animation. */
const LIGHTS: [number, number, number][] = [
  [1390, 600, 0],
  [1450, 560, 1.1],
  [1500, 620, 2.3],
]

/** Cristaux qui scintillent dans l'ombre de la grotte. */
const CRYSTALS: [number, number, number][] = [
  [1356, 640, 0.4],
  [1530, 585, 1.6],
  [1468, 650, 2.6],
]

/**
 * Grotte au bout de la route : une falaise rocheuse, percée d'une entrée sombre. Pendant
 * l'exploration, les lanternes de l'escorte s'y déplacent, et quelques cristaux scintillent.
 */
export function Cave({ exploring }: { exploring: boolean }) {
  const y = ROAD + 10
  return (
    <g>
      <defs>
        <radialGradient id="journey-cave-dark" cx="0.5" cy="0.75" r="0.7">
          <stop offset="0" stopColor="#050403" />
          <stop offset="1" stopColor="#1f1a17" />
        </radialGradient>
      </defs>
      {/* Falaise : deux masses de roche, la plus claire devant. */}
      <path
        d={`M1180,${y} C1200,520 1230,380 1300,300 C1360,230 1460,200 1560,230 L1640,250 V${y} Z`}
        fill="#6e6862"
      />
      <path
        d={`M1220,${y} C1240,560 1270,440 1320,380 C1380,320 1470,300 1560,330 L1640,340 V${y} Z`}
        fill="#857e76"
      />
      <path
        d="M1300,360 l40,-18 l30,22 M1500,320 l36,10 M1250,520 l30,-10"
        stroke="#5e5852"
        strokeWidth={5}
        fill="none"
      />
      {/* Entrée de la grotte. */}
      <path
        d={`M1310,${y} C1310,560 1350,470 1425,470 C1500,470 1545,560 1545,${y} Z`}
        fill="url(#journey-cave-dark)"
        stroke="#4e4842"
        strokeWidth={8}
      />
      {STALACTITES.map(([x, h]) => (
        <path key={x} d={`M${x - 9},${484 - (x % 3) * 3} l9,${h} l9,-${h} Z`} fill="#4e4842" />
      ))}
      <g className={exploring ? 'journey-cave-inside is-exploring' : 'journey-cave-inside'}>
        {CRYSTALS.map(([x, cy, d]) => (
          <path
            key={x}
            className="journey-crystal"
            style={{ animationDelay: `${d}s` }}
            d={`M${x},${cy} l7,-18 l7,18 l-7,8 Z`}
          />
        ))}
        {LIGHTS.map(([x, cy, d]) => (
          <g key={x} className="journey-cave-light" style={{ animationDelay: `${d}s` }}>
            <circle cx={x} cy={cy} r={34} fill="url(#journey-glow)" />
            <circle cx={x} cy={cy} r={5} fill="#ffd27a" />
          </g>
        ))}
      </g>
      {/* Torche plantée à l'entrée. */}
      <rect x={1280} y={y - 150} width={8} height={150} fill="#4a3626" />
      <circle className="journey-lantern-glow" cx={1284} cy={y - 162} r={60} />
      <path
        className="journey-torch"
        d={`M1284,${y - 186} c-12,14 -10,26 0,30 c10,-4 12,-16 0,-30 Z`}
      />
    </g>
  )
}
