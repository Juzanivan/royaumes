/**
 * Lieux du jeu accessibles depuis la carte du village : chaque module qui a une page y
 * reçoit une entrée, et un bâtiment sur la carte. La carte remplace la barre de navigation.
 */
export const DESTINATIONS = [
  { href: '/dungeon', kind: 'dungeon', label: 'Donjon' },
  { href: '/ranking', kind: 'ranking', label: 'Classement' },
  { href: '/market', kind: 'market', label: 'Marché' },
  { href: '/tavern', kind: 'tavern', label: 'Taverne' },
] as const

export type Destination = (typeof DESTINATIONS)[number]
export type DestinationKind = Destination['kind']
