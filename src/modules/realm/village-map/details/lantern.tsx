/** Lanterne allumée en haut d'un poteau, plantée à la position (px, py) de l'écran. */
export function Lantern({ px, py }: { px: number; py: number }) {
  return (
    <g>
      <line x1={px} y1={py} x2={px} y2={py - 20} stroke="#4a3626" strokeWidth={1.6} />
      <circle className="vmap-lantern" cx={px} cy={py - 22} r={3.8} fill="#ffcf5a" />
    </g>
  )
}
