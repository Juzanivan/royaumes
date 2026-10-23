'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Entity } from './entity'
import { PlaceBackdrop, placeFor } from './places'
import { ThemeToggle } from './theme-toggle'

/**
 * Cadre de l'espace de jeu. Le village est le point de départ : ses bâtiments mènent aux
 * autres lieux du jeu (src/ui/destinations.ts), et son château ouvre le menu du joueur.
 * Sur les autres pages, le décor du lieu est peint en fond (src/ui/places/), et une barre
 * discrète permet seulement de revenir au village et de changer de thème.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/village')) return children
  const place = placeFor(pathname)
  return (
    <>
      {place && <PlaceBackdrop kind={place} />}
      <header className="topbar">
        <Link href="/village" className="back">
          <span aria-hidden="true">←</span> <Entity kind="village" /> Retour au village
        </Link>
        <ThemeToggle />
      </header>
      {place ? <div className="place-sheet">{children}</div> : children}
    </>
  )
}
