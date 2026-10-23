import { ArchedDoor } from '../details/arched-door'
import { Window } from '../details/window'
import { iso } from '../geometry/iso'
import { Block } from '../shapes/block'
import { GableRoof } from '../shapes/gable-roof'
import { OnFace } from '../shapes/on-face'
import { Smoke } from '../shapes/smoke'

const WALL = { left: '#f0e2c2', right: '#cdbd9b', top: '#f7ecd3' }
const ROOF = { gable: '#9a4a2c', slope: '#7a3820', ridge: '#c46a45' }
const CHIMNEY = { left: '#8f8a84', right: '#6f6a64', top: '#a9a49d' }

/**
 * Taverne : maison à colombages, fenêtres éclairées, cheminée qui fume. La porte et l'enseigne
 * à la chope donnent sur le mur droit, côté chemin.
 */
export function Tavern({ x, y }: { x: number; y: number }) {
  const x0 = x - 0.65
  const x1 = x + 0.55
  const y0 = y - 0.5
  const y1 = y + 0.5
  const wall = 30
  // Enseigne suspendue à une potence, au coin avant droit, au-dessus du chemin.
  const [ax, ay] = iso(x1, y1 - 0.12, 26)
  const [ex, ey] = iso(x1 + 0.42, y1 - 0.12, 26)
  return (
    <g>
      <Block x0={x0} y0={y0} x1={x1} y1={y1} h={wall} shade={WALL} />
      {/* Colombages. */}
      <g stroke="#6b4a2f" strokeWidth={2}>
        {[x0 + 0.3, x0 + 0.6, x0 + 0.9].map((bx) => {
          const [ax, ay] = iso(bx, y1, 0)
          const [tx, ty] = iso(bx, y1, wall)
          return <line key={bx} x1={ax} y1={ay} x2={tx} y2={ty} />
        })}
        {[y0 + 0.28, y1 - 0.28].map((by) => {
          const [bx0, by0] = iso(x1, by, 0)
          const [bx1, by1] = iso(x1, by, wall)
          return <line key={by} x1={bx0} y1={by0} x2={bx1} y2={by1} />
        })}
        {(() => {
          const [lx, ly] = iso(x0, y1, wall / 2)
          const [cx, cy] = iso(x1, y1, wall / 2)
          const [rx, ry] = iso(x1, y0, wall / 2)
          return <polyline points={`${lx},${ly} ${cx},${cy} ${rx},${ry}`} fill="none" />
        })()}
      </g>
      <Window x={x0 + 0.05} y={y1} w={0.2} z={18} h={8} />
      <Window x={x0 + 0.65} y={y1} w={0.2} z={18} h={8} />
      <OnFace face="right" x={x1} y={y - 0.3}>
        <ArchedDoor w={11} h={15} color="#6b4a2f" frame="#4a3626" />
      </OnFace>
      <Window x={x0 + 0.35} y={y1} w={0.2} z={4} h={8} />
      {/* La cheminée part du haut des murs : le toit, dessiné après, en masque la base. */}
      <Block
        x0={x + 0.15}
        y0={y0 + 0.1}
        x1={x + 0.35}
        y1={y0 + 0.3}
        h={34}
        z0={wall}
        shade={CHIMNEY}
      />
      <GableRoof x0={x0} y0={y0} x1={x1} y1={y1} z={wall} rise={22} shade={ROOF} />
      <Smoke x={x + 0.25} y={y0 + 0.2} z={wall + 34} />
      <line x1={ax} y1={ay} x2={ex} y2={ey} stroke="#4a3626" strokeWidth={2} />
      <line x1={ex - 2} y1={ey} x2={ex - 2} y2={ey + 4} stroke="#4a3626" strokeWidth={1} />
      <rect x={ex - 11} y={ey + 4} width={18} height={14} rx={2} fill="#e0b23a" stroke="#7a5532" />
      <text x={ex - 2} y={ey + 15} textAnchor="middle" fontSize={10}>
        🍺
      </text>
    </g>
  )
}
