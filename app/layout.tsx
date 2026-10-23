import type { Metadata } from 'next'
import Script from 'next/script'
import type { ReactNode } from 'react'
import './globals.css'

// Métadonnées par défaut de toutes les pages : titre de l'onglet et description.
export const metadata: Metadata = {
  title: 'Royaumes',
  description: 'Jeu multijoueur - monolithe modulaire',
}

/**
 * Mise en page racine, partagée par toutes les pages de l'application.
 * Le type des propriétés est déclaré explicitement plutôt qu'au moyen du type
 * global LayoutProps généré par Next.js : ce dernier n'existe qu'après une
 * première construction, ce qui ferait échouer la vérification des types
 * sur un dépôt fraîchement cloné.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // L'attribut data-theme de <html> est posé par theme-init.js avant l'hydratation : React
    // ne doit pas signaler l'écart entre le rendu du serveur et la page.
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <main>{children}</main>
      </body>
    </html>
  )
}
