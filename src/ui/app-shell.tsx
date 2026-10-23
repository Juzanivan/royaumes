'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { PlaceBackdrop, placeFor } from './places'

/**
 * Cadre de l'espace de jeu. Le village est le point de départ : ses bâtiments mènent aux
 * autres lieux du jeu (src/ui/destinations.ts), et son château ouvre le menu du joueur.
 * Dans un lieu, le décor est peint en fond (src/ui/places/), et c'est lui qui ramène au
 * village : un clic à côté du parchemin, ou la touche Échap. Un lien d'évitement, invisible
 * tant qu'il n'a pas le focus, offre la même sortie au clavier et aux lecteurs d'écran.
 * Le passage du jour à la nuit se fait comme au village, par le soleil ou la lune du décor.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/village')) return children
  const place = placeFor(pathname)
  return (
    <>
      <Link href="/village" className="place-exit-link">
        Quitter le lieu et retourner au village
      </Link>
      {place && <PlaceBackdrop kind={place} exit />}
      {place ? <div className="place-sheet">{children}</div> : children}
    </>
  )
}
