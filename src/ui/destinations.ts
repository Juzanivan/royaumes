/**
 * Lieux du jeu accessibles depuis la carte du village : chaque module qui a une page y
 * reçoit une entrée, et un bâtiment sur la carte. La carte remplace la barre de navigation.
 */
export const DESTINATIONS = [
  { href: '/dungeon', kind: 'dungeon', label: 'Donjon' },
  { href: '/ranking', kind: 'ranking', label: 'Classement' },
  { href: '/market', kind: 'market', label: 'Marché' },
  { href: '/tavern', kind: 'tavern', label: 'Taverne' },
  { href: '/caravan', kind: 'caravan', label: 'Relais des caravanes' },
  // Le crieur public n'est pas un module : il annonce les notes de version (src/ui/patch-notes.ts).
  { href: '/news', kind: 'news', label: 'Crieur public' },
] as const

export type Destination = (typeof DESTINATIONS)[number]
export type DestinationKind = Destination['kind']
