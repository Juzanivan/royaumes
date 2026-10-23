'use client'
import type { ReactNode } from 'react'
import { ExitArea } from './exit-area'
import { GlowGradient } from './parts/glow'
import { SkyGradient } from './parts/sky'
import { AccountScene } from './scenes/account/account-scene'
import { CaravanScene } from './scenes/caravan/caravan-scene'
import { DungeonScene } from './scenes/dungeon/dungeon-scene'
import { MarketScene } from './scenes/market/market-scene'
import { RankingScene } from './scenes/ranking/ranking-scene'
import { TavernScene } from './scenes/tavern/tavern-scene'
import { TitleScene } from './scenes/title/title-scene'

/** Les lieux du jeu qui ont un décor. */
export type PlaceKind = 'market' | 'tavern' | 'dungeon' | 'ranking' | 'account' | 'caravan'

/** Décors disponibles : ceux des lieux, et celui de l'écran titre (connexion, fondation). */
export type SceneKind = PlaceKind | 'title'

const SCENES: Record<SceneKind, () => ReactNode> = {
  market: MarketScene,
  tavern: TavernScene,
  dungeon: DungeonScene,
  ranking: RankingScene,
  account: AccountScene,
  caravan: CaravanScene,
  title: TitleScene,
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
  return Object.hasOwn(SCENES, segment) && segment !== 'title' ? (segment as PlaceKind) : null
}

/**
 * Décor d'un lieu, peint derrière la page : le joueur a l'impression d'être au marché, à la
 * taverne ou dans le donjon. Il est purement décoratif pour les lecteurs d'écran, et suit le
 * jour et la nuit comme la carte du village. Les écrans des modules ne changent pas : leur
 * contenu est seulement posé sur un parchemin (classe place-sheet).
 *
 * Avec exit, le décor est aussi la sortie du lieu : un clic à côté du parchemin ramène au
 * village. Sans exit, il n'est qu'un fond, comme sur l'écran de connexion.
 */
export function PlaceBackdrop({ kind, exit = false }: { kind: SceneKind; exit?: boolean }) {
  const Scene = SCENES[kind]
  const scene = (
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
  )
  return exit ? (
    <ExitArea className="place-backdrop is-exit">
      <div data-place={kind} className="place-backdrop-scene">
        {scene}
      </div>
    </ExitArea>
  ) : (
    <div className="place-backdrop" aria-hidden="true">
      <div data-place={kind} className="place-backdrop-scene">
        {scene}
      </div>
    </div>
  )
}
