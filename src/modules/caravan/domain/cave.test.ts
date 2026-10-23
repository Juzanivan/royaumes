import { describe, expect, it } from 'vitest'
import { caveLoot, EMPTY_CHANCE, LOOT_RANGES, MAX_LOOT } from './cave'
import { CARAVAN_CAPACITY, ESCORTS, type Escort, totalOf } from './rules'

const SEEDS = Array.from({ length: 2000 }, (_, i) => i + 1)

/** Butins rapportés de la grotte sur de nombreuses graines, pour une escorte. */
const loots = (escort: Escort) => SEEDS.map((seed) => caveLoot({ seed, escort }))
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length

describe('Caravane - la grotte des expéditions (règle 15)', () => {
  it('rapporte toujours le même butin pour une même expédition', () => {
    for (const seed of SEEDS.slice(0, 200)) {
      expect(caveLoot({ seed, escort: 'guards' })).toEqual(caveLoot({ seed, escort: 'guards' }))
    }
  })

  it('fait revenir bredouille une expédition sur la proportion annoncée par son escorte', () => {
    for (const escort of ESCORTS) {
      const empty = loots(escort).filter((loot) => totalOf(loot) === 0).length / SEEDS.length
      expect(Math.abs(empty - EMPTY_CHANCE[escort])).toBeLessThan(0.04)
    }
  })

  it("rapporte d'autant plus que l'escorte est forte", () => {
    const [none, guards, knights] = ESCORTS.map((escort) => mean(loots(escort).map(totalOf)))
    expect(guards).toBeGreaterThan(none)
    expect(knights).toBeGreaterThan(guards)
  })

  it('rapporte des quantités entières, dans les bornes, sans dépasser la capacité', () => {
    expect(MAX_LOOT).toBeLessThanOrEqual(CARAVAN_CAPACITY)
    for (const escort of ESCORTS) {
      for (const loot of loots(escort)) {
        for (const [resource, amount] of Object.entries(loot)) {
          expect(Number.isInteger(amount)).toBe(true)
          expect(amount).toBeGreaterThan(0)
          expect(amount).toBeLessThanOrEqual(
            LOOT_RANGES[resource as keyof typeof LOOT_RANGES][1] * 2.5,
          )
        }
        expect(totalOf(loot)).toBeLessThanOrEqual(MAX_LOOT)
      }
    }
  })
})
