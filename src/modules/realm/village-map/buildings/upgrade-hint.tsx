/**
 * Flèche qui sautille à côté du blason d'un bâtiment, lorsque le stock permet de l'améliorer :
 * le joueur voit d'un coup d'œil où dépenser ses ressources. Les lecteurs d'écran en sont
 * informés par le libellé du bâtiment.
 */
export function UpgradeHint({ px, py }: { px: number; py: number }) {
  return (
    <g className="vmap-upgrade-hint">
      <circle cx={px} cy={py} r={8} />
      <path d={`M${px},${py - 4.5} l4,4.5 h-2.4 v4 h-3.2 v-4 h-2.4 Z`} />
    </g>
  )
}
