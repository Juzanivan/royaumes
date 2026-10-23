import type { Stock } from '../contracts'

/**
 * Indique si le stock couvre un coût ; faux si le coût est absent (niveau maximal).
 * Le panneau d'un bâtiment s'en sert pour activer son bouton, et la carte pour signaler
 * les bâtiments qui peuvent être améliorés.
 */
export const affordable = (stock: Stock, cost: Partial<Stock> | null) =>
  !!cost && Object.entries(cost).every(([r, n]) => stock[r as keyof Stock] >= (n ?? 0))
