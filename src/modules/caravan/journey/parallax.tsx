import type { ReactNode } from 'react'

/** Largeur d'un motif de décor, égale à celle de la scène. */
export const TILE = 1600

/**
 * Plan du décor qui défile derrière la caravane : son motif est dessiné deux fois, côte à
 * côte, et le plan glisse d'une largeur de motif à chaque cycle, sans raccord visible.
 * Plus un plan est proche, plus il défile vite : c'est l'effet de parallaxe.
 */
export function Parallax({ seconds, children }: { seconds: number; children: ReactNode }) {
  return (
    <g className="journey-layer" style={{ animationDuration: `${seconds}s` }}>
      <g>{children}</g>
      <g transform={`translate(${TILE} 0)`}>{children}</g>
    </g>
  )
}

/**
 * Suite de nombres pseudo-aléatoires fixée par son rang : le décor est le même à chaque
 * affichage, sans tirage au sort.
 */
export const jitter = (i: number, salt = 1) => {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return v - Math.floor(v)
}

/** Les entiers de 0 à n - 1 : rangs des éléments répétés d'un plan du décor. */
export const range = (n: number) => Array.from({ length: n }, (_, i) => i)
