/**
 * Maison à colombages vue de face : base posée sur la ligne y, largeur w, hauteur h des murs,
 * toit pointu de couleur roof. Ses fenêtres s'allument la nuit (classe place-window).
 */
export function Facade({
  x,
  y,
  w,
  h,
  wall,
  roof,
}: {
  x: number
  y: number
  w: number
  h: number
  wall: string
  roof: string
}) {
  const top = y - h
  const beam = '#5a3b22'
  const win = (wx: number, wy: number) => (
    <g key={`${wx},${wy}`}>
      <rect className="place-window" x={wx} y={wy} width={34} height={44} rx={3} />
      <path
        d={`M${wx + 17},${wy} V${wy + 44} M${wx},${wy + 22} H${wx + 34}`}
        stroke={beam}
        strokeWidth={4}
      />
      <rect x={wx - 4} y={wy + 44} width={42} height={6} fill={beam} />
    </g>
  )
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={wall} />
      {/* Colombages : poutres horizontales, montants et croix de Saint-André. */}
      <path
        d={`M${x},${top + h * 0.45} H${x + w} M${x},${top + 4} H${x + w} M${x + 4},${top} V${y} M${x + w - 4},${top} V${y} M${x + w / 2},${top} V${top + h * 0.45}`}
        stroke={beam}
        strokeWidth={8}
      />
      <path
        d={`M${x + 4},${top + 4} L${x + w / 2},${top + h * 0.45} M${x + w - 4},${top + 4} L${x + w / 2},${top + h * 0.45}`}
        stroke={beam}
        strokeWidth={6}
        opacity={0.8}
      />
      <path
        d={`M${x - 16},${top + 2} L${x + w / 2},${top - w * 0.55} L${x + w + 16},${top + 2} Z`}
        fill={roof}
      />
      <path d={`M${x - 16},${top + 2} H${x + w + 16}`} stroke="rgb(0 0 0 / 0.25)" strokeWidth={6} />
      {win(x + w * 0.18, top + h * 0.12)}
      {win(x + w * 0.82 - 34, top + h * 0.12)}
      {win(x + w * 0.18, top + h * 0.58)}
      <path
        d={`M${x + w * 0.62},${y} V${top + h * 0.62} a${w * 0.1},${w * 0.1} 0 0 1 ${w * 0.2},0 V${y} Z`}
        fill="#4a2f1b"
      />
    </g>
  )
}
