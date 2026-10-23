'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { authClient } from '@/platform/auth/client'
import { LATEST_VERSION, seenVersion } from './patch-notes'

/**
 * Menu du joueur : son nom, l'accès à ses données et la déconnexion. Il s'ouvre depuis le
 * château, sur la carte du village ; le thème s'y change par le soleil ou la lune du ciel.
 * Un sceau signale l'annonce du crieur public tant que le joueur ne l'a pas lue.
 */
export function PlayerMenu({ userName }: { userName: string }) {
  // Lu après le montage : le navigateur seul sait quelle annonce a été lue.
  const [unread, setUnread] = useState(false)
  useEffect(() => setUnread(seenVersion() !== LATEST_VERSION), [])

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
        <Link href="/news" className={unread ? 'has-news' : undefined}>
          Crieur public
          {unread ? (
            <span className="news-seal">
              <span className="sr-only">(nouvelle annonce)</span>
            </span>
          ) : null}
        </Link>
        <Link href="/account">Mes données</Link>
        <button className="link" type="button" onClick={signOut}>
          Déconnexion
        </button>
      </div>
    </div>
  )
}
