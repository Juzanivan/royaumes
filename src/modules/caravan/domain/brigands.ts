/**
 * Les brigands : des personnages pilotés par l'ordinateur, qui guettent les caravanes sur la
 * route. Leur comportement est une IA déterministe : à partir de la graine de la caravane, ils
 * décident s'ils l'attaquent, et à quel moment du trajet (fiche de cadrage, règle 7).
 *
 * La décision suit trois étapes, comme le raisonnement d'une bande de brigands :
 *  1. la taille de la bande qui se trouve sur la route, tirée au sort ;
 *  2. la bande ne s'en prend qu'à une caravane moins bien défendue qu'elle ;
 *  3. elle attaque d'autant plus volontiers que la cargaison est précieuse.
 * Ce fichier est écrit en TypeScript pur.
 */
import { randomInt, seeded } from './random'
import { CARAVAN_CAPACITY, type Cargo, type Escort } from './rules'

/** Valeur de chaque ressource aux yeux des brigands : l'or les attire trois fois plus. */
const APPEAL: Record<string, number> = { wood: 1, stone: 1, gold: 3 }

/** Force de chaque escorte, comparée à la taille de la bande. */
export const ESCORT_STRENGTH: Record<Escort, number> = { none: 0, guards: 3, knights: 6 }

/** Taille maximale d'une bande de brigands. */
export const MAX_BAND = 8

/** Fenêtre du trajet dans laquelle une attaque peut avoir lieu, en fraction du trajet. */
export const AMBUSH_WINDOW = { from: 0.3, to: 0.8 } as const

/** Ce que voient les brigands d'une caravane, et sa graine. */
export interface Target {
  cargo: Cargo
  escort: Escort
  seed: number
}

/** Décision des brigands : pas d'attaque, ou une attaque à une fraction donnée du trajet. */
export type BrigandsPlan = { attack: false } | { attack: true; at: number }

/** Valeur d'une cargaison aux yeux des brigands. */
export function appealOf(cargo: Cargo): number {
  return Object.entries(cargo).reduce(
    (sum, [resource, amount]) => sum + (APPEAL[resource] ?? 0) * (amount ?? 0),
    0,
  )
}

/**
 * Envie d'attaquer d'une bande, entre 0,2 et 0,9 : elle croît avec la valeur de la cargaison.
 * Une caravane pleine d'or est presque toujours attaquée, si elle est assez faiblement défendue.
 */
export function greedFor(cargo: Cargo): number {
  return Math.min(0.9, 0.2 + (0.7 * appealOf(cargo)) / CARAVAN_CAPACITY)
}

/** Décision des brigands pour une caravane. Elle ne dépend que de la caravane et de sa graine. */
export function brigandsPlan({ cargo, escort, seed }: Target): BrigandsPlan {
  const random = seeded(seed)
  const band = randomInt(random, 1, MAX_BAND)
  const roll = random()
  const moment = random()
  if (band <= ESCORT_STRENGTH[escort]) return { attack: false }
  if (roll >= greedFor(cargo)) return { attack: false }
  return {
    attack: true,
    at: AMBUSH_WINDOW.from + moment * (AMBUSH_WINDOW.to - AMBUSH_WINDOW.from),
  }
}
