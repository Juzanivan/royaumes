/**
 * La grotte des expéditions (fiche de cadrage, règles 13 à 17) : ce qu'une expédition en
 * rapporte, déduit de sa graine et de son escorte. Le tirage est déterministe : pour une même
 * expédition, le butin est toujours le même. Ce fichier est écrit en TypeScript pur.
 */
import { randomInt, seeded } from './random'
import { CARGO_RESOURCES, type Cargo, type CargoResource, compact, type Escort } from './rules'

/** Nom de la grotte : c'est la destination de toutes les expéditions. */
export const CAVE_NAME = 'la Grotte aux Échos'

/** Règle 15 : probabilité de revenir bredouille, selon l'escorte. */
export const EMPTY_CHANCE: Record<Escort, number> = { none: 0.4, guards: 0.2, knights: 0.05 }

/** Règle 15 : multiplicateur du butin, selon l'escorte qui fouille la grotte. */
export const LOOT_MULTIPLIER: Record<Escort, number> = { none: 1, guards: 1.5, knights: 2.5 }

/** Règle 15 : quantités de base trouvées dans la grotte, par ressource, bornes comprises. */
export const LOOT_RANGES: Record<CargoResource, [number, number]> = {
  wood: [20, 60],
  stone: [10, 40],
  gold: [0, 20],
}

/** Butin le plus grand qu'une expédition puisse rapporter, toutes ressources confondues. */
export const MAX_LOOT = CARGO_RESOURCES.reduce(
  (sum, resource) => sum + Math.floor(LOOT_RANGES[resource][1] * LOOT_MULTIPLIER.knights),
  0,
)

/**
 * Règle 15 : butin rapporté par une expédition. Le premier tirage décide si elle revient
 * bredouille ; les suivants, la quantité de chaque ressource, multipliée selon l'escorte.
 */
export function caveLoot({ seed, escort }: { seed: number; escort: Escort }): Cargo {
  const random = seeded(seed)
  if (random() < EMPTY_CHANCE[escort]) return {}
  const loot: Cargo = {}
  for (const resource of CARGO_RESOURCES) {
    const [min, max] = LOOT_RANGES[resource]
    loot[resource] = Math.floor(randomInt(random, min, max) * LOOT_MULTIPLIER[escort])
  }
  return compact(loot)
}
