import { iso, SIZE } from '../geometry/iso'
import { CASTLE, SLOTS } from '../layout'
import { Villager } from './villager'

/** Villageois qui vont et viennent sur les chemins, entre les portes, le château et la scierie. */
export function Villagers() {
  const [cx, cy] = CASTLE
  const [sx, sy] = SLOTS.sawmill
  return (
    <g>
      <Villager from={iso(cx, SIZE - 0.3)} to={iso(cx, cy + 1.3)} color="#3d6fb5" duration={9} />
      <Villager
        from={iso(SIZE - 0.3, cy)}
        to={iso(cx + 1.3, cy)}
        color="#b5513a"
        duration={11}
        delay={-4}
      />
      <Villager from={iso(sx + 0.9, sy)} to={iso(cx, sy)} color="#6b8f3a" duration={8} delay={-2} />
    </g>
  )
}
