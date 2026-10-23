import type { ReactNode } from 'react'
import { iso, TILE_HEIGHT, TILE_WIDTH } from '../geometry/iso'

/** Longueur à l'écran d'une case le long d'un mur, et direction horizontale d'un mur. */
const LENGTH = Math.hypot(TILE_WIDTH / 2, TILE_HEIGHT / 2)
const U = TILE_WIDTH / 2 / LENGTH
const V = TILE_HEIGHT / 2 / LENGTH

/**
 * Plaque un dessin sur l'un des deux murs visibles d'un bâtiment, afin qu'il suive la
 * perspective du mur au lieu de faire face à l'écran : une porte, une fenêtre, une torche.
 * - « left » : le mur avant gauche, parallèle à l'axe x (y constant) ;
 * - « right » : le mur avant droit, parallèle à l'axe y (x constant).
 * Le dessin enfant est exprimé dans le repère du mur : l'origine est le point (x, y, z) du mur,
 * l'axe horizontal suit le mur vers la droite de l'écran, l'axe vertical descend, en pixels.
 * Les verticales restent verticales : seules les horizontales s'inclinent avec le mur.
 */
export function OnFace({
  face,
  x,
  y,
  z = 0,
  children,
}: {
  face: 'left' | 'right'
  x: number
  y: number
  z?: number
  children: ReactNode
}) {
  const [ex, ey] = iso(x, y, z)
  const slope = face === 'left' ? V : -V
  return <g transform={`matrix(${U} ${slope} 0 1 ${ex} ${ey})`}>{children}</g>
}
