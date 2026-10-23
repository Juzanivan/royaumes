'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Entity } from '@/ui/entity'
import { ExitArea } from '@/ui/places'
import {
  CAVE_NAME,
  type CaravanError,
  type CaravanView,
  EMPTY_CHANCE,
  ESCORT_PRICE,
  ESCORTS,
  type Escort,
  EXPEDITION_LEG_MS,
  EXPEDITION_MS,
  EXPEDITION_PROVISIONS,
  EXPLORATION_MS,
  LOOT_MULTIPLIER,
  totalOf,
} from './contracts'
import { type ExpeditionPhase, ExpeditionScene } from './journey/expedition-scene'
import { ProgressBar } from './journey/progress-bar'
import {
  CargoText,
  cargoText,
  client,
  duration,
  ERRORS,
  ESCORT,
  percent,
  STATUS,
} from './presentation'

// ---------------------------------------------------------------------------
// Le départ d'une expédition, depuis le relais
// ---------------------------------------------------------------------------

/**
 * Formulaire d'expédition vers la grotte : le joueur choisit son escorte, voit ce qu'il risque
 * de rapporter, et part. Une fois l'expédition partie, il est conduit sur sa vue de profil.
 */
export function ExpeditionPanel({ onSent }: { onSent: () => void }) {
  const router = useRouter()
  const [escort, setEscort] = useState<Escort>('guards')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function explore() {
    setError(null)
    setBusy(true)
    const res = await client.expeditions.$post({ json: { escort } })
    const body = (await res.json()) as
      | { caravanId: string; view: CaravanView }
      | { error: { code: CaravanError['code'] | 'INVALID_INPUT' } }
    setBusy(false)
    onSent()
    if ('error' in body) return setError(ERRORS[body.error.code] ?? 'Erreur.')
    if (body.view.status === 'cancelled') {
      return setError(`Expédition annulée : il vous manque ${cargoText(body.view.missing)}.`)
    }
    router.push(`/caravan/${body.caravanId}`)
  }

  return (
    <form
      className="panel caravan-form expedition-form"
      aria-label="Expédition vers la grotte"
      onSubmit={(e) => {
        e.preventDefault()
        explore()
      }}
    >
      <h2>
        <span aria-hidden="true">🕯️</span> Expédition vers {CAVE_NAME}
      </h2>
      <p className="muted">
        Une caravane part à vide explorer la grotte : {duration(EXPEDITION_LEG_MS)} d'aller,{' '}
        {duration(EXPLORATION_MS)} de fouille, {duration(EXPEDITION_LEG_MS)} de retour. Elle emporte{' '}
        <CargoText cargo={EXPEDITION_PROVISIONS} /> de provisions. Une escorte fouille mieux la
        grotte, et revient rarement bredouille.
      </p>
      <fieldset className="caravan-escorts">
        <legend>Escorte de l'expédition</legend>
        {ESCORTS.map((level) => (
          <label
            key={level}
            className={escort === level ? 'caravan-escort is-chosen' : 'caravan-escort'}
          >
            <input
              type="radio"
              name="expedition-escort"
              value={level}
              checked={escort === level}
              onChange={() => setEscort(level)}
            />
            <span className="caravan-escort-glyph" aria-hidden="true">
              {ESCORT[level].glyph}
            </span>
            <strong>{ESCORT[level].label}</strong>
            <span>
              {ESCORT_PRICE[level] === 0 ? (
                'Gratuit'
              ) : (
                <>
                  {ESCORT_PRICE[level]} <Entity kind="gold" />
                </>
              )}
            </span>
            <small className="muted">Butin ×{LOOT_MULTIPLIER[level]}</small>
            <small className="caravan-escort-risk">
              Bredouille : {percent(EMPTY_CHANCE[level])}
            </small>
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={busy}>
        Partir en expédition ({duration(EXPEDITION_MS)})
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

// ---------------------------------------------------------------------------
// La vue de profil d'une expédition
// ---------------------------------------------------------------------------

/** Heure de l'arrivée à la grotte, et de son départ, depuis le départ du village. */
const AT_CAVE = EXPEDITION_LEG_MS
const LEAVE_CAVE = EXPEDITION_LEG_MS + EXPLORATION_MS
/** Durée pendant laquelle la grotte glisse dans le champ, avant d'y arriver. */
const CAVE_APPROACH_MS = 2_200

/** Moment mis en scène, à partir de l'état de l'expédition et du temps écoulé depuis le départ. */
function phaseOf(view: CaravanView, elapsed: number): ExpeditionPhase {
  if (view.status === 'loading' || view.status === 'cancelled') return view.status
  if (view.status !== 'travelling') return 'returned'
  if (elapsed < AT_CAVE) return 'outbound'
  if (elapsed < LEAVE_CAVE) return 'exploring'
  return 'inbound'
}

/**
 * Vue de profil d'une expédition : la caravane roule vers la grotte, s'arrête à son entrée
 * pendant que l'escorte la fouille, puis rentre. Les horaires sont publics ; seul le butin
 * reste secret, jusqu'à ce que le serveur constate le retour.
 */
export function ExpeditionJourney({ view, serverNow }: { view: CaravanView; serverNow: number }) {
  const elapsed = serverNow - view.departedAt
  const phase = phaseOf(view, elapsed)
  // Le butin s'affiche dans le chariot à son retour ; une expédition rentrée bredouille le dit.
  const announced = useRef(false)
  const [justBack, setJustBack] = useState(false)
  useEffect(() => {
    if (phase !== 'returned' || announced.current) return
    announced.current = true
    if (serverNow - view.arrivesAt < 15_000) setJustBack(true)
  }, [phase, serverNow, view.arrivesAt])

  const progress = (() => {
    switch (phase) {
      case 'outbound':
        return elapsed / AT_CAVE
      case 'exploring':
        return 1
      case 'inbound':
        return Math.max(0, 1 - (elapsed - LEAVE_CAVE) / EXPEDITION_LEG_MS)
      default:
        return 0
    }
  })()
  const loot = view.loot ?? {}
  const empty = totalOf(loot) === 0
  const caption: Record<ExpeditionPhase, string> = {
    loading: "Préparation de l'expédition...",
    outbound: `En route vers ${CAVE_NAME} : arrivée dans ${duration(AT_CAVE - elapsed)}.`,
    exploring:
      view.escort === 'none'
        ? `Le cocher s'aventure seul dans la grotte, une lanterne à la main... (${duration(LEAVE_CAVE - elapsed)})`
        : `L'escorte fouille la grotte à la lueur des lanternes... (${duration(LEAVE_CAVE - elapsed)})`,
    inbound:
      elapsed >= EXPEDITION_MS
        ? 'La caravane franchit les portes du village...'
        : `Sur le chemin du retour : arrivée dans ${duration(EXPEDITION_MS - elapsed)}. Qu'a-t-elle trouvé ?`,
    returned: empty
      ? "L'expédition est revenue bredouille : la grotte n'a rien livré cette fois."
      : `${justBack ? 'De retour ! ' : ''}L'expédition rapporte ${cargoText(loot)}.`,
    cancelled: 'Expédition annulée : le village ne disposait pas des provisions.',
  }

  return (
    <div className="journey" data-phase={phase === 'returned' && empty ? 'cancelled' : phase}>
      <h1 className="sr-only">Expédition vers {CAVE_NAME}</h1>
      <ExitArea className="journey-exit">
        <ExpeditionScene
          phase={phase}
          escort={view.escort}
          loot={loot}
          caveShown={
            phase === 'exploring' || (phase === 'outbound' && elapsed > AT_CAVE - CAVE_APPROACH_MS)
          }
        />
      </ExitArea>
      <ProgressBar
        progress={progress}
        from="Votre village"
        to={CAVE_NAME}
        ambushAt={null}
        turned={phase === 'inbound' || phase === 'returned'}
        caption={caption[phase]}
      />
      <span className="sr-only">{STATUS[view.status]}</span>
    </div>
  )
}
