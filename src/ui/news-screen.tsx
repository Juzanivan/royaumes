'use client'
import { useEffect } from 'react'
import { markSeen, PATCH_NOTES } from './patch-notes'

/** Date au format du jeu : « 23 octobre 2026 ». */
const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

/**
 * Écran du crieur public : les notes de version, de la plus récente à la plus ancienne. Son
 * ouverture marque la dernière annonce comme lue, ce qui retire le parchemin scellé du crieur, sur la carte du village.
 */
export function NewsScreen() {
  useEffect(markSeen, [])

  return (
    <>
      <h1>Le crieur public</h1>
      <p className="muted">« Oyez, oyez, seigneurs du royaume ! Voici les nouvelles du jour. »</p>
      {PATCH_NOTES.map((note, i) => (
        <section
          key={note.version}
          className="panel news-note"
          aria-label={`Version ${note.version}`}
        >
          <h2>
            {note.title}
            {i === 0 ? <span className="news-new">Nouveau</span> : null}
          </h2>
          <p className="muted">
            Version {note.version}, publiée le {formatDate(note.date)}
          </p>
          <ul>
            {note.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
