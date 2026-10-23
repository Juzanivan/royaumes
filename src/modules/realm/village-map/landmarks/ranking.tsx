import { PodiumStep } from '../details/podium-step'
import { iso } from '../geometry/iso'
import { Flag } from '../shapes/flag'

/** Classement : podium de pierre à trois marches, coupe d'or au sommet, fanions de part et d'autre. */
export function Ranking({ x, y }: { x: number; y: number }) {
  const [tx, ty] = iso(x, y, 30)
  return (
    <g>
      <PodiumStep x={x} y={y - 0.44} h={18} rank={2} />
      <PodiumStep x={x} y={y} h={30} rank={1} />
      <PodiumStep x={x} y={y + 0.44} h={10} rank={3} />
      <g className="vmap-trophy">
        <path
          d={`M${tx - 7},${ty - 22} h14 q0,12 -7,13 q-7,-1 -7,-13 z`}
          fill="#e8b93c"
          stroke="#a67c1a"
        />
        <rect x={tx - 2} y={ty - 9} width={4} height={5} fill="#c99a2a" />
        <rect x={tx - 6} y={ty - 4} width={12} height={3} rx={1} fill="#a67c1a" />
      </g>
      <Flag x={x - 0.5} y={y - 0.7} z={0} h={34} color="#3d6fb5" />
      <Flag x={x + 0.45} y={y + 0.75} z={0} h={34} color="#c2412d" />
    </g>
  )
}
