/** Les entiers de 0 à n - 1 : rangs des éléments répétés d'un décor (barreaux, pavés, planches...). */
export function range(n: number): number[] {
  return Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => i)
}
