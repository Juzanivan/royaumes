import { Cloud } from './cloud'

/** Position des étoiles, visibles seulement de nuit (thème sombre). */
const STARS: [number, number][] = [
  [90, 40],
  [180, 90],
  [610, 50],
  [700, 110],
  [520, 30],
  [60, 150],
  [740, 40],
]

/**
 * Éléments du ciel : étoiles et nuages. Le dégradé du ciel lui-même est le fond du conteneur
 * de la carte, afin de couvrir aussi les marges laissées par la scène selon les proportions
 * de l'écran ; ses couleurs suivent le thème clair (jour) ou sombre (nuit).
 */
export function Sky() {
  return (
    <g>
      <g className="vmap-stars">
        {STARS.map(([sx, sy]) => (
          <circle key={`${sx},${sy}`} cx={sx} cy={sy} r={1.4} />
        ))}
      </g>
      <Cloud y={70} delay={0} scale={1} />
      <Cloud y={120} delay={-30} scale={0.7} />
    </g>
  )
}
