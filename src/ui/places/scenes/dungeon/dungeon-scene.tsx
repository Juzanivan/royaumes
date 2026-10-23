import { Vignette } from '../../parts/vignette'
import { WallTorch } from '../../parts/wall-torch'
import { Chain } from './chain'
import { Cobweb } from './cobweb'
import { Flagstones } from './flagstones'
import { Fog } from './fog'
import { Gate } from './gate'
import { StoneWall } from './stone-wall'

/** Ligne du sol de la salle. */
const FLOOR = 700

/** Décor du Donjon : une salle de pierre, la porte des profondeurs, des torches et de la brume. */
export function DungeonScene() {
  return (
    <>
      <StoneWall top={0} bottom={FLOOR} />
      <Flagstones y={FLOOR} />
      <Gate x={800} y={FLOOR} />
      <WallTorch x={470} y={360} />
      <WallTorch x={1130} y={360} />
      <WallTorch x={110} y={330} />
      <WallTorch x={1490} y={330} />
      <Chain x={300} y={120} l={260} />
      <Chain x={1300} y={150} l={200} />
      <Cobweb x={0} y={0} r={220} />
      <Cobweb x={1600} y={0} r={180} flip />
      <Fog y={820} />
      <Vignette color="#05030a" strength={0.75} />
    </>
  )
}
