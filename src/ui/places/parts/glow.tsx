/**
 * Halo de lumière chaude autour de (x, y), de rayon r. Le dégradé est commun à toutes les
 * lueurs ; l'intensité suit le jour et la nuit (--glow), et la lueur palpite.
 */
export function Glow({
  x,
  y,
  r,
  flicker = false,
}: {
  x: number
  y: number
  r: number
  flicker?: boolean
}) {
  return (
    <circle
      className={flicker ? 'place-glow is-flickering' : 'place-glow'}
      cx={x}
      cy={y}
      r={r}
      fill="url(#place-glow)"
    />
  )
}

/** Dégradé radial partagé par les lueurs, placé une fois par le cadre des lieux (place.tsx). */
export function GlowGradient() {
  return (
    <defs>
      <radialGradient id="place-glow">
        <stop offset="0" stopColor="#ffcf73" stopOpacity="0.85" />
        <stop offset="0.45" stopColor="#ffb347" stopOpacity="0.3" />
        <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}
