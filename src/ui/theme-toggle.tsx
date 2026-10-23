'use client'
import { useColorTheme } from './color-theme'

/**
 * Bouton de thème des pages autres que le village : il passe du jour à la nuit et inversement.
 * Sur la carte du village, le soleil et la lune du ciel jouent ce rôle.
 */
export function ThemeToggle() {
  const { theme, toggle } = useColorTheme()
  const label = theme === 'dark' ? 'Passer au jour' : 'Passer à la nuit'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      title={label}
      aria-label={label}
    >
      <span aria-hidden="true">{theme === 'dark' ? '🌙' : '☀️'}</span>
    </button>
  )
}
