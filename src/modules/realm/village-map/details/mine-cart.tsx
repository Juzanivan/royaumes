/** Wagonnet chargé de pépites d'or, dessiné à la position (px, py) de l'écran. */
export function MineCart({ px, py }: { px: number; py: number }) {
  return (
    <g transform={`translate(${px} ${py})`}>
      <path d="M-10,-7 L10,-7 L8,4 L-8,4 Z" fill="#6b4a2f" stroke="#4a3626" />
      <circle cx={-5} cy={5} r={2.4} fill="#3a322b" />
      <circle cx={5} cy={5} r={2.4} fill="#3a322b" />
      <g fill="#e8b93c">
        <circle cx={-4} cy={-8} r={2.6} />
        <circle cx={1} cy={-9} r={3.2} />
        <circle cx={5} cy={-7} r={2.2} />
      </g>
    </g>
  )
}
