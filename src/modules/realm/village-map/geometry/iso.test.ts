import { describe, expect, it } from 'vitest'
import { iso, ORIGIN_X, ORIGIN_Y, SIZE, TILE_HEIGHT } from './iso'

describe('Projection isométrique', () => {
  it('place le coin (0, 0) au sommet du losange, et le coin opposé à sa base', () => {
    expect(iso(0, 0)).toEqual([ORIGIN_X, ORIGIN_Y])
    expect(iso(SIZE, SIZE)).toEqual([ORIGIN_X, ORIGIN_Y + SIZE * TILE_HEIGHT])
  })

  it('élève un point de z pixels vers le haut de l’écran, sans le déplacer latéralement', () => {
    const [x, y] = iso(3, 5)
    expect(iso(3, 5, 20)).toEqual([x, y - 20])
  })
})
