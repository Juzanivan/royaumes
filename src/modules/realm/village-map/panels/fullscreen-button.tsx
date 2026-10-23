import { type RefObject, useEffect, useState } from 'react'

/**
 * Bouton qui affiche la carte en plein écran, sans l'interface du navigateur, puis l'en fait
 * sortir. Il n'apparaît pas si le navigateur ne permet pas le plein écran.
 */
export function FullscreenButton({ target }: { target: RefObject<HTMLElement | null> }) {
  const [supported, setSupported] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    setSupported(document.fullscreenEnabled)
    const onChange = () => setActive(document.fullscreenElement === target.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [target])

  if (!supported) return null
  const toggle = () => (active ? document.exitFullscreen() : target.current?.requestFullscreen())
  return (
    <button
      type="button"
      className="vmap-icon"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? 'Quitter le plein écran' : 'Plein écran'}
    >
      <span aria-hidden="true">⛶</span>
      <span className="vmap-icon-label"> {active ? 'Quitter le plein écran' : 'Plein écran'}</span>
    </button>
  )
}
