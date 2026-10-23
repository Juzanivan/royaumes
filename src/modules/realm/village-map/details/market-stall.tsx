import { iso, pts } from '../geometry/iso'
import { Block } from '../shapes/block'

const COUNTER = { left: '#c58a52', right: '#9c6639', top: '#d9a26b' }
/** Hauteur du comptoir, et de l'auvent à l'arrière et à l'avant, en pixels. */
const COUNTER_HEIGHT = 12
const AWNING_BACK = 30
const AWNING_FRONT = 22

/** Poteau de l'auvent, planté au point (x, y), jusqu'à la hauteur h. */
function Post({ x, y, h }: { x: number; y: number; h: number }) {
  const [px, py] = iso(x, y)
  return <line x1={px} y1={py} x2={px} y2={py - h} stroke="#6b4a2f" strokeWidth={2} />
}

/**
 * Étal du marché, centré au point (x, y) : deux poteaux à l'arrière, le comptoir et ses
 * marchandises, deux poteaux à l'avant, puis l'auvent rayé qui les couvre, dessinés du fond
 * vers l'avant.
 */
export function MarketStall({
  x,
  y,
  color,
  goods,
}: {
  x: number
  y: number
  color: string
  goods: string[]
}) {
  const corners = [
    iso(x - 0.42, y - 0.32, AWNING_BACK),
    iso(x + 0.42, y - 0.32, AWNING_BACK),
    iso(x + 0.48, y + 0.42, AWNING_FRONT),
    iso(x - 0.36, y + 0.42, AWNING_FRONT),
  ]
  return (
    <g>
      <Post x={x - 0.4} y={y - 0.3} h={AWNING_BACK} />
      <Post x={x + 0.4} y={y - 0.3} h={AWNING_BACK} />
      <Block
        x0={x - 0.4}
        y0={y - 0.25}
        x1={x + 0.4}
        y1={y + 0.25}
        h={COUNTER_HEIGHT}
        shade={COUNTER}
      />
      {goods.map((g, i) => {
        const [px, py] = iso(x - 0.2 + i * 0.2, y, COUNTER_HEIGHT + 3)
        return (
          <circle key={`${px},${py}`} cx={px} cy={py} r={3.4} fill={g} stroke="rgb(0 0 0 / 0.2)" />
        )
      })}
      <Post x={x - 0.36} y={y + 0.38} h={AWNING_FRONT} />
      <Post x={x + 0.44} y={y + 0.38} h={AWNING_FRONT} />
      <polygon points={pts(corners)} fill={color} />
      <polygon points={pts(corners)} fill="url(#vmap-stripes)" />
    </g>
  )
}
