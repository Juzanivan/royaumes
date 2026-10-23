import { SIZE } from '../geometry/iso'
import { CASTLE } from '../layout'
import { Stake } from './stake'

/** Écart entre deux pieux, et largeur laissée libre pour chaque porte, en cases. */
const SPACING = 0.5
const GATE_HALF_WIDTH = 0.7
/** Retrait de la palissade par rapport au bord du terrain. */
const INSET = 0.15

/**
 * Palissade le long des deux bords avant du terrain, interrompue par deux portes dans
 * l'alignement du château : un pieu est planté tous les SPACING, sauf devant les portes.
 */
export function Palisade() {
  const positions: number[] = []
  for (let i = 0.4; i < SIZE; i += SPACING) {
    if (Math.abs(i - CASTLE[0]) > GATE_HALF_WIDTH) positions.push(i)
  }
  return (
    <g>
      {positions.map((i) => (
        <Stake key={`front-${i}`} x={i} y={SIZE - INSET} />
      ))}
      {positions.map((i) => (
        <Stake key={`side-${i}`} x={SIZE - INSET} y={i} />
      ))}
    </g>
  )
}
