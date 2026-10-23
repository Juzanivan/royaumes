import { PodiumStep, STEP_HALF_X } from '../details/podium-step'
import { iso } from '../geometry/iso'
import { Flag } from '../shapes/flag'

/** Hauteur de la marche de chaque place, en pixels. */
const FIRST = 34
const SECOND = 24
const THIRD = 16

/**
 * Classement : podium de pierre à trois marches côte à côte, la deuxième place à gauche, la
 * première au centre, la troisième à droite, chacune avec son rang gravé en façade ; une coupe
 * d'or sur la plus haute, un fanion de chaque côté. Les marches sont dessinées de gauche à droite,
 * c'est-à-dire du fond vers l'avant.
 */
export function Ranking({ x, y }: { x: number; y: number }) {
  const step = 2 * STEP_HALF_X
  const [tx, ty] = iso(x, y, FIRST)
  return (
    <g>
      <Flag x={x - step - 0.4} y={y - 0.2} z={0} h={40} color="#3d6fb5" />
      <PodiumStep x={x - step} y={y} h={SECOND} rank={2} />
      <PodiumStep x={x} y={y} h={FIRST} rank={1} />
      <PodiumStep x={x + step} y={y} h={THIRD} rank={3} />
      <g className="vmap-trophy">
        <path
          d={`M${tx - 7},${ty - 22} h14 q0,12 -7,13 q-7,-1 -7,-13 z`}
          fill="#e8b93c"
          stroke="#a67c1a"
        />
        <rect x={tx - 2} y={ty - 9} width={4} height={5} fill="#c99a2a" />
        <rect x={tx - 6} y={ty - 4} width={12} height={3} rx={1} fill="#a67c1a" />
      </g>
      <Flag x={x + step + 0.4} y={y + 0.1} z={0} h={40} color="#c2412d" />
    </g>
  )
}
