/** Torche fixée au mur, dont la flamme vacille, à la position (px, py) de l'écran. */
export function Torch({ px, py }: { px: number; py: number }) {
  return (
    <g>
      <rect x={px - 1.5} y={py - 2} width={3} height={9} fill="#4a3626" />
      <path className="vmap-flame" d={`M${px},${py - 11} q4,5 0,9 q-4,-4 0,-9 z`} fill="#ffb347" />
    </g>
  )
}
