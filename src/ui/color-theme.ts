'use client'
import { useCallback, useEffect, useState } from 'react'

/**
 * Thème de couleurs du jeu : le jour (thème clair) ou la nuit (thème sombre).
 * Tant que le joueur n'a rien choisi, le thème suit celui de son système. Son choix est posé
 * sur l'élément <html> (attribut data-theme), que lisent les styles, et retenu dans le
 * navigateur ; le script public/theme-init.js l'applique dès le chargement des pages.
 */
export type ColorTheme = 'light' | 'dark'

/** Événement émis à chaque changement de thème, pour que tous les composants le suivent. */
const EVENT = 'royaumes:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Thème affiché : le choix du joueur s'il en a fait un, celui du système sinon. */
function currentTheme(): ColorTheme {
  const chosen = document.documentElement.dataset.theme
  if (chosen === 'light' || chosen === 'dark') return chosen
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/** Applique et retient le thème choisi par le joueur. */
export function setColorTheme(theme: ColorTheme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}

/** Thème affiché, tenu à jour lorsque le joueur ou le système en change. */
export function useColorTheme() {
  const [theme, setTheme] = useState<ColorTheme>('light')

  useEffect(() => {
    const update = () => setTheme(currentTheme())
    update()
    const media = window.matchMedia(DARK_QUERY)
    media.addEventListener('change', update)
    window.addEventListener(EVENT, update)
    return () => {
      media.removeEventListener('change', update)
      window.removeEventListener(EVENT, update)
    }
  }, [])

  const toggle = useCallback(() => setColorTheme(currentTheme() === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggle }
}
