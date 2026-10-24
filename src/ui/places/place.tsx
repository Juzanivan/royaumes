'use client'
import type { ReactNode } from 'react'
import { EdgeExits } from './edge-exits'
import { GlowGradient } from './parts/glow'
import { SkyGradient } from './parts/sky'
import { AccountScene } from './scenes/account/account-scene'
import { CaravanScene } from './scenes/caravan/caravan-scene'
import { CastleScene } from './scenes/castle/castle-scene'
import { DungeonScene } from './scenes/dungeon/dungeon-scene'
import { MarketScene } from './scenes/market/market-scene'
import { NewsScene } from './scenes/news/news-scene'
import { RankingScene } from './scenes/ranking/ranking-scene'
import { TavernScene } from './scenes/tavern/tavern-scene'
import { ThroneScene } from './scenes/throne/throne-scene'
import { TitleScene } from './scenes/title/title-scene'

/** Les lieux du jeu qui ont un décor. */
export type PlaceKind =
  | 'market'
  | 'tavern'
  | 'dungeon'
  | 'ranking'
  | 'account'
  | 'caravan'
  | 'news'
  | 'castle'
  | 'throne'

/** Décors disponibles : ceux des lieux, et celui de l'écran titre (connexion, fondation). */
export type SceneKind = PlaceKind | 'title'

const SCENES: Record<SceneKind, () => ReactNode> = {
  market: MarketScene,
  tavern: TavernScene,
  dungeon: DungeonScene,
  ranking: RankingScene,
  account: AccountScene,
  caravan: CaravanScene,
  news: NewsScene,
  castle: CastleScene,
  throne: ThroneScene,
  title: TitleScene,
}

/**
 * Pages qui peignent elles-mêmes leur scène, en plein écran, comme la carte du village : la
 * vue de profil d'une caravane sur la route.
 */
const FULL_SCENES = [/^\/caravan\/[^/]+/]

/** Indique si une page peint elle-même sa scène, sans décor ni parchemin. */
const isFullScene = (pathname: string) => FULL_SCENES.some((re) => re.test(pathname))

/** Description de chaque décor, lue par les lecteurs d'écran. */
const SCENE_TITLES: Record<SceneKind, string> = {
  market: 'Décor : la place du Marché',
  tavern: 'Décor : la salle de la Taverne',
  dungeon: "Décor : l'entrée du Donjon",
  ranking: 'Décor : la salle des trophées',
  account: 'Décor : les archives du château',
  caravan: 'Décor : la cour du relais des caravanes',
  news: 'Décor : le panneau du crieur public, sur la place',
  castle: 'Décor : la grande salle du château',
  throne: 'Décor : le trône du château',
  title: 'Décor : le château du royaume',
}

/**
 * Lieux dont l'écran est posé directement sur le décor, sans parchemin : la grande salle du
 * château, dont les portes sont les liens.
 */
const BARE_PLACES: PlaceKind[] = ['castle']

/** Indique si l'écran d'un lieu est posé directement sur son décor, sans parchemin. */
export const isBarePlace = (kind: PlaceKind) => BARE_PLACES.includes(kind)

/** Lieu correspondant à une adresse du jeu, ou null pour une page sans décor (le village). */
export function placeFor(pathname: string): PlaceKind | null {
  if (isFullScene(pathname)) return null
  const segment = pathname.split('/')[1]
  return Object.hasOwn(SCENES, segment) && segment !== 'title' ? (segment as PlaceKind) : null
}

/**
 * Décor d'un lieu, peint derrière la page : le joueur a l'impression d'être au marché, à la
 * taverne ou dans le donjon. Il suit le jour et la nuit comme la carte du village, et, comme
 * elle, porte le soleil ou la lune qu'un clic fait se coucher pour changer de thème. Les écrans
 * des modules ne changent pas : leur contenu est seulement posé sur un parchemin (classe
 * place-sheet), sauf dans les lieux qui s'en passent (isBarePlace).
 *
 * Avec exit, les extrémités du décor, à gauche et à droite, sont la sortie du lieu (EdgeExits).
 * Sans exit, il n'est qu'un fond, comme sur l'écran de connexion. Il n'est pas nommé par un
 * élément <title>, que le navigateur afficherait en infobulle au moindre arrêt de la souris.
 */
export function PlaceBackdrop({ kind, exit = false }: { kind: SceneKind; exit?: boolean }) {
  const Scene = SCENES[kind]
  return (
    <div className="place-backdrop">
      <div data-place={kind} className="place-backdrop-scene">
        {/* biome-ignore lint/a11y/useSemanticElements: un <fieldset> ne peut pas remplacer un <svg> ; le groupe est nommé par aria-label, sans <title> qui s'afficherait en infobulle. */}
        <svg
          className="place-scene"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMax slice"
          role="group"
          aria-label={SCENE_TITLES[kind]}
        >
          <SkyGradient />
          <GlowGradient />
          <Scene />
        </svg>
      </div>
      {exit && <EdgeExits />}
    </div>
  )
}
