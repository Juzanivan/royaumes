import { ArchedWindow } from '../../parts/arched-window'
import { Barrel } from '../../parts/barrel'
import { FloorBoards } from '../../parts/floor-boards'
import { HangingLantern } from '../../parts/hanging-lantern'
import { Vignette } from '../../parts/vignette'
import { BarCounter } from './bar-counter'
import { BottleShelf } from './bottle-shelf'
import { CeilingBeams } from './ceiling-beams'
import { Fireplace } from './fireplace'
import { PlankWall } from './plank-wall'
import { Table } from './table'

/** Ligne du plafond et ligne du sol de la salle. */
const CEILING = 90
const FLOOR = 640

/** Décor de la Taverne : une salle chaleureuse, son feu de cheminée, son comptoir et ses tables. */
export function TavernScene() {
  return (
    <>
      <PlankWall top={CEILING} bottom={FLOOR} />
      <ArchedWindow x={150} y={190} w={150} h={210} frame="#3e2716" />
      <ArchedWindow x={1310} y={190} w={150} h={210} frame="#3e2716" />
      <Fireplace x={800} y={FLOOR} />
      <BottleShelf x={1060} y={300} w={210} />
      <BottleShelf x={330} y={300} w={210} />
      <FloorBoards y={FLOOR} />
      <BarCounter x1={1020} x2={1640} y={600} />
      <Barrel x={120} y={720} w={90} />
      <Barrel x={230} y={740} w={80} />
      <CeilingBeams h={CEILING} />
      <HangingLantern x={420} l={110} />
      <HangingLantern x={1180} l={90} />
      <Table x={420} y={880} />
      <Vignette color="#1a0e06" strength={0.6} />
    </>
  )
}
