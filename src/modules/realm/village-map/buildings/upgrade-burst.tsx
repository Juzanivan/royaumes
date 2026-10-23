import type { CSSProperties } from 'react'

/** Nombre d'étincelles de la gerbe, et sa portée horizontale et verticale, en pixels. */
const SPARKS = 10
const REACH_X = 46
const REACH_Y = 30

/** Gerbe d'étincelles lancée depuis la position (px, py) de l'écran, lorsqu'une amélioration arrive. */
export function UpgradeBurst({ px, py }: { px: number; py: number }) {
  return (
    <g className="vmap-burst">
      {Array.from({ length: SPARKS }, (_, i) => {
        const angle = (i / SPARKS) * Math.PI * 2
        const style = {
          '--dx': `${Math.cos(angle) * REACH_X}px`,
          '--dy': `${Math.sin(angle) * REACH_Y - 10}px`,
        } as CSSProperties
        return <circle key={angle} cx={px} cy={py} r={3} style={style} />
      })}
    </g>
  )
}
