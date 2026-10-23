import type { KeyboardEvent } from 'react'
import { ArchedDoor } from '../details/arched-door'
import { iso, type Pt } from '../geometry/iso'
import { CASTLE } from '../layout'
import { Block } from '../shapes/block'
import { Flag } from '../shapes/flag'
import { OnFace } from '../shapes/on-face'
import { PyramidRoof } from '../shapes/pyramid-roof'

const STONE = { left: '#cfc7b8', right: '#a69d8e', top: '#e2dbce' }
const TOWER = { left: '#c3baaa', right: '#988f80', top: '#d9d2c4' }
const ROOF = { left: '#5b6f9a', right: '#435479' }

/** Tour d'angle du château, posée sur la case (x, y). */
function Tower({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Block x0={x} y0={y} x1={x + 0.6} y1={y + 0.6} h={36} shade={TOWER} />
      <PyramidRoof
        x0={x - 0.06}
        y0={y - 0.06}
        x1={x + 0.66}
        y1={y + 0.66}
        z={36}
        rise={16}
        shade={ROOF}
      />
    </g>
  )
}

/**
 * Château du seigneur, au centre du village : son enceinte, son donjon, ses quatre tours et le
 * nom du village. Il se sélectionne comme un bouton, et ouvre le menu du joueur.
 */
export function Castle({
  name,
  selected,
  onSelect,
}: {
  name: string
  selected: boolean
  onSelect: () => void
}) {
  const [x, y] = CASTLE
  const [gx, gy] = iso(x, y)
  // Tours d'angle : celle du fond, les deux des côtés, celle de l'avant. Elles sont dessinées
  // dans cet ordre, autour de l'enceinte et du donjon, pour que la plus proche masque le reste.
  const back: Pt = [x - 1.25, y - 1.25]
  const sides: Pt[] = [
    [x + 0.65, y - 1.25],
    [x - 1.25, y + 0.65],
  ]
  const front: Pt = [x + 0.65, y + 0.65]
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }
  return (
    // biome-ignore lint/a11y/useSemanticElements: un élément <button> ne peut pas figurer dans un SVG.
    <g
      className={selected ? 'vmap-building is-selected' : 'vmap-building'}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Château de ${name} : menu du seigneur`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <ellipse className="vmap-halo" cx={gx} cy={gy + 4} rx={78} ry={34} />
      <ellipse cx={gx} cy={gy + 6} rx={64} ry={24} fill="rgb(0 0 0 / 0.15)" />
      <Tower x={back[0]} y={back[1]} />
      <Block x0={x - 1} y0={y - 1} x1={x + 1} y1={y + 1} h={20} shade={STONE} />
      {sides.map(([tx, ty]) => (
        <Tower key={`${tx},${ty}`} x={tx} y={ty} />
      ))}
      <Block x0={x - 0.55} y0={y - 0.55} x1={x + 0.55} y1={y + 0.55} h={28} z0={20} shade={STONE} />
      <OnFace face="left" x={x} y={y + 0.55} z={34}>
        <ArchedDoor w={5} h={10} color="#3a3340" />
      </OnFace>
      <OnFace face="right" x={x + 0.55} y={y} z={34}>
        <ArchedDoor w={5} h={10} color="#3a3340" />
      </OnFace>
      <PyramidRoof
        x0={x - 0.62}
        y0={y - 0.62}
        x1={x + 0.62}
        y1={y + 0.62}
        z={48}
        rise={24}
        shade={ROOF}
      />
      <Flag x={x} y={y} z={72} h={18} color="#c2412d" />
      <Tower x={front[0]} y={front[1]} />
      <OnFace face="left" x={x + 0.15} y={y + 1}>
        <ArchedDoor w={14} h={17} color="#4a3626" frame="#8a7e70" />
      </OnFace>
      <g className="vmap-banner">
        <rect x={gx - 64} y={gy + 26} width={128} height={20} rx={4} />
        <text x={gx} y={gy + 40} textAnchor="middle">
          {name}
        </text>
      </g>
    </g>
  )
}
