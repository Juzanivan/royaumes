/** Chariot bâché à l'arrêt, timon au sol, centré sur x et posé sur la ligne y. */
export function ParkedWagon({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 4} rx={230} ry={18} fill="rgb(0 0 0 / 0.25)" />
      <path
        d={`M${x + 160},${y - 80} L${x + 330},${y - 6}`}
        stroke="#5a3b22"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <rect x={x - 200} y={y - 150} width={360} height={60} rx={6} fill="#8a5a2f" />
      <path d={`M${x - 200},${y - 128} H${x + 160}`} stroke="#6b4423" strokeWidth={4} />
      <path
        d={`M${x - 150},${y - 150} C${x - 150},${y - 300} ${x + 150},${y - 300} ${x + 150},${y - 150} Z`}
        fill="#f3ead7"
        stroke="#cbbd9f"
        strokeWidth={4}
      />
      {[-140, 100].map((dx) => (
        <g key={dx}>
          <circle cx={x + dx} cy={y - 50} r={50} fill="none" stroke="#3b2a1c" strokeWidth={9} />
          {[0, 45, 90, 135].map((a) => (
            <line
              key={a}
              x1={x + dx - Math.cos((a * Math.PI) / 180) * 50}
              y1={y - 50 - Math.sin((a * Math.PI) / 180) * 50}
              x2={x + dx + Math.cos((a * Math.PI) / 180) * 50}
              y2={y - 50 + Math.sin((a * Math.PI) / 180) * 50}
              stroke="#5a3b22"
              strokeWidth={5}
            />
          ))}
          <circle cx={x + dx} cy={y - 50} r={9} fill="#3b2a1c" />
        </g>
      ))}
    </g>
  )
}
