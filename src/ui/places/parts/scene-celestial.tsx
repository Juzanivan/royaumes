'use client'
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { useColorTheme } from '../../color-theme'

/** Durée du coucher, puis du lever de l'astre suivant, en millisecondes : celle du village. */
const HALF = 900

/** Soleil centré sur l'origine, dont les rayons tournent lentement. */
function Sun() {
  return (
    <g>
      <circle r={34} className="vmap-sun-glow" />
      <g className="vmap-sun-rays">
        {Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2).map((a) => (
          <line
            key={a}
            x1={Math.cos(a) * 26}
            y1={Math.sin(a) * 26}
            x2={Math.cos(a) * 34}
            y2={Math.sin(a) * 34}
          />
        ))}
      </g>
      <circle r={21} fill="#ffd54a" stroke="#f5b82e" strokeWidth={2} />
    </g>
  )
}

/** Lune en croissant centrée sur l'origine, avec ses cratères, découpée par un masque. */
function Moon() {
  const mask = useId()
  return (
    <g>
      <defs>
        <mask id={mask}>
          <rect x={-30} y={-30} width={60} height={60} fill="white" />
          <circle cx={10} cy={-7} r={17} fill="black" />
        </mask>
      </defs>
      <circle r={30} className="vmap-moon-glow" />
      <g mask={`url(#${mask})`}>
        <circle r={20} fill="#f4f0dc" />
        <circle cx={-9} cy={6} r={3.2} fill="#ddd6b8" />
        <circle cx={-3} cy={13} r={2} fill="#ddd6b8" />
      </g>
    </g>
  )
}

/**
 * Astre d'un décor : le soleil le jour, la lune la nuit, comme dans le ciel du village. Un clic,
 * ou Entrée au clavier, le fait se coucher ; le thème change alors, et l'astre suivant se lève.
 * Il remplace le bouton de thème : dans la Taverne, on l'aperçoit par la fenêtre ; au Marché,
 * en plein ciel. Placé avant les bâtiments, il se couche derrière eux ; placé dans une fenêtre,
 * il disparaît sous son appui (clip). Sans animation (réglage du système), le thème change
 * aussitôt. L'attribut data-no-exit l'exclut de la sortie du lieu par le décor.
 */
export function SceneCelestial({
  x,
  y,
  scale = 1,
  drop = 175,
  clip,
}: {
  x: number
  y: number
  /** Taille, par rapport à l'astre du village. */
  scale?: number
  /** Distance parcourue en se couchant, dans le repère du décor. */
  drop?: number
  /** Forme qui découpe l'astre : l'intérieur d'une fenêtre, par exemple. */
  clip?: string
}) {
  const { theme, toggle } = useColorTheme()
  const [phase, setPhase] = useState<'idle' | 'setting' | 'rising'>('idle')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const clipId = useId()

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Le thème n'est connu que dans le navigateur (stockage local, réglage du système) : l'astre
  // n'est dessiné qu'après le premier rendu, pour que celui du serveur ne le contredise pas.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function cycle() {
    if (phase !== 'idle') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      toggle()
      return
    }
    setPhase('setting')
    timers.current = [
      setTimeout(() => {
        toggle()
        setPhase('rising')
      }, HALF),
      setTimeout(() => setPhase('idle'), 2 * HALF),
    ]
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      cycle()
    }
  }

  if (!mounted) return null
  const label =
    theme === 'dark'
      ? 'Faire se lever le soleil (passer au jour)'
      : 'Faire se lever la lune (passer à la nuit)'
  return (
    <g clipPath={clip ? `url(#${clipId})` : undefined}>
      {clip && (
        <defs>
          <clipPath id={clipId}>
            <path d={clip} />
          </clipPath>
        </defs>
      )}
      {/* biome-ignore lint/a11y/useSemanticElements: un élément <button> ne peut pas figurer dans un SVG. */}
      <g
        className={`vmap-celestial scene-celestial is-${phase}`}
        role="button"
        tabIndex={0}
        aria-label={label}
        data-no-exit=""
        onClick={cycle}
        onKeyDown={onKeyDown}
        style={{ animationDuration: `${HALF}ms`, ['--drop' as string]: `${drop}px` }}
      >
        <title>{label}</title>
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
          {theme === 'dark' ? <Moon /> : <Sun />}
        </g>
      </g>
    </g>
  )
}
