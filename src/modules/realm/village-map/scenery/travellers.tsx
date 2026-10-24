'use client'
import { useRouter } from 'next/navigation'
import { type MouseEvent, useEffect, useState } from 'react'
import { Wagon } from '../details/wagon'
import { iso, type Pt } from '../geometry/iso'
import { CARAVAN_ROUTE } from '../layout'

/**
 * Voyageur à dessiner sur la carte : une caravane qui quitte le village, ou qui y arrive,
 * entre deux instants de l'horloge locale. La carte ne sait rien de plus de la Caravane : le
 * module qui en fournit la liste choisit le lien et le libellé.
 */
export interface MapTraveller {
  id: string
  href: string
  /** Libellé lu par les lecteurs d'écran, et affiché au survol. */
  label: string
  /** out : du relais vers la porte du village ; in : de la porte vers le relais. */
  direction: 'out' | 'in'
  /** Départ et arrivée, en millisecondes de l'horloge locale. */
  from: number
  to: number
}

/** Fréquence de mise à jour de la position des chariots ; une transition CSS lisse le mouvement. */
const TICK_MS = 500

/** Route des chariots à l'écran, et longueur de chacun de ses tronçons. */
const ROUTE: Pt[] = CARAVAN_ROUTE.map(([x, y]) => iso(x, y))
const LENGTHS = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]))
const TOTAL = LENGTHS.reduce((sum, length) => sum + length, 0)

/** Position sur la route à la fraction t de son parcours, et sens du tronçon (vers la droite ?). */
function along(t: number): { at: Pt; right: boolean } {
  let rest = Math.min(1, Math.max(0, t)) * TOTAL
  for (let i = 0; i < LENGTHS.length; i++) {
    const [a, b] = [ROUTE[i], ROUTE[i + 1]]
    if (rest <= LENGTHS[i] || i === LENGTHS.length - 1) {
      const k = LENGTHS[i] === 0 ? 0 : rest / LENGTHS[i]
      return { at: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], right: b[0] >= a[0] }
    }
    rest -= LENGTHS[i]
  }
  return { at: ROUTE[ROUTE.length - 1], right: true }
}

/** Un chariot sur la route : un lien vers la vue de sa caravane. */
function Traveller({ traveller, now }: { traveller: MapTraveller; now: number }) {
  const router = useRouter()
  const { href, label, direction, from, to } = traveller
  const progress = (now - from) / Math.max(1, to - from)
  // Une caravane qui arrive parcourt la route à l'envers : de la porte au relais.
  const t = direction === 'out' ? progress : 1 - progress
  const { at, right } = along(t)
  const facingRight = direction === 'out' ? right : !right
  const navigate = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    router.push(href)
  }
  return (
    <a href={href} className="vmap-traveller" aria-label={label} onClick={navigate}>
      <g className="vmap-traveller-move" style={{ transform: `translate(${at[0]}px, ${at[1]}px)` }}>
        <circle className="vmap-halo" cx={0} cy={-6} r={18} />
        <g transform={facingRight ? 'scale(1.35)' : 'scale(-1.35 1.35)'}>
          <Wagon />
        </g>
      </g>
    </a>
  )
}

/** Chariots des caravanes en route, entre le relais et la porte sud du village. */
export function Travellers({ travellers }: { travellers: MapTraveller[] }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (travellers.length === 0) return
    const timer = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(timer)
  }, [travellers.length])
  const onRoad = travellers.filter((t) => now < t.to)
  return (
    <g>
      {onRoad.map((traveller) => (
        <Traveller key={traveller.id} traveller={traveller} now={now} />
      ))}
    </g>
  )
}
