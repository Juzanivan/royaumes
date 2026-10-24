'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Indique si le joueur est en train d'écrire : la touche Échap ne doit pas alors le faire sortir. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)

/** Bord de l'écran qui fait quitter le lieu. */
export type Edge = 'left' | 'right'

/**
 * Sorties d'un lieu par ses extrémités : une bande sur chaque bord indiqué. Au survol, la bande
 * s'assombrit jusqu'au noir, et la souris devient un petit homme qui s'en va ; un clic ramène
 * au village. Le reste du décor ne réagit pas au clic. Au clavier, la touche Échap fait de
 * même, et la mise en page du jeu offre un lien d'évitement ; sur un écran tactile, la croix
 * de la mise en page remplace les bandes. À l'arrivée, une consigne rappelle le geste.
 */
export function EdgeExits({
  edges = ['left', 'right'],
  to = '/village',
  label = 'Retour au village',
}: {
  edges?: Edge[]
  to?: string
  label?: string
}) {
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isTyping(e.target)) router.push(to)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, to])

  return (
    <>
      {edges.map((edge) => (
        // Les bandes sont cachées aux lecteurs d'écran : leurs équivalents sont la touche Échap
        // et le lien d'évitement de la mise en page.
        <div
          key={edge}
          className={`edge-exit is-${edge}`}
          onClick={() => router.push(to)}
          aria-hidden="true"
        >
          <span className="edge-exit-label">{label}</span>
        </div>
      ))}
      <p className="exit-tip" aria-hidden="true">
        <span className="exit-tip-pointer">
          Approchez-vous {edges.length > 1 ? "d'un bord" : 'du bord gauche'} pour retourner au
          village · Échap
        </span>
        <span className="exit-tip-touch">Touchez la croix pour retourner au village</span>
      </p>
    </>
  )
}
