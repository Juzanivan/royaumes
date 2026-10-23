/**
 * Générateur pseudo-aléatoire à graine (mulberry32) : la même graine produit toujours la même
 * suite de nombres. C'est ce qui rend l'issue d'une caravane déterministe : elle est entièrement
 * déduite de la graine tirée au départ.
 *
 * Le domaine du Donjon contient le même générateur. Il est recopié ici, plutôt qu'importé : un
 * domaine n'importe aucun autre module (règle de dépendance du TD2), et ces quelques lignes ne
 * justifient pas un paquet partagé.
 */

/** Générateur : chaque appel renvoie un nombre de l'intervalle [0, 1[. */
export type Random = () => number

/** Crée un générateur à partir d'une graine entière. */
export function seeded(seed: number): Random {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Entier tiré au sort entre min et max, bornes comprises. */
export const randomInt = (random: Random, min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1))
