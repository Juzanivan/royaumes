import { describe, expect, it } from 'vitest'
import { AMBUSH_WINDOW, appealOf, attackChance, brigandsPlan, greedFor } from './brigands'
import type { Cargo, Escort } from './rules'

const SEEDS = Array.from({ length: 2000 }, (_, i) => i + 1)

/** Part des graines pour lesquelles les brigands attaquent une caravane donnée. */
const attackRate = (cargo: Cargo, escort: Escort) =>
  SEEDS.filter((seed) => brigandsPlan({ cargo, escort, seed }).attack).length / SEEDS.length

describe('Caravane - les brigands (IA déterministe, règle 7)', () => {
  it('prend toujours la même décision pour une même caravane', () => {
    for (const seed of SEEDS.slice(0, 200)) {
      const target = { cargo: { wood: 120, gold: 40 }, escort: 'guards' as const, seed }
      expect(brigandsPlan(target)).toEqual(brigandsPlan({ ...target }))
    }
  })

  it('attaque plus souvent une cargaison précieuse', () => {
    expect(appealOf({ wood: 100, gold: 100 })).toBe(400)
    expect(greedFor({ gold: 500 })).toBe(0.9)
    expect(attackRate({ gold: 300 }, 'none')).toBeGreaterThan(attackRate({ wood: 20 }, 'none'))
  })

  it("attaque moins souvent une caravane escortée, et d'autant moins que l'escorte est forte", () => {
    const cargo = { wood: 200, stone: 200 }
    const none = attackRate(cargo, 'none')
    const guards = attackRate(cargo, 'guards')
    const knights = attackRate(cargo, 'knights')
    expect(none).toBeGreaterThan(guards)
    expect(guards).toBeGreaterThan(knights)
    // Même escortée par des chevaliers, une caravane n'est jamais tout à fait à l'abri.
    expect(knights).toBeGreaterThan(0)
  })

  it('attaque toujours entre 30 % et 80 % du trajet', () => {
    for (const seed of SEEDS) {
      const plan = brigandsPlan({ cargo: { gold: 500 }, escort: 'none', seed })
      if (!plan.attack) continue
      expect(plan.at).toBeGreaterThanOrEqual(AMBUSH_WINDOW.from)
      expect(plan.at).toBeLessThanOrEqual(AMBUSH_WINDOW.to)
    }
  })

  it("annonce un risque d'attaque égal à la fréquence des attaques sur de nombreuses graines", () => {
    for (const [cargo, escort] of [
      [{ wood: 50 }, 'none'],
      [{ wood: 200, stone: 200 }, 'guards'],
      [{ gold: 300 }, 'knights'],
    ] as [Cargo, Escort][]) {
      expect(Math.abs(attackChance(cargo, escort) - attackRate(cargo, escort))).toBeLessThan(0.04)
    }
  })

  it('annonce un risque qui croît avec la cargaison et décroît avec l’escorte', () => {
    expect(attackChance({ wood: 400 }, 'none')).toBeGreaterThan(attackChance({ wood: 40 }, 'none'))
    expect(attackChance({ wood: 400 }, 'guards')).toBeLessThan(attackChance({ wood: 400 }, 'none'))
    expect(attackChance({ wood: 400 }, 'knights')).toBeLessThan(
      attackChance({ wood: 400 }, 'guards'),
    )
    expect(attackChance({ gold: 500 }, 'none')).toBe(0.9)
  })
})
