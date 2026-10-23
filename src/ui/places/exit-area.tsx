'use client'
import { useRouter } from 'next/navigation'
import { type MouseEvent, type ReactNode, useEffect, useState } from 'react'

/** Indique si le joueur est en train d'écrire : la touche Échap ne doit pas alors le faire sortir. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)

/**
 * Zone dont un clic fait quitter le lieu : le décor d'un lieu, ou la scène d'une vue en plein
 * écran. Au survol, une étiquette suit la souris et indique où mène le clic ; à l'arrivée, une
 * consigne rappelle brièvement le geste. Au clavier, la touche Échap fait de même, et la mise en
 * page du jeu offre en outre un lien d'évitement, le premier élément atteint par tabulation.
 */
export function ExitArea({
  to = '/village',
  label = 'Retour au village',
  className,
  children,
}: {
  to?: string
  label?: string
  className?: string
  children: ReactNode
}) {
  const router = useRouter()
  const [hint, setHint] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isTyping(e.target)) router.push(to)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, to])

  // Les éléments interactifs du décor (le soleil ou la lune) portent data-no-exit : survolés,
  // ils masquent l'étiquette ; cliqués, ils ne font pas sortir du lieu.
  const inert = (e: MouseEvent) => (e.target as Element).closest('[data-no-exit]') !== null
  const follow = (e: MouseEvent) => setHint(inert(e) ? null : { x: e.clientX, y: e.clientY })
  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: équivalents au clavier : Échap, et le lien d'évitement de la mise en page. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: la touche Échap est écoutée sur toute la page. */}
      <div
        className={className ? `${className} exit-area` : 'exit-area'}
        onClick={(e) => {
          if (!inert(e)) router.push(to)
        }}
        onMouseMove={follow}
        onMouseLeave={() => setHint(null)}
      >
        {children}
      </div>
      {hint && (
        <div className="exit-hint" style={{ left: hint.x, top: hint.y }} aria-hidden="true">
          <span aria-hidden="true">🚪</span> {label}
        </div>
      )}
      <p className="exit-tip" aria-hidden="true">
        <span className="exit-tip-pointer">Cliquez sur le décor pour quitter le lieu · Échap</span>
        <span className="exit-tip-touch">Touchez le décor ou la croix pour quitter le lieu</span>
      </p>
    </>
  )
}
