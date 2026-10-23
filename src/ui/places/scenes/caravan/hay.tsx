/** Botte de foin, posée par son coin inférieur gauche au point (x, y), de largeur w. */
export function Hay({ x, y, w = 140 }: { x: number; y: number; w?: number }) {
  const h = w * 0.55
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} rx={10} fill="#e2c15a" />
      <rect x={x} y={y - h} width={w} height={h * 0.25} rx={10} fill="#efd27a" />
      {[0.3, 0.7].map((t) => (
        <rect key={t} x={x + w * t - 4} y={y - h} width={8} height={h} fill="#a07a2c" />
      ))}
      <path
        d={`M${x + 10},${y - h * 0.5} h${w - 20} M${x + 10},${y - h * 0.3} h${w - 20}`}
        stroke="#c9a240"
        strokeWidth={3}
      />
    </g>
  )
}
