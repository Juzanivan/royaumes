import type { Pt } from '../geometry/iso'

/** Ce que porte un villageois : rien, un fagot de bois, un seau ou un panier. */
export type Burden = 'none' | 'wood' | 'bucket' | 'basket'

/** Objet porté par un villageois, dessiné contre son flanc. */
function Carried({ burden }: { burden: Burden }) {
  switch (burden) {
    case 'wood':
      return (
        <g>
          <rect x={-5} y={-11} width={10} height={3} rx={1.5} fill="#9b6a3a" />
          <rect x={-4} y={-13.5} width={8} height={3} rx={1.5} fill="#b07a42" />
        </g>
      )
    case 'bucket':
      return (
        <g>
          <path d="M2.5,-5 h4 l-0.6,4 h-2.8 Z" fill="#8f8a84" />
          <path d="M2.5,-5 q2,-2.5 4,0" stroke="#5a5550" strokeWidth={0.6} fill="none" />
        </g>
      )
    case 'basket':
      return (
        <g>
          <path d="M-7,-6 h4.5 l-0.6,3 h-3.3 Z" fill="#c9a240" />
          <circle cx={-5.6} cy={-6.4} r={0.9} fill="#d64533" />
          <circle cx={-4.2} cy={-6.6} r={0.9} fill="#e0b23a" />
        </g>
      )
    case 'none':
      return null
  }
}

/**
 * Villageois qui fait l'aller-retour entre deux points de l'écran, en duration secondes.
 * Son vêtement est de la couleur color ; il peut porter un fardeau et un chapeau.
 */
export function Villager({
  from,
  to,
  color,
  duration,
  delay = 0,
  burden = 'none',
  hat,
}: {
  from: Pt
  to: Pt
  color: string
  duration: number
  delay?: number
  burden?: Burden
  hat?: string
}) {
  return (
    <g
      className="vmap-walker"
      style={{
        offsetPath: `path('M${from[0]},${from[1]} L${to[0]},${to[1]}')`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <g className="vmap-walker-step" style={{ animationDelay: `${delay}s` }}>
        <ellipse cx={0} cy={1} rx={4} ry={1.6} fill="rgb(0 0 0 / 0.2)" />
        <rect x={-2.5} y={-9} width={5} height={8} rx={2} fill={color} />
        <circle cx={0} cy={-11.5} r={2.6} fill="#f1c9a0" />
        {hat && <path d="M-3.4,-12.6 h6.8 l-1.4,-2.6 h-4 Z" fill={hat} />}
        <Carried burden={burden} />
      </g>
    </g>
  )
}
