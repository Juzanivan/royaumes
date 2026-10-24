import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'
import type { Destination } from '@/ui/destinations'
import { look } from '@/ui/theme'
import { NameSign } from '../details/name-sign'
import { iso } from '../geometry/iso'
import { LANDMARKS } from '../layout'
import { NewsSeal } from './crier'
import { LANDMARK_ART } from './landmark-art'

/** Position du parchemin scellé : au-dessus du panneau du crieur, un peu en arrière de la case. */
function seal(x: number, y: number) {
  const [px, py] = iso(x - 0.05, y + 0.2, 44)
  return { px, py }
}

/**
 * Lieu du jeu sur la carte : son dessin et son écriteau, qui apparaît au survol, forment un
 * lien vers sa page. Le lien
 * est un élément <a> du SVG : il se suit au clic et au clavier, et s'ouvre dans un nouvel
 * onglet comme tout lien ; le clic simple navigue sans recharger la page.
 *
 * Avec news, un parchemin scellé flotte au-dessus du lieu : le crieur public a une annonce que
 * le joueur n'a pas lue.
 */
export function MapLandmark({
  destination,
  news = false,
}: {
  destination: Destination
  news?: boolean
}) {
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
      aria-label={news ? `Aller : ${label}, nouvelle annonce` : `Aller : ${label}`}
      onClick={navigate}
    >
      <ellipse className="vmap-halo" cx={gx} cy={gy + 4} rx={58} ry={26} />
      {draw({ x, y })}
      <NameSign px={sx} py={sy} glyph={look(kind).glyph} label={label} />
      {news && <NewsSeal {...seal(x, y)} />}
    </a>
  )
}
