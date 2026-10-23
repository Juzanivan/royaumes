import { describe, expect, it } from 'vitest'
import { MAX_LEVEL } from '../contracts'
import { buildingSize, tierOf } from './tiers'

describe("Paliers d'apparence des bâtiments", () => {
  it('présente un chantier au niveau 0, puis un palier par tranche de trois niveaux', () => {
    expect([0, 1, 3, 4, 6, 7, 9].map(tierOf)).toEqual([0, 1, 1, 2, 2, 3, 3])
  })

  it('réserve le dernier palier au niveau maximal', () => {
    expect(tierOf(MAX_LEVEL - 1)).toBe(3)
    expect(tierOf(MAX_LEVEL)).toBe(4)
  })

  it('agrandit le bâtiment à chaque palier', () => {
    const sizes = [1, 2, 3, 4].map((tier) => buildingSize(tier, 0.5))
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i].half).toBeGreaterThan(sizes[i - 1].half)
      expect(sizes[i].wall).toBeGreaterThan(sizes[i - 1].wall)
    }
  })
})
