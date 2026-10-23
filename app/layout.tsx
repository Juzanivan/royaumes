import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'
import type { ReactNode } from 'react'
import './globals.css'
import './game-ui.css'

/*
 * Polices du jeu, servies par l'application elle-même (licence SIL Open Font License, jointe
 * dans app/fonts/) : Cinzel, aux capitales gravées, pour les titres et les boutons ; Alegreya,
 * une écriture de livre ancien, pour le texte. Aucune requête n'est faite à un service tiers.
 */
const titleFont = localFont({
  src: [
    { path: './fonts/cinzel-latin-700-normal.woff2', weight: '700' },
    { path: './fonts/cinzel-latin-900-normal.woff2', weight: '900' },
  ],
  variable: '--font-title',
  display: 'swap',
})
const bodyFont = localFont({
  src: [
    { path: './fonts/alegreya-latin-400-normal.woff2', weight: '400' },
    { path: './fonts/alegreya-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/alegreya-latin-500-normal.woff2', weight: '500' },
    { path: './fonts/alegreya-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
})

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
    <html
      lang="fr"
      className={`${titleFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <main>{children}</main>
      </body>
    </html>
  )
}
