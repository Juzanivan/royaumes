import { ArchedWindow } from '../../parts/arched-window'
import { Glow } from '../../parts/glow'
import { Vignette } from '../../parts/vignette'
import { Banner } from './banner'
import { Carpet } from './carpet'
import { Column } from './column'
import { Podium } from './podium'

/** Ligne du sol de la salle. */
const FLOOR = 690

/** Décor du Classement : la salle des trophées, ses colonnes, ses bannières et son podium. */
export function RankingScene() {
  return (
    <>
      <rect width={1600} height={FLOOR} fill="#ddd2bf" />
      <rect y={FLOOR - 120} width={1600} height={120} fill="#cbbfa9" />
      <rect y={FLOOR} width={1600} height={900 - FLOOR} fill="#a99c86" />
      {[0.2, 0.5].map((t) => (
        <line
          key={t}
          x1={0}
          y1={FLOOR + (900 - FLOOR) * t}
          x2={1600}
          y2={FLOOR + (900 - FLOOR) * t}
          stroke="#968a74"
          strokeWidth={3}
        />
      ))}
      <ArchedWindow x={190} y={150} w={130} h={300} frame="#9f9481" />
      <ArchedWindow x={1280} y={150} w={130} h={300} frame="#9f9481" celestial />
      <ArchedWindow x={735} y={60} w={130} h={220} frame="#9f9481" />
      <Banner x={530} y={70} w={130} l={330} color="#2c3e8f" emblem="sword" />
      <Banner x={1070} y={70} w={130} l={330} color="#7b1f2e" emblem="tower" />
      <Banner x={800} y={300} w={110} l={150} color="#1e6b4a" emblem="crown" />
      <Column x={60} top={0} bottom={FLOOR} />
      <Column x={390} top={0} bottom={FLOOR} />
      <Column x={1210} top={0} bottom={FLOOR} />
      <Column x={1540} top={0} bottom={FLOOR} />
      <Carpet y={FLOOR} />
      <Glow x={800} y={560} r={300} />
      <Podium x={800} y={FLOOR + 20} />
      <Vignette color="#2b2118" strength={0.45} />
    </>
  )
}
