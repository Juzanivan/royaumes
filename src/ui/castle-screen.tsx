'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { authClient } from '@/platform/auth/client'
import { ArchivesDoor, ChainedDoor, Throne } from './castle/doors'

/**
 * Grande salle du château, ouverte depuis la carte du village. Ses portes sont les liens du
 * joueur : les archives (« Mes données »), le trône, au bout du tapis rouge, où il gère son
 * profil (nom, adresse électronique, mot de passe), et la porte enchaînée, qui le déconnecte.
 * Le crieur public, lui, se tient sur la place du village. Comme tous les lieux, on la quitte par ses
 * extrémités, à gauche ou à droite (EdgeExits, placées par la mise en page).
 */
export function CastleScreen({ userName }: { userName: string }) {
  const [villageName, setVillageName] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    fetch('/api/realm/village')
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { view?: { name?: string } } | null) => setVillageName(body?.view?.name ?? null))
      .catch(() => setVillageName(null))
  }, [])

  async function signOut() {
    setLeaving(true)
    // La session est supprimée côté serveur, puis la page est entièrement rechargée,
    // afin qu'aucun état de la session précédente ne subsiste dans le navigateur.
    await authClient.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="castle">
      <header className="castle-title">
        <h1>{villageName ? `Château de ${villageName}` : 'Le château'}</h1>
        <p>
          Seigneur <strong>{userName}</strong>
        </p>
      </header>
      <nav className="castle-doors" aria-label="Portes du château">
        <Link href="/account" className="castle-door">
          <ArchivesDoor />
          <span className="castle-door-label">
            Mes données
            <small>Les archives</small>
          </span>
        </Link>
        <Link href="/throne" className="castle-door is-throne">
          <Throne />
          <span className="castle-door-label">
            Le trône
            <small>Mon profil</small>
          </span>
        </Link>
        <button
          type="button"
          className="castle-door is-locked"
          onClick={signOut}
          disabled={leaving}
        >
          <ChainedDoor />
          <span className="castle-door-label">
            Déconnexion
            <small>Quitter le royaume</small>
          </span>
        </button>
      </nav>
    </div>
  )
}
