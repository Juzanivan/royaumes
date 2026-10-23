import { Mug } from './bar-counter'

/** Table ronde de premier plan, centrée sur x et posée sur la ligne y, avec deux chopes. */
export function Table({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 6} rx={150} ry={20} fill="rgb(0 0 0 / 0.25)" />
      <rect x={x - 14} y={y - 140} width={28} height={140} fill="#4a2f1b" />
      <ellipse cx={x} cy={y - 140} rx={170} ry={36} fill="#5e3b20" />
      <ellipse cx={x} cy={y - 150} rx={170} ry={36} fill="#8a5a2f" />
      <Mug x={x - 70} y={y - 140} />
      <Mug x={x + 40} y={y - 150} />
      {/* Tabourets. */}
      {[-230, 230].map((dx) => (
        <g key={dx}>
          <rect x={x + dx - 8} y={y - 80} width={16} height={80} fill="#4a2f1b" />
          <ellipse cx={x + dx} cy={y - 84} rx={52} ry={14} fill="#7a4e2c" />
        </g>
      ))}
    </g>
  )
}
