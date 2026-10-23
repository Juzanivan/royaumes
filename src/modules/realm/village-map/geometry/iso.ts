/**
 * Projection isométrique de la carte du village : un point du terrain, exprimé en cases
 * (x vers la droite et le bas, y vers la gauche et le bas, z vers le haut, en pixels),
 * est converti en position à l'écran, dans le repère du dessin SVG.
 */

/** Largeur et hauteur d'une case à l'écran. */
export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32
/** Position à l'écran du coin (0, 0) du terrain, le plus éloigné. */
export const ORIGIN_X = 400
export const ORIGIN_Y = 110
/** Nombre de cases de chaque côté du terrain. */
export const SIZE = 11

/** Point à l'écran : abscisse et ordonnée. */
export type Pt = [number, number]

/** Position à l'écran du point (x, y) du terrain, élevé de z pixels. */
export const iso = (x: number, y: number, z = 0): Pt => [
  ORIGIN_X + ((x - y) * TILE_WIDTH) / 2,
  ORIGIN_Y + ((x + y) * TILE_HEIGHT) / 2 - z,
]

/** Liste de points au format de l'attribut SVG « points ». */
export const pts = (list: Pt[]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ')
