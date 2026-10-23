import { Lantern } from '../details/lantern'
import { MineCart } from '../details/mine-cart'
import { Sparkle } from '../details/sparkle'
import { iso } from '../geometry/iso'
import { Flag } from '../shapes/flag'

/** Demi-largeur et hauteur du tertre de la mine, en pixels, selon son palier. */
export const mineMound = (tier: number) => ({ width: 46 + tier * 9, height: 34 + tier * 9 })

/**
 * Mine : entrée étayée creusée dans un tertre, rails et wagonnet chargé d'or ; le tertre
 * grandit à chaque palier ; au palier 2, deux lanternes ; au palier 3, des pépites qui
 * scintillent ; au palier 4, un fanion doré.
 */
export function Mine({ x, y, tier }: { x: number; y: number; tier: number }) {
  const [cx, cy] = iso(x, y)
  const { width: w, height: hh } = mineMound(tier)
  return (
    <g>
      <path
        d={`M${cx - w},${cy + 8} Q${cx - w * 0.6},${cy - hh} ${cx},${cy - hh - 6} Q${cx + w * 0.6},${cy - hh} ${cx + w},${cy + 8} Z`}
        fill="#8a7e70"
      />
      <path
        d={`M${cx},${cy - hh - 6} Q${cx + w * 0.6},${cy - hh} ${cx + w},${cy + 8} L${cx},${cy + 8} Z`}
        fill="#6f6458"
      />
      <path
        d={`M${cx - 15},${cy + 4} L${cx - 15},${cy - 17} Q${cx},${cy - 30} ${cx + 15},${cy - 17} L${cx + 15},${cy + 4} Z`}
        fill="#2a211b"
      />
      <path
        d={`M${cx - 17},${cy + 4} L${cx - 17},${cy - 18} M${cx + 17},${cy + 4} L${cx + 17},${cy - 18} M${cx - 20},${cy - 19} L${cx + 20},${cy - 19}`}
        stroke="#7a5532"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d={`M${cx - 6},${cy + 6} L${cx + 30},${cy + 24} M${cx + 4},${cy + 2} L${cx + 40},${cy + 20}`}
        stroke="#5c534b"
        strokeWidth={1.6}
      />
      {tier >= 2 && (
        <g>
          <Lantern px={cx - 24} py={cy + 4} />
          <Lantern px={cx + 24} py={cy + 4} />
        </g>
      )}
      {/* Le wagonnet est devant la lanterne de droite : il est dessiné après elle. */}
      <MineCart px={cx + 26} py={cy + 12} />
      {tier >= 3 && (
        <g>
          <Sparkle px={cx - 28} py={cy - 29} />
          <Sparkle px={cx + 22} py={cy - 42} size={4} delay={0.8} />
        </g>
      )}
      {tier === 4 && <Flag x={x + 0.55} y={y - 0.55} z={hh - 4} color="#e0b23a" />}
    </g>
  )
}
