import { ArchedWindow } from '../../parts/arched-window'
import { range } from '../../parts/range'
import { Vignette } from '../../parts/vignette'
import { WallTorch } from '../../parts/wall-torch'

/** Ligne du sol de la grande salle : les portes de l'écran du château y sont posées. */
export const CASTLE_FLOOR = 660

/** Bannière suspendue au mur, au point (x, y), aux couleurs du royaume. */
function Banner({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <rect x={x - 70} y={y - 8} width={140} height={10} rx={4} fill="#5a3b22" />
      <path d={`M${x - 56},${y} h112 v220 l-56,-40 l-56,40 Z`} fill={color} />
      <path d={`M${x - 56},${y + 18} h112`} stroke="#e0b23a" strokeWidth={6} />
      <path
        d={`M${x},${y + 70} l22,22 l-22,22 l-22,-22 Z`}
        fill="#e0b23a"
        stroke="#8a6a14"
        strokeWidth={3}
      />
    </g>
  )
}

/**
 * Décor du château : la grande salle, ses murs de pierre, ses deux hautes fenêtres (l'une porte
 * le soleil ou la lune), ses bannières et ses torches. Les portes de la salle ne sont pas
 * dessinées ici : ce sont les liens de l'écran du château, posés sur la ligne du sol.
 */
export function CastleScene() {
  return (
    <>
      <rect width={1600} height={CASTLE_FLOOR} fill="#6f6676" />
      {/* Appareil de pierre : des rangées de blocs décalées d'une demi-longueur. */}
      <g stroke="#5c5463" strokeWidth={3}>
        {range(11).map((row) => (
          <g key={row}>
            <line x1={0} y1={row * 60} x2={1600} y2={row * 60} />
            {range(17).map((col) => {
              const x = col * 100 + (row % 2) * 50
              return <line key={x} x1={x} y1={row * 60} x2={x} y2={row * 60 + 60} />
            })}
          </g>
        ))}
      </g>
      <ArchedWindow x={140} y={110} w={150} h={300} frame="#4a4250" celestial />
      <ArchedWindow x={1310} y={110} w={150} h={300} frame="#4a4250" />
      <Banner x={470} y={70} color="#8f2d2d" />
      <Banner x={1130} y={70} color="#2d4f8f" />
      <WallTorch x={380} y={420} />
      <WallTorch x={1220} y={420} />
      {/* Dallage, et tapis rouge qui mène aux portes. */}
      <rect y={CASTLE_FLOOR} width={1600} height={900 - CASTLE_FLOOR} fill="#4d4552" />
      <g stroke="#3f3844" strokeWidth={3}>
        {range(5).map((i) => (
          <line key={i} x1={0} y1={CASTLE_FLOOR + i * 50} x2={1600} y2={CASTLE_FLOOR + i * 50} />
        ))}
      </g>
      <path
        d={`M640,${CASTLE_FLOOR} h320 l140,240 h-600 Z`}
        fill="#8f2d2d"
        stroke="#e0b23a"
        strokeWidth={6}
      />
      <Vignette color="#120a05" strength={0.5} />
    </>
  )
}
