/** Tour ronde du château vue de face, centrée sur x, posée sur la ligne y, de hauteur h. */
function Tower({ x, y, w, h, roof }: { x: number; y: number; w: number; h: number; roof: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill="#cfc3ad" />
      <rect x={x + w * 0.15} y={y - h} width={w * 0.35} height={h} fill="rgb(0 0 0 / 0.1)" />
      <path
        d={`M${x - w / 2 - 8},${y - h} L${x},${y - h - w * 1.2} L${x + w / 2 + 8},${y - h} Z`}
        fill={roof}
      />
      <path
        d={`M${x},${y - h - w * 1.2} V${y - h - w * 1.2 - 36}`}
        stroke="#4a3626"
        strokeWidth={3}
      />
      <path
        className="title-flag"
        d={`M${x},${y - h - w * 1.2 - 36} h30 l-8,9 l8,9 h-30 Z`}
        fill="#c0392b"
      />
      <rect className="place-window" x={x - 6} y={y - h * 0.62} width={12} height={22} rx={6} />
    </g>
  )
}

/**
 * Château du royaume, dressé sur sa colline : une enceinte crénelée, un donjon central et
 * quatre tours aux toits bleus, dont les fenêtres s'allument la nuit.
 */
export function TitleCastle({ x, y }: { x: number; y: number }) {
  const merlons = Array.from({ length: 13 }, (_, i) => x - 180 + i * 30)
  return (
    <g>
      {/* Enceinte et créneaux. */}
      <rect x={x - 190} y={y - 120} width={380} height={120} fill="#bfb29a" />
      {merlons.map((mx) => (
        <rect key={mx} x={mx - 8} y={y - 138} width={16} height={20} fill="#bfb29a" />
      ))}
      {/* Donjon central. */}
      <rect x={x - 70} y={y - 270} width={140} height={270} fill="#d6cbb5" />
      <rect x={x + 20} y={y - 270} width={50} height={270} fill="rgb(0 0 0 / 0.1)" />
      <path d={`M${x - 84},${y - 270} L${x},${y - 380} L${x + 84},${y - 270} Z`} fill="#3f5a8a" />
      <rect className="place-window" x={x - 40} y={y - 230} width={18} height={30} rx={9} />
      <rect className="place-window" x={x + 22} y={y - 230} width={18} height={30} rx={9} />
      <path d={`M${x - 30},${y} V${y - 60} a30,30 0 0 1 60,0 V${y} Z`} fill="#4a3626" />
      <Tower x={x - 190} y={y} w={60} h={190} roof="#3f5a8a" />
      <Tower x={x + 190} y={y} w={60} h={190} roof="#3f5a8a" />
      <Tower x={x - 110} y={y - 10} w={46} h={220} roof="#4b6a9e" />
      <Tower x={x + 110} y={y - 10} w={46} h={220} roof="#4b6a9e" />
    </g>
  )
}
