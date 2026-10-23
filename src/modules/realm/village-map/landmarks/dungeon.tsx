import { ArchedDoor } from '../details/arched-door'
import { Merlon } from '../details/merlon'
import { Torch } from '../details/torch'
import { Block } from '../shapes/block'
import { OnFace } from '../shapes/on-face'

const STONE = { left: '#6f6a74', right: '#55505a', top: '#85808a' }
/** Hauteur de la tour, en pixels, et côté d'un merlon, en cases. */
const HEIGHT = 70
const MERLON = 0.18

/**
 * Donjon : tour de pierre sombre crénelée sur tout son pourtour, porte cintrée ouverte sur une
 * lueur inquiétante, encadrée de deux torches, et meurtrières. La porte, les torches et les
 * meurtrières sont plaquées sur les murs, et suivent leur perspective.
 */
export function Dungeon({ x, y }: { x: number; y: number }) {
  const x0 = x - 0.55
  const x1 = x + 0.55
  const y0 = y - 0.55
  const y1 = y + 0.55
  // Merlons sur les quatre bords du sommet, un sur deux, dessinés du fond vers l'avant.
  const steps = [0, 0.3, 0.6, 0.92]
  const merlons = [
    ...steps.map((t) => ({ mx: x0 + t, my: y0 })),
    ...steps.map((t) => ({ mx: x0, my: y0 + t })),
    ...steps.map((t) => ({ mx: x0 + t, my: y1 - MERLON })),
    ...steps.map((t) => ({ mx: x1 - MERLON, my: y0 + t })),
  ]
    .filter((m, i, all) => all.findIndex((o) => o.mx === m.mx && o.my === m.my) === i)
    .sort((a, b) => a.mx + a.my - (b.mx + b.my))
  return (
    <g>
      <Block x0={x0} y0={y0} x1={x1} y1={y1} h={HEIGHT} shade={STONE} />
      {merlons.map(({ mx, my }) => (
        <Merlon key={`${mx},${my}`} x={mx} y={my} z={HEIGHT} shade={STONE} />
      ))}
      <OnFace face="left" x={x - 0.05} y={y1}>
        <ArchedDoor w={18} h={24} color="#2a1830" frame="#3a3340" />
        <Torch px={-17} py={-20} />
        <Torch px={17} py={-20} />
      </OnFace>
      {[30, 50].map((z) => (
        <OnFace key={z} face="right" x={x1} y={y} z={z}>
          <rect x={-1.5} y={-8} width={3} height={9} fill="#2a211b" />
        </OnFace>
      ))}
    </g>
  )
}
