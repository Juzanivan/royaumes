import type { ReactNode } from 'react'
import { GlowGradient } from './parts/glow'
import { SkyGradient } from './parts/sky'
import { AccountScene } from './scenes/account/account-scene'
import { CaravanScene } from './scenes/caravan/caravan-scene'
import { DungeonScene } from './scenes/dungeon/dungeon-scene'
import { MarketScene } from './scenes/market/market-scene'
import { RankingScene } from './scenes/ranking/ranking-scene'
import { TavernScene } from './scenes/tavern/tavern-scene'

/** Les lieux du jeu qui ont un décor. */
export type PlaceKind = 'market' | 'tavern' | 'dungeon' | 'ranking' | 'account' | 'caravan'

const SCENES: Record<PlaceKind, () => ReactNode> = {
  market: MarketScene,
  tavern: TavernScene,
  dungeon: DungeonScene,
  ranking: RankingScene,
  account: AccountScene,
  caravan: CaravanScene,
}

/**
 * Pages qui peignent elles-mêmes leur scène, en plein écran, comme la carte du village : la
 * vue de profil d'une caravane sur la route.
 */
const FULL_SCENES = [/^\/caravan\/[^/]+/]

/** Indique si une page peint elle-même sa scène, sans décor ni parchemin. */
const isFullScene = (pathname: string) => FULL_SCENES.some((re) => re.test(pathname))

/** Lieu correspondant à une adresse du jeu, ou null pour une page sans décor (le village). */
export function placeFor(pathname: string): PlaceKind | null {
  if (isFullScene(pathname)) return null
  const segment = pathname.split('/')[1]
  return Object.hasOwn(SCENES, segment) ? (segment as PlaceKind) : null
}

/**
 * Décor d'un lieu, peint derrière la page : le joueur a l'impression d'être au marché, à la
 * taverne ou dans le donjon. Il est purement décoratif, masqué aux lecteurs d'écran, et suit
 * le jour et la nuit comme la carte du village. Les écrans des modules ne changent pas : leur
 * contenu est seulement posé sur un parchemin translucide (classe place-sheet).
 */
export function PlaceBackdrop({ kind }: { kind: PlaceKind }) {
  const Scene = SCENES[kind]
  return (
    <div className="place-backdrop" data-place={kind} aria-hidden="true">
      <svg
        aria-hidden="true"
        className="place-scene"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax slice"
      >
        <SkyGradient />
        <GlowGradient />
        <Scene />
      </svg>
    </div>
  )
}
