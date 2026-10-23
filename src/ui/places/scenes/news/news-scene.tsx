import { Cloud } from '../../parts/cloud'
import { SceneCelestial } from '../../parts/scene-celestial'
import { Sky } from '../../parts/sky'
import { Cobbles } from '../market/cobbles'
import { Facade } from '../market/facade'
import { LampPost } from '../market/lamp-post'
import { Crier } from './crier'
import { NoticeBoard } from './notice-board'

/** Ligne du sol de la place. */
const GROUND = 640

/** Maisons qui bordent la place : position, largeur, hauteur, couleur du mur et du toit. */
const HOUSES: [number, number, number, string, string][] = [
  [-60, 260, 320, '#e7d2ae', '#4f5d75'],
  [200, 220, 270, '#f1e2c4', '#9c3d2e'],
  [1160, 230, 300, '#efe0c2', '#7a4a2a'],
  [1390, 260, 340, '#e9d6b4', '#4f5d75'],
]

/**
 * Décor du crieur public : un coin de place, avec le panneau où sont clouées les annonces et
 * le crieur qui agite sa cloche. Au fond, l'église du village, dont le clocher porte le soleil
 * ou la lune.
 */
export function NewsScene() {
  return (
    <>
      <Sky h={GROUND} />
      <SceneCelestial x={790} y={110} scale={1.5} drop={240} />
      <Cloud x={340} y={90} s={1} d={130} />
      <Cloud x={1300} y={130} s={0.9} d={110} />
      {/* Église au fond de la place, entre les maisons. */}
      <path
        d="M560,640 v-260 l140,-90 l140,90 v260 z"
        fill="#d9c7a2"
        stroke="#a8936a"
        strokeWidth={3}
      />
      <path
        d="M660,330 v-120 l40,-60 l40,60 v120 z"
        fill="#cdb98f"
        stroke="#a8936a"
        strokeWidth={3}
      />
      <path d="M672,210 l28,-90 l28,90 z" fill="#4f5d75" />
      <path d="M680,640 v-110 a20,20 0 0 1 40,0 v110 z" fill="#4a3426" />
      <circle className="place-window" cx={700} cy={420} r={26} stroke="#7a6a4a" strokeWidth={5} />
      {HOUSES.map(([x, w, h, wall, roof]) => (
        <Facade key={x} x={x} y={GROUND} w={w} h={h} wall={wall} roof={roof} />
      ))}
      <Cobbles y={GROUND} />
      <LampPost x={1110} y={800} />
      <NoticeBoard x={150} y={860} />
      <Crier x={1350} y={860} />
    </>
  )
}
