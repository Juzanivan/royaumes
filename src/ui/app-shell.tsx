'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Entity } from './entity'
import { ThemeToggle } from './theme-toggle'

/**
 * Cadre de l'espace de jeu. Le village est le point de départ : ses bâtiments mènent aux
 * autres lieux du jeu (src/ui/destinations.ts), et son château ouvre le menu du joueur.
 * Sur les autres pages, une barre discrète permet seulement d'y revenir et de changer de thème.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/village')) return children
  return (
    <>
      <header className="topbar">
        <Link href="/village" className="back">
          <span aria-hidden="true">←</span> <Entity kind="village" /> Retour au village
        </Link>
        <ThemeToggle />
      </header>
      {children}
    </>
  )
}
