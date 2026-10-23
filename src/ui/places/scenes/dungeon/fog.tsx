/** Brume qui traîne au ras du sol et dérive lentement, en deux nappes décalées. */
export function Fog({ y }: { y: number }) {
  return (
    <g>
      <defs>
        <linearGradient id="dungeon-fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9a8d8" stopOpacity="0" />
          <stop offset="1" stopColor="#b9a8d8" stopOpacity="0.22" />
        </linearGradient>
        <filter id="dungeon-fog-blur" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>
      {[0, 1].map((i) => (
        <g
          key={i}
          className="dungeon-fog"
          filter="url(#dungeon-fog-blur)"
          style={{ animationDelay: `${-i * 14}s` }}
        >
          {[-400, 200, 800, 1400].map((cx) => (
            <ellipse
              key={cx}
              cx={cx + i * 300}
              cy={y + 30 * i}
              rx={420}
              ry={90}
              fill="url(#dungeon-fog)"
            />
          ))}
        </g>
      ))}
    </g>
  )
}
