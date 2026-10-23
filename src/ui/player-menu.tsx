'use client'
import Link from 'next/link'
import { authClient } from '@/platform/auth/client'

/**
 * Menu du joueur : son nom, l'accès à ses données et la déconnexion. Il s'ouvre depuis le
 * château, sur la carte du village ; le thème s'y change par le soleil ou la lune du ciel.
 */
export function PlayerMenu({ userName }: { userName: string }) {
  async function signOut() {
    // La session est supprimée côté serveur, puis la page est entièrement rechargée,
    // afin qu'aucun état de la session précédente ne subsiste dans le navigateur.
    await authClient.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="player-menu">
      <p>
        Seigneur <strong>{userName}</strong>
      </p>
      <div className="row">
        <Link href="/account">Mes données</Link>
        <button className="link" type="button" onClick={signOut}>
          Déconnexion
        </button>
      </div>
    </div>
  )
}
