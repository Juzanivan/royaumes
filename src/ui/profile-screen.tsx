'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { authClient } from '@/platform/auth/client'

/** Résultat d'un formulaire du profil : un message de réussite, ou d'erreur. */
type Outcome = { ok: boolean; message: string } | null

/** Message d'un formulaire, annoncé aux lecteurs d'écran. */
function OutcomeText({ outcome }: { outcome: Outcome }) {
  if (!outcome) return null
  return (
    <p className={outcome.ok ? 'profile-ok' : 'error'} role="status">
      {outcome.message}
    </p>
  )
}

/**
 * Profil du joueur, au trône du château : son nom, son adresse électronique et son mot de passe.
 * Le nouveau nom remplace l'ancien dans tout le jeu (droit de rectification) : dans le journal,
 * le Classement, le Marché, le Donjon, la Taverne et les caravanes. L'adresse et le mot de passe
 * sont gérés par l'authentification.
 */
export function ProfileScreen({ name, email }: { name: string; email: string }) {
  const router = useRouter()
  const [newName, setNewName] = useState(name)
  const [newEmail, setNewEmail] = useState(email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState<'name' | 'email' | 'password' | null>(null)
  const [nameOutcome, setNameOutcome] = useState<Outcome>(null)
  const [emailOutcome, setEmailOutcome] = useState<Outcome>(null)
  const [passwordOutcome, setPasswordOutcome] = useState<Outcome>(null)

  async function rename(e: FormEvent) {
    e.preventDefault()
    setBusy('name')
    const res = await fetch('/api/account/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    setBusy(null)
    if (!res.ok) {
      return setNameOutcome({ ok: false, message: 'Ce nom n’est pas valable (2 à 30 caractères).' })
    }
    setNameOutcome({ ok: true, message: 'Votre nouveau nom est connu dans tout le royaume.' })
    router.refresh()
  }

  async function changeEmail(e: FormEvent) {
    e.preventDefault()
    setBusy('email')
    const { error } = await authClient.changeEmail({ newEmail })
    setBusy(null)
    // Une adresse déjà utilisée par un autre joueur n'est pas signalée comme telle : la réponse
    // ne doit pas révéler quelles adresses ont un compte. La session dit si l'adresse a changé.
    const session = await authClient.getSession()
    const changed = !error && session.data?.user.email === newEmail.toLowerCase()
    setEmailOutcome(
      changed
        ? { ok: true, message: 'Votre adresse électronique est mise à jour.' }
        : { ok: false, message: 'Cette adresse ne peut pas être retenue.' },
    )
    if (changed) router.refresh()
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    setBusy('password')
    // Les autres sessions du joueur sont fermées : un appareil oublié ne reste pas connecté.
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    setBusy(null)
    setCurrentPassword('')
    setNewPassword('')
    setPasswordOutcome(
      error
        ? {
            ok: false,
            message: 'Mot de passe actuel incorrect, ou nouveau mot de passe trop court.',
          }
        : { ok: true, message: 'Mot de passe changé ; vos autres appareils sont déconnectés.' },
    )
  }

  return (
    <>
      <h1>
        <span aria-hidden="true">👑</span> Le trône
      </h1>
      <p className="muted">
        Assis sur le trône, le seigneur règle les affaires de sa personne. Vos données sont
        consultables aux <Link href="/account">archives</Link>.
      </p>

      <form className="panel profile-form" onSubmit={rename} aria-label="Mon nom">
        <h2>Mon nom</h2>
        <p className="muted">
          Il remplace l'ancien partout : classement, marché, expéditions, taverne et caravanes.
        </p>
        <div className="row">
          <label htmlFor="profile-name">Nom</label>
          <input
            id="profile-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            minLength={2}
            maxLength={30}
            required
          />
          <button type="submit" disabled={busy !== null || newName.trim() === name}>
            Renommer
          </button>
        </div>
        <OutcomeText outcome={nameOutcome} />
      </form>

      <form
        className="panel profile-form"
        onSubmit={changeEmail}
        aria-label="Mon adresse électronique"
      >
        <h2>Mon adresse électronique</h2>
        <div className="row">
          <label htmlFor="profile-email">Adresse</label>
          <input
            id="profile-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={busy !== null || newEmail.toLowerCase() === email}>
            Changer
          </button>
        </div>
        <OutcomeText outcome={emailOutcome} />
      </form>

      <form className="panel profile-form" onSubmit={changePassword} aria-label="Mon mot de passe">
        <h2>Mon mot de passe</h2>
        <div className="profile-fields">
          <label htmlFor="profile-current">Mot de passe actuel</label>
          <input
            id="profile-current"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <label htmlFor="profile-new">Nouveau mot de passe (8 caractères au moins)</label>
          <input
            id="profile-new"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={busy !== null}>
          Changer le mot de passe
        </button>
        <OutcomeText outcome={passwordOutcome} />
      </form>
    </>
  )
}
