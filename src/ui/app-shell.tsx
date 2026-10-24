'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { isBarePlace, PlaceBackdrop, placeFor } from './places'

/**
 * Cadre de l'espace de jeu. Le village est le point de départ : ses bâtiments mènent aux
 * autres lieux du jeu (src/ui/destinations.ts), et son château mène à la grande salle, dont les
 * portes ouvrent les archives (« Mes données »), la place du crieur public et la sortie.
 * Dans un lieu, le décor est peint en fond (src/ui/places/), et ses extrémités ramènent au
 * village : un clic sur le bord gauche ou droit de l'écran, ou la touche Échap. Un lien d'évitement, invisible
 * tant qu'il n'a pas le focus, offre la même sortie au clavier et aux lecteurs d'écran ; sur un
 * écran tactile, une croix en haut à droite la rend visible.
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
      {/* Sur un écran tactile, sans survol ni touche Échap, une croix rend la sortie visible. */}
      <Link href="/village" className="place-close" aria-label="Retourner au village">
        <span aria-hidden="true">✕</span>
      </Link>
      {place && <PlaceBackdrop kind={place} exit />}
      {place && !isBarePlace(place) ? <div className="place-sheet">{children}</div> : children}
    </>
  )
}
