import { Barrel } from '../../parts/barrel'
import { Crate } from '../../parts/crate'
import { SceneCelestial } from '../../parts/scene-celestial'
import { Sky } from '../../parts/sky'
import { WallTorch } from '../../parts/wall-torch'
import { Cobbles } from '../market/cobbles'
import { Hay } from './hay'
import { ParkedWagon } from './parked-wagon'
import { Stable } from './stable'

/** Ligne du sol de la cour. */
const GROUND = 640

/**
 * Décor du relais des caravanes : la cour pavée d'une écurie, ses stalles voûtées où
 * attendent les chevaux, un chariot prêt au départ, du foin et des marchandises.
 */
export function CaravanScene() {
  return (
    <>
      <Sky h={GROUND - 380} />
      {/* L'astre se couche derrière l'auvent de l'écurie. */}
      <SceneCelestial x={1330} y={115} scale={1.5} drop={200} />
      <Stable y={GROUND} count={5} />
      <WallTorch x={320} y={300} />
      <WallTorch x={1280} y={300} />
      <Cobbles y={GROUND} />
      <Hay x={40} y={760} w={170} />
      <Hay x={90} y={680} w={130} />
      <ParkedWagon x={1150} y={850} />
      <Crate x={420} y={860} s={90} />
      <Crate x={445} y={770} s={64} />
      <Barrel x={590} y={880} w={80} />
    </>
  )
}
