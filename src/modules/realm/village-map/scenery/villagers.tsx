import type { ReactNode } from 'react'
import { iso, SIZE } from '../geometry/iso'
import { CASTLE, LANDMARKS, POND, SLOTS } from '../layout'
import { type Burden, Villager } from './villager'

/**
 * Trajet d'un villageois, en cases, et la profondeur à laquelle il est dessiné.
 *
 * Un villageois se déplace, mais il est dessiné à une profondeur fixe, parmi les bâtiments :
 * ceux de profondeur inférieure sont dessinés avant lui, et il passe devant eux ; les autres
 * le masquent. Chaque trajet suit un chemin, et sa profondeur est choisie pour qu'il passe
 * devant les bâtiments qu'il longe, et derrière ceux qui se dressent devant lui. Sans cela, un
 * villageois qui marche derrière une maison semblerait marcher sur son toit.
 */
interface Walk {
  from: [number, number]
  to: [number, number]
  depth: number
  color: string
  duration: number
  delay?: number
  burden?: Burden
  hat?: string
}

const [cx, cy] = CASTLE
const { sawmill, mine, quarry } = SLOTS
const { tavern, caravan, dungeon } = LANDMARKS

/** Les trajets des villageois, chacun sur un chemin du village. */
const WALKS: Walk[] = [
  // Route de la porte sud, devant le château et la Taverne.
  { from: [cx, SIZE - 0.3], to: [cx, cy + 1.3], depth: 16.9, color: '#3d6fb5', duration: 9 },
  // Route de l'est, entre le Marché et le podium.
  {
    from: [SIZE - 0.3, cy],
    to: [cx + 1.3, cy],
    depth: 16.9,
    color: '#b5513a',
    duration: 11,
    delay: -4,
    burden: 'basket',
  },
  // Route des caravanes, devant la Taverne : un bûcheron qui rapporte du bois.
  {
    from: [caravan[0] + 0.8, caravan[1]],
    to: [cx - 0.3, caravan[1]],
    depth: 15.9,
    color: '#6b8f3a',
    duration: 10,
    delay: -2,
    burden: 'wood',
  },
  // Chemin de la Taverne, de sa porte à la route du sud.
  {
    from: [tavern[0] + 0.75, tavern[1]],
    to: [cx - 0.25, tavern[1]],
    depth: 14.6,
    color: '#8e44ad',
    duration: 6,
    delay: -1,
    hat: '#4a3626',
  },
  // Chemin du Donjon, derrière le château : un garde qui fait sa ronde.
  {
    from: [cx, dungeon[1] + 0.4],
    to: [cx, mine[1] - 0.2],
    depth: 10.5,
    color: '#7b1f2e',
    duration: 12,
    delay: -6,
    hat: '#9aa1a8',
  },
  // Chemin de la mine, derrière le château.
  {
    from: [mine[0] + 0.7, mine[1]],
    to: [cx - 0.7, mine[1]],
    depth: 10.1,
    color: '#a0703f',
    duration: 9,
    delay: -3,
  },
  // Chemin de la carrière, vers la route de l'est.
  {
    from: [quarry[0], quarry[1] + 0.7],
    to: [quarry[0], cy - 0.3],
    depth: 14.3,
    color: '#5f6f7a',
    duration: 8,
    delay: -5,
    burden: 'bucket',
  },
  // Abords de la scierie : un bûcheron qui va et vient le long de la forêt.
  {
    from: [sawmill[0] - 1.2, sawmill[1] + 1.0],
    to: [sawmill[0] - 0.4, sawmill[1] + 1.6],
    depth: 11.6,
    color: '#3f7a3c',
    duration: 7,
    delay: -2,
    burden: 'wood',
    hat: '#c0392b',
  },
  // Bord de la mare : quelqu'un vient y puiser de l'eau.
  {
    from: [POND[0] - 1.5, POND[1] - 0.9],
    to: [POND[0] - 0.9, POND[1] - 1.1],
    depth: 18.0,
    color: '#d48a3a',
    duration: 6,
    delay: -3,
    burden: 'bucket',
  },
]

/**
 * Les villageois de la carte, avec leur profondeur, pour être triés avec les bâtiments et le
 * décor : la carte les dessine à leur place, et non par-dessus tout le reste.
 */
export function villagerItems(): { depth: number; node: ReactNode }[] {
  return WALKS.map((walk) => ({
    depth: walk.depth,
    node: (
      <Villager
        key={`villager-${walk.from.join(',')}`}
        from={iso(...walk.from)}
        to={iso(...walk.to)}
        color={walk.color}
        duration={walk.duration}
        delay={walk.delay}
        burden={walk.burden}
        hat={walk.hat}
      />
    ),
  }))
}
