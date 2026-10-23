/**
 * Torche fixée à un mur, dont la flamme vacille, à la position (px, py) du repère où elle est
 * dessinée : à placer dans un OnFace pour qu'elle suive la perspective du mur.
 */
export function Torch({ px, py }: { px: number; py: number }) {
  return (
    <g>
      <rect x={px - 3} y={py + 4} width={6} height={2} rx={1} fill="#2a211b" />
      <rect x={px - 1.5} y={py - 2} width={3} height={9} fill="#4a3626" />
      <path className="vmap-flame" d={`M${px},${py - 11} q4,5 0,9 q-4,-4 0,-9 z`} fill="#ffb347" />
    </g>
  )
}
