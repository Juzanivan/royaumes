import { range } from '../../parts/range'
/**
 * Grande porte voûtée du donjon, centrée sur x et posée sur la ligne y : une lueur violette
 * monte des profondeurs, derrière une herse à demi levée.
 */
export function Gate({ x, y }: { x: number; y: number }) {
  const w = 380
  const h = 470
  const r = w / 2
  const arch = `M${x - r},${y} V${y - h + r} A${r},${r} 0 0 1 ${x + r},${y - h + r} V${y} Z`
  const voussoirs = range(11).map((i) => Math.PI - (i * Math.PI) / 10)
  return (
    <g>
      <defs>
        <radialGradient id="dungeon-depths" cx="0.5" cy="0.75" r="0.7">
          <stop offset="0" stopColor="#9b59ff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#3d1a6e" />
          <stop offset="1" stopColor="#0b0710" />
        </radialGradient>
      </defs>
      <path d={arch} fill="url(#dungeon-depths)" className="dungeon-depths" />
      {/* Marches qui descendent dans l'obscurité. */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={x - r + 30 + i * 22}
          y={y - 30 - i * 26}
          width={w - 60 - i * 44}
          height={10}
          fill="#5b3d8a"
          opacity={0.5 - i * 0.1}
        />
      ))}
      {/* Herse : barreaux verticaux et traverses, levée jusqu'au tiers de la porte. */}
      <g className="dungeon-portcullis">
        <clipPath id="dungeon-arch">
          <path d={arch} />
        </clipPath>
        <g clipPath="url(#dungeon-arch)">
          {range(9).map((i) => (
            <rect
              key={i}
              x={x - r + 18 + i * 44}
              y={y - h - 20}
              width={10}
              height={h * 0.7}
              fill="#16131a"
            />
          ))}
          {[0.15, 0.35, 0.55].map((t) => (
            <rect key={t} x={x - r} y={y - h + h * t} width={w} height={9} fill="#16131a" />
          ))}
          {range(9).map((i) => (
            <path
              key={i}
              d={`M${x - r + 16 + i * 44},${y - h * 0.3 - 20} l7,22 l7,-22 z`}
              fill="#16131a"
            />
          ))}
        </g>
      </g>
      {/* Claveaux de l'arc. */}
      {voussoirs.map((a) => {
        const cx = x + Math.cos(a) * (r + 26)
        const cy = y - h + r - Math.sin(a) * (r + 26)
        return (
          <rect
            key={a}
            x={cx - 26}
            y={cy - 22}
            width={52}
            height={44}
            rx={6}
            fill="#4a4452"
            transform={`rotate(${90 - (a * 180) / Math.PI} ${cx} ${cy})`}
          />
        )
      })}
      <rect x={x - r - 52} y={y - h + r} width={52} height={h - r} fill="#4a4452" />
      <rect x={x + r} y={y - h + r} width={52} height={h - r} fill="#4a4452" />
      {/* Clé de voûte ornée d'un crâne. */}
      <circle cx={x} cy={y - h - 26} r={24} fill="#cfc6b8" />
      <circle cx={x - 9} cy={y - h - 28} r={6} fill="#1f1c24" />
      <circle cx={x + 9} cy={y - h - 28} r={6} fill="#1f1c24" />
      <rect x={x - 10} y={y - h - 12} width={20} height={10} rx={2} fill="#cfc6b8" />
    </g>
  )
}
