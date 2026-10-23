import { iso } from '../geometry/iso'
import { POND } from '../layout'

/** Mare devant le village, dont la surface se ride. */
export function Pond() {
  const [px, py] = iso(...POND)
  return (
    <g>
      <ellipse cx={px} cy={py} rx={46} ry={20} fill="#6f9fc0" stroke="#d9c49a" strokeWidth={4} />
      <ellipse className="vmap-ripple" cx={px - 8} cy={py - 2} rx={14} ry={5} />
      <ellipse
        className="vmap-ripple"
        cx={px + 14}
        cy={py + 4}
        rx={10}
        ry={4}
        style={{ animationDelay: '1.3s' }}
      />
    </g>
  )
}
