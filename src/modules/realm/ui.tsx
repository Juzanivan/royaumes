'use client'
import { hc } from 'hono/client'
import { useCallback, useEffect, useState } from 'react'
import { useChannel } from '@/platform/realtime/use-channel'
import { Entity } from '@/ui/entity'
import { PlaceBackdrop } from '@/ui/places'
import type { RealmApi } from './api'
import {
  type Building,
  type DomainError,
  stockAt,
  type VillageView,
  villageChannel,
} from './contracts'
import { type MapTraveller, VillageMap } from './village-map'

export type { MapTraveller } from './village-map'

/** Client HTTP typé, déduit de la sous-application Hono du module. */
const client = hc<RealmApi>('/api/realm')

/** Erreurs que l'API peut renvoyer : erreurs métier et erreur de validation. */
type ApiError = { code: DomainError['code'] | 'INVALID_INPUT'; message?: string }

/** Message affiché au joueur pour chaque erreur. */
const ERRORS: Record<ApiError['code'], string> = {
  INVALID_INPUT: 'Saisie invalide.',
  ALREADY_FOUNDED: 'Village déjà fondé.',
  NOT_FOUNDED: "Aucun village pour l'instant.",
  MAX_LEVEL_REACHED: 'Niveau maximum atteint.',
  INSUFFICIENT_RESOURCES: 'Ressources insuffisantes.',
}

/** Libellé affiché pour chaque état de la connexion temps réel. */
const STATUS_LABELS = {
  connecting: 'Connexion...',
  open: 'Temps réel connecté',
  reconnecting: 'Reconnexion...',
} as const

/**
 * Écran du Village : fondation du village, puis carte du village, mise à jour en temps réel.
 * La carte est aussi le point de départ du jeu : ses bâtiments mènent aux autres lieux.
 */
export function VillageScreen({
  userId,
  travellers,
}: {
  userId: string
  /** Caravanes en route, fournies par la page : le Village ne dépend d'aucun autre module. */
  travellers?: MapTraveller[]
}) {
  // undefined : chargement en cours ; null : aucun village fondé.
  const [view, setView] = useState<VillageView | null | undefined>(undefined)
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)

  // REQUÊTE : lecture de la vue du village.
  const refresh = useCallback(async () => {
    const res = await client.village.$get()
    if (res.ok) setView((await res.json()).view)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // TEMPS RÉEL : chaque événement du village, y compris s'il provient d'un autre onglet
  // ou d'un autre appareil, provoque une relecture de la vue.
  const status = useChannel(villageChannel(userId), refresh)

  // Le stock est extrapolé localement deux fois par seconde, sans interroger le serveur.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [])

  // COMMANDES : chaque réponse contient la vue à jour, ou une erreur.
  async function found(name: string) {
    const res = await client.village.$post({ json: { name } })
    handle(await res.json())
  }
  async function upgrade(building: Building) {
    const res = await client.village.upgrade.$post({ json: { building } })
    handle(await res.json())
  }
  function handle(body: { view: VillageView } | { error: ApiError }) {
    if ('error' in body) {
      setError(ERRORS[body.error.code])
    } else {
      setError(null)
      setView(body.view)
    }
  }

  const statusLabel = (
    <span className="status" data-status={status}>
      {STATUS_LABELS[status]}
    </span>
  )

  // Chargement en cours.
  if (view === undefined) return <h1 className="sr-only">Royaumes</h1>

  // Aucun village : formulaire de fondation, sur le décor de l'écran titre.
  if (view === null) {
    return (
      <div className="title-screen">
        <PlaceBackdrop kind="title" />
        <header className="title-logo">
          <span className="title-crown" aria-hidden="true">
            👑
          </span>
          <h1>Royaumes</h1>
          <p>Une terre vous attend, seigneur. Donnez un nom à votre village.</p>
        </header>
        <div className="title-card">
          <h2>
            <Entity kind="village" /> Fonder votre village
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              found(String(new FormData(e.currentTarget).get('name')))
            }}
          >
            <label htmlFor="name">Nom du village</label>
            <input id="name" name="name" required minLength={2} maxLength={30} />
            <button type="submit">Fonder</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
        <footer className="title-footer">{statusLabel}</footer>
      </div>
    )
  }

  // Village fondé : la carte, avec le stock extrapolé à l'instant courant. Le titre n'est lu
  // que par les lecteurs d'écran : le nom du village figure sur la bannière du château.
  return (
    <>
      <h1 className="sr-only">{view.name}</h1>
      <VillageMap
        view={view}
        stock={stockAt(view, now)}
        error={error}
        onUpgrade={upgrade}
        tools={statusLabel}
        travellers={travellers}
      />
    </>
  )
}
