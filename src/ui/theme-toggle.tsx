'use client'
import { useEffect, useState } from 'react'

/** Choix de thème : celui du système, le thème clair (jour) ou le thème sombre (nuit). */
type Theme = 'system' | 'light' | 'dark'

const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
const LABELS: Record<Theme, string> = {
  system: 'Thème : automatique',
  light: 'Thème : jour',
  dark: 'Thème : nuit',
}
const ICONS: Record<Theme, string> = { system: '🌓', light: '☀️', dark: '🌙' }

/**
 * Sélecteur de thème : chaque clic passe au choix suivant. Le choix est posé sur l'élément
 * <html> (attribut data-theme), que lisent les styles, et retenu dans le navigateur.
 * Le script public/theme-init.js l'applique dès le chargement des pages suivantes.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const current = document.documentElement.dataset.theme
    if (current === 'light' || current === 'dark') setTheme(current)
  }, [])

  function choose(next: Theme) {
    setTheme(next)
    const root = document.documentElement
    if (next === 'system') delete root.dataset.theme
    else root.dataset.theme = next
    try {
      if (next === 'system') localStorage.removeItem('theme')
      else localStorage.setItem('theme', next)
    } catch {}
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => choose(NEXT[theme])}
      title={LABELS[theme]}
      aria-label={`${LABELS[theme]}. Changer de thème`}
    >
      <span aria-hidden="true">{ICONS[theme]}</span>
    </button>
  )
}
