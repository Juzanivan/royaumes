'use client'
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { DESTINATIONS } from '@/ui/destinations'
import { BUILDINGS, type Building, type Stock, type VillageView } from '../contracts'
import { Castle } from './buildings/castle'
import { MapBuilding } from './buildings/map-building'
import { iso, ORIGIN_X } from './geometry/iso'
import { MapLandmark } from './landmarks/map-landmark'
import { CASTLE, DECOR, LANDMARKS, SLOTS } from './layout'
import { BuildingPanel } from './panels/building-panel'
import { FullscreenButton } from './panels/fullscreen-button'
import { PlayerPanel } from './panels/player-panel'
import { ResourceHud } from './panels/resource-hud'
import { Celestial } from './scenery/celestial'
import { Decor } from './scenery/decor'
import { Ground } from './scenery/ground'
import { MountainRidge } from './scenery/mountain-ridge'
import { Palisade } from './scenery/palisade'
import { Paths } from './scenery/paths'
import { Pond } from './scenery/pond'
import { Sky } from './scenery/sky'
import { type MapTraveller, Travellers } from './scenery/travellers'
import { Villagers } from './scenery/villagers'

/** Zone visible du dessin, dans le repère du SVG. */
const VIEW = { x: 36, y: 24, width: 728, height: 462 }
/** Durée de l'animation qui suit une amélioration, en millisecondes. */
const CELEBRATION_MS = 1600

/**
 * Vue en carte du village : une scène isométrique dessinée en SVG, dans laquelle chaque
 * bâtiment occupe un emplacement fixe et change d'apparence avec son niveau. La carte est
 * aussi la navigation du jeu : chaque lieu (Donjon, Classement, Marché, Taverne) y est un
 * bâtiment qui mène à sa page, et le château ouvre le menu du joueur.
 * Ce composant n'affiche que ce que contient la vue du village : il ne connaît aucune règle
 * du jeu, et délègue l'amélioration d'un bâtiment à l'écran qui l'affiche.
 */
export function VillageMap({
  view,
  stock,
  error,
  userName,
  onUpgrade,
  tools,
  travellers = [],
}: {
  view: VillageView
  stock: Stock
  error: string | null
  /** Nom du joueur, affiché dans le menu du château. */
  userName: string
  onUpgrade: (building: Building) => void
  /** Réglages de l'écran affichés en haut à droite de la carte (présentation, état du temps réel). */
  tools?: ReactNode
  /** Caravanes en route, dont les chariots roulent entre le relais et la porte du village. */
  travellers?: MapTraveller[]
}) {
  const container = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  // Distance entre le haut de la page et la carte, pour qu'elle occupe le reste de la hauteur.
  const [top, setTop] = useState(0)

  useLayoutEffect(() => {
    const measure = () =>
      setTop((container.current?.getBoundingClientRect().top ?? 0) + window.scrollY)
    measure()
    // En portrait, la scène est plus large que l'écran et défile horizontalement : elle est
    // d'abord centrée sur le château.
    const el = viewport.current
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Élément sélectionné : un bâtiment, dont le panneau s'ouvre, ou le château, qui ouvre le menu du joueur.
  const [selected, setSelected] = useState<Building | 'castle' | null>(null)
  // Bâtiments dont l'amélioration vient d'arriver : ils jouent une courte animation.
  const [upgrading, setUpgrading] = useState<Building[]>([])
  const previous = useRef(view.levels)

  useEffect(() => {
    const raised = BUILDINGS.filter((b) => view.levels[b] > previous.current[b])
    previous.current = view.levels
    if (raised.length === 0) return
    setUpgrading(raised)
    const timer = setTimeout(() => setUpgrading([]), CELEBRATION_MS)
    return () => clearTimeout(timer)
  }, [view.levels])

  const toggle = (b: Building | 'castle') => setSelected((current) => (current === b ? null : b))

  // Le château, les bâtiments et le décor sont dessinés du fond vers l'avant, selon leur
  // profondeur isométrique (x + y), afin que les plus proches masquent les plus éloignés.
  const items: { depth: number; node: ReactNode }[] = [
    ...DECOR.map((item) => ({
      depth: item.x + item.y,
      node: <Decor key={`${item.kind}-${item.x}-${item.y}`} item={item} />,
    })),
    {
      depth: CASTLE[0] + CASTLE[1],
      node: (
        <Castle
          key="castle"
          name={view.name}
          selected={selected === 'castle'}
          onSelect={() => toggle('castle')}
        />
      ),
    },
    ...DESTINATIONS.map((d) => ({
      depth: LANDMARKS[d.kind][0] + LANDMARKS[d.kind][1],
      node: <MapLandmark key={d.kind} destination={d} />,
    })),
    ...BUILDINGS.map((b) => ({
      depth: SLOTS[b][0] + SLOTS[b][1],
      node: (
        <MapBuilding
          key={b}
          building={b}
          level={view.levels[b]}
          selected={selected === b}
          upgrading={upgrading.includes(b)}
          onSelect={() => toggle(b)}
        />
      ),
    })),
  ].sort((a, b) => a.depth - b.depth)

  return (
    <div className="vmap" ref={container} style={{ '--vmap-top': `${top}px` } as CSSProperties}>
      <div className="vmap-top">
        <ResourceHud stock={stock} rates={view.ratesPerMinute} />
        <div className="vmap-tools">
          {tools}
          <FullscreenButton target={container} />
        </div>
      </div>
      <div className="vmap-viewport" ref={viewport}>
        <svg className="vmap-scene" viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}>
          <title>{`Carte du village ${view.name}`}</title>
          <defs>
            <pattern
              id="vmap-stripes"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(30)"
            >
              <rect width="4" height="8" fill="rgb(255 255 255 / 0.55)" />
            </pattern>
            <radialGradient id="vmap-grass" cx="0.5" cy="0.45" r="0.6">
              <stop offset="0" stopColor="#8cc063" />
              <stop offset="1" stopColor="#5f9a45" />
            </radialGradient>
          </defs>
          <Sky />
          {/* L'astre est dessiné avant le terrain et les montagnes : il se couche derrière eux. */}
          <Celestial />
          <Ground />
          {/* La chaîne de montagnes borde l'arrière du terrain, comme la palissade en borde l'avant. */}
          <MountainRidge />
          <Paths />
          <Pond />
          {items.map((item) => item.node)}
          <Travellers travellers={travellers} />
          <Villagers />
          {/* La palissade borde l'avant du terrain : elle passe devant tout ce qu'elle longe. */}
          <Palisade />
        </svg>
      </div>
      {selected === 'castle' && (
        <PlayerPanel
          villageName={view.name}
          userName={userName}
          onClose={() => setSelected(null)}
        />
      )}
      {selected && selected !== 'castle' && (
        <BuildingPanel
          side={iso(...SLOTS[selected])[0] > ORIGIN_X ? 'left' : 'right'}
          building={selected}
          view={view}
          stock={stock}
          error={error}
          onClose={() => setSelected(null)}
          onUpgrade={() => onUpgrade(selected)}
        />
      )}
    </div>
  )
}
