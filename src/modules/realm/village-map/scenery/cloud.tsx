/** Nuage qui traverse le ciel, à la hauteur y ; le délai décale son passage. */
export function Cloud({ y, delay, scale }: { y: number; delay: number; scale: number }) {
  return (
    <g className="vmap-cloud" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(0 ${y}) scale(${scale})`}>
        <ellipse cx={0} cy={0} rx={34} ry={12} />
        <ellipse cx={-18} cy={-6} rx={18} ry={11} />
        <ellipse cx={14} cy={-9} rx={20} ry={13} />
      </g>
    </g>
  )
}
