import { describe, expect, it } from 'vitest'
import { affordable } from './affordable'

const stock = { wood: 100, stone: 50, gold: 0 }

describe("Carte du village - possibilité d'améliorer un bâtiment", () => {
  it('est vraie lorsque le stock couvre chaque ressource du coût', () => {
    expect(affordable(stock, { wood: 100, stone: 50 })).toBe(true)
    expect(affordable(stock, { wood: 60 })).toBe(true)
  })

  it('est fausse lorsqu’une ressource manque, ou au niveau maximal', () => {
    expect(affordable(stock, { wood: 60, gold: 1 })).toBe(false)
    expect(affordable(stock, null)).toBe(false)
  })
})
