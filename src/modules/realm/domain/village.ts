/**
 * Domaine du Village, selon le modèle decider :
 *   decide(état, commande, maintenant) -> événements ou erreur métier
 *   evolve(état, événement)            -> nouvel état
 * Ce fichier est écrit en TypeScript pur : il n'importe que le catalogue du domaine.
 */
import {
  BUILDINGS,
  type Building,
  CATALOG,
  type Levels,
  RESOURCES,
  type Resource,
  STARTING_LEVELS,
  STARTING_STOCK,
  type Stock,
} from './catalog'

// ---------------------------------------------------------------------------
// État
// ---------------------------------------------------------------------------

export interface VillageState {
  /** Faux tant que le village n'a pas été fondé. */
  founded: boolean
  name: string
  /** Stock calculé à l'instant asOf (valeurs décimales conservées). */
  stock: Stock
  levels: Levels
  /** Instant, en millisecondes, auquel le stock a été calculé pour la dernière fois. */
  asOf: number
}

/** État d'un village qui n'a encore connu aucun événement. */
export const initialState: VillageState = {
  founded: false,
  name: '',
  stock: { wood: 0, stone: 0, gold: 0 },
  levels: { sawmill: 0, quarry: 0, mine: 0 },
  asOf: 0,
}

// ---------------------------------------------------------------------------
// Événements : des faits accomplis, nommés au participe passé
// ---------------------------------------------------------------------------

export type VillageEvent =
  | { type: 'VillageFounded'; data: { name: string; at: number } }
  | {
      type: 'BuildingUpgraded'
      data: { building: Building; toLevel: number; cost: Partial<Stock>; at: number }
    }

// ---------------------------------------------------------------------------
// Commandes : des intentions, nommées à l'impératif
// ---------------------------------------------------------------------------

export type VillageCommand =
  | { type: 'FoundVillage'; name: string }
  | { type: 'UpgradeBuilding'; building: Building }

// ---------------------------------------------------------------------------
// Résultat d'une décision : des événements, ou une erreur métier
// ---------------------------------------------------------------------------

export type DomainError =
  | { code: 'ALREADY_FOUNDED' }
  | { code: 'NOT_FOUNDED' }
  | { code: 'MAX_LEVEL_REACHED'; building: Building }
  | { code: 'INSUFFICIENT_RESOURCES'; missing: Partial<Stock> }

export type Decision = { ok: true; events: VillageEvent[] } | { ok: false; error: DomainError }

// ---------------------------------------------------------------------------
// Production
// ---------------------------------------------------------------------------

/** Production par minute de chaque ressource, pour des niveaux donnés. */
export function productionPerMinute(levels: Levels): Stock {
  const rates: Stock = { wood: 0, stone: 0, gold: 0 }
  for (const building of BUILDINGS) {
    const { produces, perMinute } = CATALOG[building]
    rates[produces] += perMinute * levels[building]
  }
  return rates
}

/**
 * Ajoute au stock la production accumulée entre state.asOf et l'instant at,
 * puis fait de at le nouvel instant de référence.
 * Un nouvel objet est renvoyé : l'état reçu n'est jamais modifié.
 */
export function accrue(state: VillageState, at: number): VillageState {
  if (!state.founded || at <= state.asOf) return state
  const minutes = (at - state.asOf) / 60_000
  const rates = productionPerMinute(state.levels)
  const stock = { ...state.stock }
  for (const resource of RESOURCES) stock[resource] += rates[resource] * minutes
  return { ...state, stock, asOf: at }
}

// ---------------------------------------------------------------------------
// evolve : applique un événement, sans aucune vérification
// ---------------------------------------------------------------------------

export function evolve(state: VillageState, event: VillageEvent): VillageState {
  switch (event.type) {
    case 'VillageFounded':
      // La fondation repart de l'état initial, complété par le contenu de départ.
      return {
        ...initialState,
        founded: true,
        name: event.data.name,
        stock: { ...STARTING_STOCK },
        levels: { ...STARTING_LEVELS },
        asOf: event.data.at,
      }

    case 'BuildingUpgraded': {
      // 1. Le stock est d'abord calculé à l'instant de l'amélioration,
      //    avec la production des anciens niveaux.
      const current = accrue(state, event.data.at)
      // 2. Le coût enregistré dans l'événement est déduit du stock.
      const stock = { ...current.stock }
      for (const [resource, amount] of Object.entries(event.data.cost)) {
        stock[resource as Resource] -= amount ?? 0
      }
      // 3. Le nouveau niveau s'applique à partir de cet instant.
      return {
        ...current,
        stock,
        levels: { ...current.levels, [event.data.building]: event.data.toLevel },
      }
    }
  }
}

/** Reconstruit l'état d'un village à partir de la suite de ses événements. */
export function replay(events: VillageEvent[]): VillageState {
  return events.reduce(evolve, initialState)
}
