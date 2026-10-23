import { describe, expect, it } from 'vitest'
import { pulseOf } from './production-float'

describe('Carte du village - chiffres de production', () => {
  it('affiche « +1 » à chaque unité produite', () => {
    expect(pulseOf(10)).toEqual({ amount: 1, seconds: 6 })
    expect(pulseOf(6)).toEqual({ amount: 1, seconds: 10 })
  })

  it('regroupe les unités lorsque la production est trop rapide pour être lue une à une', () => {
    expect(pulseOf(60)).toEqual({ amount: 2, seconds: 2 })
    expect(pulseOf(40)).toEqual({ amount: 1, seconds: 1.5 })
  })
})
