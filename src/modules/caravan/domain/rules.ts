/**
 * Règles chiffrées de la Caravane (fiche de cadrage, règles 2, 3, 5, 6 et 9) et fonctions de
 * calcul sur les cargaisons. Ce fichier est écrit en TypeScript pur.
 */

/** Ressources transportables ; les mêmes que celles du Village. */
export const CARGO_RESOURCES = ['wood', 'stone', 'gold'] as const
export type CargoResource = (typeof CARGO_RESOURCES)[number]

/** Quantités d'une cargaison, par ressource. */
export type Cargo = Partial<Record<CargoResource, number>>

/** Règle 2 : capacité d'une caravane, en unités de ressources toutes confondues. */
export const CARAVAN_CAPACITY = 500

/** Règle 3 : nombre maximal de caravanes en route pour un même expéditeur. */
export const MAX_IN_TRANSIT = 3

/** Règle 5 : durée de base du trajet, et durée ajoutée par tranche de 10 unités. */
export const BASE_TRAVEL_MS = 60_000
export const TRAVEL_MS_PER_10_UNITS = 1_000

/** Règle 6 : niveaux d'escorte, du plus faible au plus fort. */
export const ESCORTS = ['none', 'guards', 'knights'] as const
export type Escort = (typeof ESCORTS)[number]

/** Règle 6 : prix de chaque escorte, en pièces d'or, jamais rendu. */
export const ESCORT_PRICE: Record<Escort, number> = { none: 0, guards: 20, knights: 50 }

/** Nombre total d'unités d'une cargaison. */
export const totalOf = (cargo: Cargo) =>
  CARGO_RESOURCES.reduce((sum, resource) => sum + (cargo[resource] ?? 0), 0)

/** Règle 5 : durée du trajet d'une cargaison. */
export const travelTimeOf = (cargo: Cargo) =>
  BASE_TRAVEL_MS + Math.floor(totalOf(cargo) / 10) * TRAVEL_MS_PER_10_UNITS

/** Retire les ressources nulles d'une cargaison. */
export function compact(cargo: Cargo): Cargo {
  const result: Cargo = {}
  for (const resource of CARGO_RESOURCES) {
    const amount = cargo[resource] ?? 0
    if (amount > 0) result[resource] = amount
  }
  return result
}

/** Règles 4 et 6 : ressources prélevées au départ, la cargaison et le prix de l'escorte. */
export function loadOf(cargo: Cargo, escort: Escort): Cargo {
  return compact({ ...cargo, gold: (cargo.gold ?? 0) + ESCORT_PRICE[escort] })
}

/**
 * Règle 9 : partage d'une cargaison attaquée. Les brigands emportent la moitié de chaque
 * ressource, arrondie à l'entier inférieur ; le reste est rendu à l'expéditeur.
 */
export function splitLoot(cargo: Cargo): { stolen: Cargo; returned: Cargo } {
  const stolen: Cargo = {}
  const returned: Cargo = {}
  for (const resource of CARGO_RESOURCES) {
    const amount = cargo[resource] ?? 0
    stolen[resource] = Math.floor(amount / 2)
    returned[resource] = amount - Math.floor(amount / 2)
  }
  return { stolen: compact(stolen), returned: compact(returned) }
}
