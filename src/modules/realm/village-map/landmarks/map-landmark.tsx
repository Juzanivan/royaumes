import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'
import type { Destination } from '@/ui/destinations'
import { look } from '@/ui/theme'
import { iso } from '../geometry/iso'
import { LANDMARKS } from '../layout'
import { LANDMARK_ART } from './landmark-art'
import { LandmarkSign } from './landmark-sign'

/**
 * Lieu du jeu sur la carte : son dessin et son écriteau forment un lien vers sa page. Le lien
 * est un élément <a> du SVG : il se suit au clic et au clavier, et s'ouvre dans un nouvel
 * onglet comme tout lien ; le clic simple navigue sans recharger la page.
 */
export function MapLandmark({ destination }: { destination: Destination }) {
  const router = useRouter()
  const { href, kind, label } = destination
  const [x, y] = LANDMARKS[kind]
  const { draw, signHeight } = LANDMARK_ART[kind]
  const [gx, gy] = iso(x, y)
  const [sx, sy] = iso(x, y, signHeight)
  const navigate = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    router.push(href)
  }
  return (
    <a
      href={href}
      className="vmap-building vmap-landmark"
      aria-label={`Aller : ${label}`}
      onClick={navigate}
    >
      <ellipse className="vmap-halo" cx={gx} cy={gy + 4} rx={58} ry={26} />
      {draw({ x, y })}
      <LandmarkSign px={sx} py={sy} glyph={look(kind).glyph} label={label} />
    </a>
  )
}
