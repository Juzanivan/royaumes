import { Cloud } from '../../parts/cloud'
import { SceneCelestial } from '../../parts/scene-celestial'
import { Sky } from '../../parts/sky'
import { Birds } from './birds'
import { TitleCastle } from './castle'
import { Mountains } from './mountains'

/** Sapin stylisé, posé par son pied au point (x, y), de hauteur h. */
function Pine({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <g>
      <rect x={x - 4} y={y - h * 0.2} width={8} height={h * 0.2} fill="#4a3220" />
      <path
        d={`M${x},${y - h} L${x + h * 0.28},${y - h * 0.2} L${x - h * 0.28},${y - h * 0.2} Z`}
        fill="#2f5a3a"
      />
    </g>
  )
}

/** Maisonnette du village, au pied de la colline, posée au point (x, y). */
function Cottage({ x, y, roof }: { x: number; y: number; roof: string }) {
  return (
    <g>
      <rect x={x - 26} y={y - 36} width={52} height={36} fill="#efe0c2" />
      <path d={`M${x - 32},${y - 34} L${x},${y - 62} L${x + 32},${y - 34} Z`} fill={roof} />
      <rect className="place-window" x={x - 16} y={y - 26} width={10} height={12} />
      <rect x={x + 6} y={y - 24} width={10} height={24} fill="#5a3b22" />
    </g>
  )
}

/**
 * Décor de l'écran titre : le château du royaume sur sa colline, devant une chaîne de
 * montagnes, avec son village au pied du coteau, une route qui serpente jusqu'au premier
 * plan, des forêts et un vol d'oiseaux. Il suit le jour et la nuit, comme le reste du jeu.
 */
export function TitleScene() {
  return (
    <>
      <Sky h={900} />
      {/* L'astre se couche derrière les montagnes. */}
      <SceneCelestial x={420} y={150} scale={1.8} drop={340} />
      <Cloud x={180} y={240} s={1.2} d={140} />
      <Cloud x={1150} y={90} s={0.9} d={170} />
      <Cloud x={1450} y={210} s={1.1} d={120} />
      <Birds y={200} />
      <Mountains
        y={620}
        color="#8b93a8"
        snow="#eef2f7"
        peaks={[
          [120, 300, 260],
          [430, 360, 280],
          [760, 260, 240],
          [1100, 380, 300],
          [1450, 300, 260],
        ]}
      />
      <Mountains
        y={650}
        color="#6f7a8f"
        peaks={[
          [0, 180, 220],
          [300, 200, 240],
          [620, 170, 220],
          [1300, 210, 260],
          [1600, 190, 230],
        ]}
      />
      {/* Collines et coteau du château. */}
      <path
        d="M0,700 C300,610 520,640 760,620 C1000,600 1220,640 1600,620 V900 H0 Z"
        fill="#6ea152"
      />
      <path d="M930,690 C1050,510 1390,510 1510,690 Z" fill="#7cb15c" />
      <TitleCastle x={1220} y={600} />
      <path
        d="M0,760 C320,700 560,720 800,700 C1060,680 1300,730 1600,700 V900 H0 Z"
        fill="#5f9a45"
      />
      {/* Route qui monte au château. */}
      <path
        d="M760,610 C700,680 900,720 820,780 C760,830 700,860 660,900 L860,900 C900,850 960,800 920,760 C880,720 830,690 860,610 Z"
        fill="#d8bb85"
      />
      <Cottage x={520} y={735} roof="#9c3d2e" />
      <Cottage x={600} y={748} roof="#7a4a2a" />
      <Cottage x={1000} y={738} roof="#4f5d75" />
      <Cottage x={1380} y={726} roof="#9c3d2e" />
      {[60, 130, 200, 280, 1440, 1500, 1560].map((x, i) => (
        <Pine key={x} x={x} y={790 + (i % 2) * 20} h={150 + (i % 3) * 30} />
      ))}
      {[20, 340, 1590].map((x) => (
        <Pine key={`n${x}`} x={x} y={900} h={260} />
      ))}
    </>
  )
}
