import { SIZE } from '../geometry/iso'
import { CASTLE, LANDMARKS, SLOTS } from '../layout'
import { PathSegment } from './path-segment'

/** Réseau de chemins : des deux portes au château, puis du château à chaque bâtiment et à chaque lieu. */
export function Paths() {
  const [cx, cy] = CASTLE
  const { sawmill, quarry, mine } = SLOTS
  const { dungeon, ranking, market, tavern, caravan } = LANDMARKS
  return (
    <g>
      <PathSegment x0={cx} y0={cy} x1={cx} y1={SIZE} />
      <PathSegment x0={cx} y0={cy} x1={SIZE} y1={cy} />
      <PathSegment x0={sawmill[0]} y0={sawmill[1]} x1={cx} y1={sawmill[1]} />
      <PathSegment x0={quarry[0]} y0={quarry[1]} x1={quarry[0]} y1={cy} />
      <PathSegment x0={mine[0]} y0={mine[1]} x1={cx} y1={mine[1]} />
      <PathSegment x0={cx} y0={mine[1]} x1={cx} y1={cy} />
      <PathSegment x0={cx} y0={dungeon[1]} x1={cx} y1={mine[1]} />
      <PathSegment x0={ranking[0]} y0={ranking[1]} x1={cx} y1={ranking[1]} />
      <PathSegment x0={market[0]} y0={cy} x1={market[0]} y1={market[1]} />
      <PathSegment x0={tavern[0]} y0={tavern[1]} x1={cx} y1={tavern[1]} />
      <PathSegment x0={caravan[0]} y0={caravan[1]} x1={tavern[0]} y1={caravan[1]} />
    </g>
  )
}
