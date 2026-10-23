/** Étincelle qui scintille à la position (px, py) de l'écran, de taille size. */
export function Sparkle({
  px,
  py,
  size = 5,
  delay = 0,
}: {
  px: number
  py: number
  size?: number
  delay?: number
}) {
  const s = size
  const d = `M${px},${py - s} l${s * 0.3},${s * 0.7} l${s * 0.7},${s * 0.3} l${-s * 0.7},${s * 0.3} l${-s * 0.3},${s * 0.7} l${-s * 0.3},${-s * 0.7} l${-s * 0.7},${-s * 0.3} l${s * 0.7},${-s * 0.3} z`
  return (
    <path className="vmap-sparkle" d={d} fill="#ffe28a" style={{ animationDelay: `${delay}s` }} />
  )
}
