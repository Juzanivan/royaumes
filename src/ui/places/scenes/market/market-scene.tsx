import { Barrel } from '../../parts/barrel'
import { Cloud } from '../../parts/cloud'
import { Crate } from '../../parts/crate'
import { SceneCelestial } from '../../parts/scene-celestial'
import { Sky } from '../../parts/sky'
import { Bunting } from './bunting'
import { Cobbles } from './cobbles'
import { Facade } from './facade'
import { LampPost } from './lamp-post'
import { Stall } from './stall'

/** Ligne du sol : les façades et les étals y sont posés. */
const GROUND = 640

/** Maisons qui bordent la place : position, largeur, hauteur, couleur du mur et du toit. */
const HOUSES: [number, number, number, string, string][] = [
  [-40, 230, 300, '#efe0c2', '#9c3d2e'],
  [210, 200, 340, '#e7d2ae', '#4f5d75'],
  [430, 240, 280, '#f3e6cc', '#7a4a2a'],
  [690, 220, 330, '#e9d6b4', '#9c3d2e'],
  [930, 230, 290, '#f1e2c4', '#4f5d75'],
  [1180, 210, 350, '#e5cfa8', '#7a4a2a'],
  [1410, 230, 300, '#efdfc0', '#9c3d2e'],
]

/** Décor du Marché : une place pavée, bordée de maisons, avec ses étals et ses fanions. */
export function MarketScene() {
  return (
    <>
      <Sky h={GROUND} />
      {/* Le soleil, ou la lune, se couche derrière les toits de la place. */}
      <SceneCelestial x={1230} y={120} scale={1.7} drop={260} />
      <Cloud x={260} y={110} s={1.1} d={120} />
      <Cloud x={980} y={70} s={0.8} d={150} />
      <Cloud x={1480} y={170} s={1} d={100} />
      {HOUSES.map(([x, w, h, wall, roof]) => (
        <Facade key={x} x={x} y={GROUND} w={w} h={h} wall={wall} roof={roof} />
      ))}
      <Cobbles y={GROUND} />
      <Bunting x1={-20} y1={250} x2={800} y2={230} />
      <Bunting x1={800} y1={230} x2={1620} y2={260} />
      <LampPost x={140} y={800} />
      <LampPost x={1470} y={800} />
      <Stall x={180} y={830} w={330} stripe="#c0392b" goods={['apples', 'wood']} />
      <Stall x={1080} y={830} w={330} stripe="#2e86c1" goods={['stone', 'fabric']} />
      <Barrel x={590} y={860} w={70} />
      <Barrel x={660} y={880} w={64} />
      <Crate x={940} y={870} s={80} />
      <Crate x={960} y={790} s={56} />
    </>
  )
}
