'use client'
import { useEffect, useState } from 'react'
import type { Resource } from '../../contracts'

/** Intervalle minimal entre deux chiffres qui s'élèvent : en deçà, ils se chevaucheraient. */
const MIN_PULSE_S = 1.5

/**
 * Rythme des chiffres qui s'élèvent au-dessus d'un bâtiment : « +1 » à chaque unité produite.
 * Une production trop rapide pour être lue unité par unité est regroupée, par exemple
 * « +2 » toutes les 2 secondes plutôt que « +1 » chaque seconde.
 */
export function pulseOf(perMinute: number): { amount: number; seconds: number } {
  const unit = 60 / perMinute
  const amount = Math.max(1, Math.ceil(MIN_PULSE_S / unit))
  return { amount, seconds: unit * amount }
}

/**
 * Chiffre qui s'élève au-dessus d'un bâtiment à chaque unité produite, à la couleur de sa
 * ressource : la scierie de niveau 1, qui produit 10 bois par minute, affiche « +1 » toutes
 * les 6 secondes. Il apparaît au moment où le compteur de la ressource augmente, en haut de la
 * carte : anchor est l'un de ces instants, dans l'horloge locale.
 */
export function ProductionFloat({
  px,
  py,
  resource,
  perMinute,
  anchor,
}: {
  px: number
  py: number
  resource: Resource
  perMinute: number
  anchor: number
}) {
  const { amount, seconds } = pulseOf(perMinute)
  // Chaque unité produite fait apparaître un nouveau chiffre : le changement de clé recrée
  // l'élément, qui rejoue son animation d'une seconde et demie.
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined
    const period = seconds * 1000
    const delay = (((anchor - Date.now()) % period) + period) % period
    const start = setTimeout(() => {
      setPulse((n) => n + 1)
      timer = setInterval(() => setPulse((n) => n + 1), period)
    }, delay)
    return () => {
      clearTimeout(start)
      clearInterval(timer)
    }
  }, [seconds, anchor])
  if (pulse === 0) return null
  return (
    <text key={pulse} className={`vmap-float vmap-float-${resource}`} x={px} y={py}>
      +{amount}
    </text>
  )
}
