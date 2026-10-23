import type { KeyboardEvent } from 'react'
import { look } from '@/ui/theme'
import { type Building, CATALOG } from '../../contracts'
import { NameSign } from '../details/name-sign'
import { iso } from '../geometry/iso'
import { SLOTS } from '../layout'
import { tierOf } from '../tiers'
import { BUILDING_ART } from './building-art'
import { ConstructionSite } from './construction-site'
import { LevelBadge } from './level-badge'
import { ProductionFloat } from './production-float'
import { UpgradeBurst } from './upgrade-burst'

/**
 * Bâtiment de la carte, à son emplacement : son dessin selon son niveau, son blason, sa
 * production qui s'élève et, après une amélioration, une gerbe d'étincelles. Il se
 * sélectionne au clic ou au clavier, comme un bouton.
 */
export function MapBuilding({
  building,
  level,
  selected,
  upgrading,
  onSelect,
}: {
  building: Building
  level: number
  selected: boolean
  upgrading: boolean
  onSelect: () => void
}) {
  const [x, y] = SLOTS[building]
  const tier = tierOf(level)
  const { draw, badgeHeight } = BUILDING_ART[building]
  const { produces, perMinute } = CATALOG[building]
  const [gx, gy] = iso(x, y)
  const [bx, by] = iso(x, y, badgeHeight(tier))
  const classes = ['vmap-building', selected && 'is-selected', upgrading && 'is-upgrading']
    .filter(Boolean)
    .join(' ')
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }
  return (
    // biome-ignore lint/a11y/useSemanticElements: un élément <button> ne peut pas figurer dans un SVG.
    <g
      className={classes}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${look(building).label}, niveau ${level}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <ellipse className="vmap-halo" cx={gx} cy={gy + 4} rx={58} ry={26} />
      {tier === 0 ? <ConstructionSite x={x} y={y} /> : draw({ x, y, tier })}
      {upgrading && <UpgradeBurst px={gx} py={gy - 24} />}
      {level > 0 && (
        <ProductionFloat
          px={gx + 16}
          py={by + 6}
          resource={produces}
          perMinute={perMinute * level}
          delay={(x * 0.7) % 3}
        />
      )}
      <LevelBadge px={bx} py={by} level={level} />
      <NameSign px={bx} py={by - 26} glyph={look(building).glyph} label={look(building).label} />
    </g>
  )
}
