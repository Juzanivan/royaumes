/** Caisse de bois carrée de côté s, posée par son coin inférieur gauche au point (x, y). */
export function Crate({ x, y, s = 70 }: { x: number; y: number; s?: number }) {
  return (
    <g>
      <rect x={x} y={y - s} width={s} height={s} fill="#b07a42" stroke="#6b4423" strokeWidth={5} />
      <path
        d={`M${x},${y - s} L${x + s},${y} M${x + s},${y - s} L${x},${y}`}
        stroke="#6b4423"
        strokeWidth={5}
      />
    </g>
  )
}
