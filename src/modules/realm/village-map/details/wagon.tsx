/**
 * Chariot bâché tiré par un cheval, vu de profil et dessiné vers la droite, ses roues posées
 * au point (0, 0). Le composant qui le place le retourne pour qu'il roule vers la gauche.
 */
export function Wagon({ color = '#8a5a2f' }: { color?: string }) {
  return (
    <g>
      <ellipse cx={-2} cy={1} rx={17} ry={3} fill="rgb(0 0 0 / 0.22)" />
      {/* Cheval. */}
      <g className="vmap-wagon-horse">
        <rect x={6} y={-10} width={10} height={5} rx={2.5} fill="#7a4e2c" />
        <path d="M15,-9 l4,-5 l2,1 l-2,6 z" fill="#7a4e2c" />
        <line x1={8} y1={-5} x2={8} y2={0} stroke="#5a3820" strokeWidth={1.5} />
        <line x1={14} y1={-5} x2={14} y2={0} stroke="#5a3820" strokeWidth={1.5} />
      </g>
      {/* Caisse, bâche et roues. */}
      <rect x={-16} y={-9} width={20} height={6} rx={1} fill={color} />
      <path d="M-15,-9 C-15,-19 3,-19 3,-9 Z" fill="#f3ead7" stroke="#cbbd9f" strokeWidth={0.8} />
      <line x1={4} y1={-6} x2={7} y2={-7} stroke="#5a3820" strokeWidth={1.2} />
      <circle cx={-12} cy={-2.5} r={3} fill="#4a3626" />
      <circle cx={0} cy={-2.5} r={3} fill="#4a3626" />
    </g>
  )
}
