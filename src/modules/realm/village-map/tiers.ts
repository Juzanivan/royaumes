import { MAX_LEVEL } from '../contracts'

/**
 * Palier d'apparence d'un bâtiment selon son niveau : 0 pour un chantier (niveau 0),
 * 1 à 3 pour les niveaux 1 à 9, par tranches de trois niveaux, 4 au niveau maximal.
 */
export function tierOf(level: number) {
  if (level <= 0) return 0
  if (level >= MAX_LEVEL) return 4
  return Math.min(3, Math.ceil(level / 3))
}

/**
 * Dimensions d'un bâtiment selon son palier : demi-largeur au sol en cases (à partir d'une
 * largeur de base propre au bâtiment), hauteur des murs et hauteur du toit, en pixels.
 */
export const buildingSize = (tier: number, base: number) => ({
  half: base + 0.14 * tier,
  wall: 14 + 10 * tier,
  rise: 14 + 5 * tier,
})
