import type { DestinationKind } from '@/ui/destinations'
import type { Building } from '../contracts'
import type { Pt } from './geometry/iso'

/**
 * Plan du village : emplacement fixe du château, de chaque bâtiment et des éléments du
 * décor, en cases. Déplacer un élément ne demande de modifier que ce fichier.
 */

/** Centre du château. */
export const CASTLE: Pt = [6.3, 6.3]

/** Emplacement de chaque bâtiment : la scierie près de la forêt, la carrière près des rochers, la mine au pied de la montagne. */
export const SLOTS: Record<Building, Pt> = {
  sawmill: [2.6, 7.6],
  quarry: [8.5, 3.1],
  mine: [2.4, 4.4],
}

/**
 * Emplacement de chaque lieu du jeu : la tour du Donjon au pied des montagnes, derrière le
 * château ; la Taverne près de la porte sud, en retrait de la route des caravanes, qui part du
 * relais ; les étals du Marché et le podium du Classement
 * de part et d'autre de la route de l'est. Les emplacements sont choisis pour que, vus en
 * perspective, aucun lieu ne masque un bâtiment ni le château.
 */
export const LANDMARKS: Record<DestinationKind, Pt> = {
  dungeon: [3.4, 1.6],
  ranking: [9.9, 7.7],
  market: [9.5, 5.0],
  tavern: [4.75, 8.55],
  caravan: [2.75, 9.8],
}

/**
 * Route des chariots de la Caravane, en cases : du portail du relais, le long du chemin de la
 * Taverne, jusqu'à la porte sud du village.
 */
export const CARAVAN_ROUTE: Pt[] = [
  [3.45, 9.8],
  [6.3, 9.8],
  [6.3, 11],
]

/** Centre de la mare. */
export const POND: Pt = [9.4, 9.7]

/** Élément du décor : sa nature, sa position et son échelle. */
export interface DecorItem {
  kind: 'tree' | 'rock' | 'bush'
  x: number
  y: number
  scale?: number
}

export const DECOR: DecorItem[] = [
  // Forêt, à gauche, autour de la scierie.
  { kind: 'tree', x: 0.6, y: 7.2, scale: 1.1 },
  { kind: 'tree', x: 0.9, y: 8.6, scale: 0.9 },
  { kind: 'tree', x: 0.5, y: 9.9 },
  { kind: 'tree', x: 1.6, y: 10.3, scale: 0.8 },
  { kind: 'tree', x: 0.5, y: 6.3, scale: 0.85 },
  // Abords de la mine.
  { kind: 'rock', x: 0.5, y: 3.2, scale: 0.9 },
  { kind: 'rock', x: 1.1, y: 2.6, scale: 0.7 },
  { kind: 'tree', x: 5.4, y: 0.6, scale: 0.95 },
  // Rochers, à droite, autour de la carrière.
  { kind: 'rock', x: 9.3, y: 1.2, scale: 1.2 },
  { kind: 'rock', x: 10.2, y: 2.1, scale: 0.9 },
  { kind: 'rock', x: 7.1, y: 0.8, scale: 0.8 },
  // Buissons, devant le village.
  { kind: 'bush', x: 8.3, y: 10.4 },
  { kind: 'bush', x: 3.6, y: 5.7 },
]
