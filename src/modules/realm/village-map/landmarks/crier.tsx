import { iso } from '../geometry/iso'
import { OnFace } from '../shapes/on-face'

/**
 * Crieur public, au coin de la place : un panneau d'affichage couvert d'un petit auvent, où sont
 * clouées les annonces, et le crieur qui agite sa cloche à côté.
 */
export function Crier({ x, y }: { x: number; y: number }) {
  // Pieds du panneau, sur le bord gauche de la case ; le crieur se tient devant, à droite.
  const [p0x, p0y] = iso(x - 0.35, y + 0.2)
  const [p1x, p1y] = iso(x + 0.25, y + 0.2)
  const [cx, cy] = iso(x + 0.35, y + 0.65)
  return (
    <g>
      <ellipse
        cx={(p0x + p1x) / 2}
        cy={(p0y + p1y) / 2 + 2}
        rx={22}
        ry={7}
        fill="rgb(0 0 0 / 0.15)"
      />
      {/* Poteaux. */}
      <line x1={p0x} y1={p0y} x2={p0x} y2={p0y - 30} stroke="#5a3b22" strokeWidth={3} />
      <line x1={p1x} y1={p1y} x2={p1x} y2={p1y - 30} stroke="#5a3b22" strokeWidth={3} />
      {/* Panneau et affiches, plaqués sur la face gauche. */}
      <OnFace face="left" x={x - 0.35} y={y + 0.2} z={10}>
        <rect
          x={-1}
          y={-18}
          width={21}
          height={16}
          rx={1}
          fill="#8a5d36"
          stroke="#5a3b22"
          strokeWidth={1.5}
        />
        <rect x={2} y={-16} width={6} height={8} fill="#f3e6c8" />
        <rect x={10} y={-15} width={7} height={6} fill="#f3e6c8" />
        <rect x={9} y={-8.5} width={6} height={5} fill="#f3e6c8" />
        <path d="M-3,-18 L9.5,-25 L22,-18 Z" fill="#7a2e22" />
      </OnFace>
      {/* Le crieur, sa cloche levée. */}
      <g transform={`translate(${cx} ${cy})`}>
        <ellipse cx={0} cy={0} rx={5} ry={2} fill="rgb(0 0 0 / 0.2)" />
        <path d="M-3,0 v-5 M2,0 v-5" stroke="#3b2a1c" strokeWidth={2} />
        <path d="M-4,-5 L-3,-14 h6 L4,-5 Z" fill="#2f5d8a" />
        <rect x={-3} y={-14} width={6} height={1.6} fill="#c9a227" />
        <circle cx={0} cy={-16.5} r={2.6} fill="#e9c39b" />
        <path d="M-3,-17.5 Q0,-22 3,-17.5 Z" fill="#7a2e22" />
        <path d="M3,-12 L7,-19" stroke="#2f5d8a" strokeWidth={2} strokeLinecap="round" />
        <g className="vmap-crier-bell">
          <path
            d="M5.5,-23 q2,-1 3.5,0 l1,3.5 h-5.5 Z"
            fill="#d4a62a"
            stroke="#8a6a14"
            strokeWidth={0.6}
          />
        </g>
      </g>
    </g>
  )
}

/**
 * Parchemin scellé qui flotte au-dessus du crieur, centré en (px, py), quand il a une annonce que
 * le joueur n'a pas lue. Il sautille quelques fois à l'arrivée sur la carte, puis s'immobilise.
 */
export function NewsSeal({ px, py }: { px: number; py: number }) {
  return (
    <g className="vmap-news">
      <g className="vmap-news-float">
        <path
          d={`M${px - 11},${py - 26} h22 v24 l-4,-3 l-4,3 l-3.5,-3 l-3.5,3 l-3.5,-3 l-3.5,3 Z`}
          fill="#f3e6c8"
          stroke="#8a6a3a"
          strokeWidth={1.5}
        />
        <path
          d={`M${px - 7},${py - 20} h14 M${px - 7},${py - 15} h14 M${px - 7},${py - 10} h9`}
          stroke="#8c7a5c"
          strokeWidth={1.5}
        />
        <circle cx={px + 7} cy={py - 4} r={5} fill="#b3261e" stroke="#7a1712" strokeWidth={1} />
      </g>
    </g>
  )
}
