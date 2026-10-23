/** Plafond aux poutres apparentes, jusqu'à la hauteur h. */
export function CeilingBeams({ h }: { h: number }) {
  return (
    <g>
      <rect width={1600} height={h} fill="#3e2716" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={i * 260 - 30} y={0} width={46} height={h + 10} fill="#2c1b0f" />
      ))}
      <rect y={h - 10} width={1600} height={34} fill="#2c1b0f" />
      <rect y={h + 20} width={1600} height={6} fill="rgb(0 0 0 / 0.25)" />
    </g>
  )
}
