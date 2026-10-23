/** Nuage de largeur relative s, qui dérive lentement de gauche à droite (durée d en secondes). */
export function Cloud({ x, y, s = 1, d = 90 }: { x: number; y: number; s?: number; d?: number }) {
  return (
    <g className="place-cloud" style={{ animationDuration: `${d}s` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={0} rx={70} ry={26} />
        <ellipse cx={-40} cy={8} rx={44} ry={20} />
        <ellipse cx={45} cy={6} rx={50} ry={22} />
        <ellipse cx={10} cy={-16} rx={42} ry={24} />
      </g>
    </g>
  )
}
