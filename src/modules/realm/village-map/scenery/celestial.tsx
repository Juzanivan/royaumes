import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useColorTheme } from '@/ui/color-theme'

/** Position de l'astre dans le ciel, dans le repère du dessin. */
const X = 610
const Y = 70
/** Durée du coucher, puis du lever de l'astre suivant, en millisecondes. */
const HALF = 900

/** Soleil, dont les rayons tournent lentement. */
function Sun() {
  return (
    <g>
      <circle cx={X} cy={Y} r={34} className="vmap-sun-glow" />
      <g className="vmap-sun-rays" style={{ transformOrigin: `${X}px ${Y}px` }}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <line
              key={a}
              x1={X + Math.cos(a) * 26}
              y1={Y + Math.sin(a) * 26}
              x2={X + Math.cos(a) * 34}
              y2={Y + Math.sin(a) * 34}
            />
          )
        })}
      </g>
      <circle cx={X} cy={Y} r={21} fill="#ffd54a" stroke="#f5b82e" strokeWidth={2} />
    </g>
  )
}

/** Lune en croissant, avec ses cratères, découpée par un masque. */
function Moon() {
  return (
    <g>
      <defs>
        <mask id="vmap-moon-mask">
          <rect x={X - 30} y={Y - 30} width={60} height={60} fill="white" />
          <circle cx={X + 10} cy={Y - 7} r={17} fill="black" />
        </mask>
      </defs>
      <circle cx={X} cy={Y} r={30} className="vmap-moon-glow" />
      <g mask="url(#vmap-moon-mask)">
        <circle cx={X} cy={Y} r={20} fill="#f4f0dc" />
        <circle cx={X - 9} cy={Y + 6} r={3.2} fill="#ddd6b8" />
        <circle cx={X - 3} cy={Y + 13} r={2} fill="#ddd6b8" />
      </g>
    </g>
  )
}

/**
 * Astre du ciel : le soleil le jour (thème clair), la lune la nuit (thème sombre). Un clic, ou
 * Entrée au clavier, le fait se coucher derrière les montagnes et le terrain ; le thème change alors, et
 * l'astre suivant se lève. Sans animation (réglage du système), le thème change aussitôt.
 */
export function Celestial() {
  const { theme, toggle } = useColorTheme()
  const [phase, setPhase] = useState<'idle' | 'setting' | 'rising'>('idle')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

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

  const label =
    theme === 'dark'
      ? 'Faire se lever le soleil (passer au jour)'
      : 'Faire se lever la lune (passer à la nuit)'
  return (
    // biome-ignore lint/a11y/useSemanticElements: un élément <button> ne peut pas figurer dans un SVG.
    <g
      className={`vmap-celestial is-${phase}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={cycle}
      onKeyDown={onKeyDown}
      style={{ animationDuration: `${HALF}ms` }}
    >
      {theme === 'dark' ? <Moon /> : <Sun />}
    </g>
  )
}
