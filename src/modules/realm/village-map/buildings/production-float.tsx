import type { Resource } from '../../contracts'

/** Production par minute qui s'élève régulièrement au-dessus d'un bâtiment, à la couleur de sa ressource. */
export function ProductionFloat({
  px,
  py,
  resource,
  perMinute,
  delay,
}: {
  px: number
  py: number
  resource: Resource
  perMinute: number
  delay: number
}) {
  return (
    <text
      className={`vmap-float vmap-float-${resource}`}
      x={px}
      y={py}
      style={{ animationDelay: `${delay}s` }}
    >
      +{perMinute}
    </text>
  )
}
