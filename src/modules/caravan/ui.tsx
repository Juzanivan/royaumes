'use client'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RESOURCES, type Resource } from '@/modules/realm/contracts'
import { useChannel } from '@/platform/realtime/use-channel'
import { Entity } from '@/ui/entity'
import { EdgeExits } from '@/ui/places'
import { look } from '@/ui/theme'
import {
  attackChance,
  CARAVAN_CAPACITY,
  type CaravanError,
  type CaravanList,
  type CaravanView,
  type Cargo,
  caravanStream,
  type Destination,
  ESCORT_PRICE,
  ESCORTS,
  type Escort,
  totalOf,
  travelTimeOf,
} from './contracts'
import { ExpeditionJourney, ExpeditionPanel } from './expedition'
import { type JourneyPhase, JourneyScene } from './journey/journey-scene'
import { ProgressBar } from './journey/progress-bar'

import {
  CargoText,
  cargoText,
  client,
  dangerOf,
  duration,
  ERRORS,
  ESCORT,
  percent,
  STATUS,
} from './presentation'

// ---------------------------------------------------------------------------
// Le relais des caravanes : envoi et liste
// ---------------------------------------------------------------------------

/** Écran du relais des caravanes : envoi d'une caravane, et caravanes envoyées et attendues. */
export function CaravanScreen() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [list, setList] = useState<CaravanList | null>(null)
  const [recipientId, setRecipientId] = useState('')
  const [cargo, setCargo] = useState<Record<Resource, number>>({ wood: 50, stone: 0, gold: 0 })
  const [escort, setEscort] = useState<Escort>('none')
  const [sent, setSent] = useState<CaravanView | null>(null)
  const [sentId, setSentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const res = await client.index.$get()
    if (res.ok) setList(await res.json())
  }, [])

  useEffect(() => {
    refresh()
    client.destinations.$get().then(async (res) => {
      if (!res.ok) return
      const body = await res.json()
      setDestinations(body.destinations)
      setRecipientId((current) => current || (body.destinations[0]?.playerId ?? ''))
    })
  }, [refresh])

  const load: Cargo = Object.fromEntries(
    Object.entries(cargo).filter(([, amount]) => amount > 0),
  ) as Cargo
  const total = totalOf(load)
  // Risque d'attaque de la caravane telle qu'elle est composée : il suit la cargaison et l'escorte.
  const risk = total > 0 ? attackChance(load, escort) : 0
  const danger = dangerOf(risk)

  async function send() {
    setError(null)
    setSent(null)
    const res = await client.index.$post({ json: { recipientId, cargo: load, escort } })
    const body = (await res.json()) as
      | { caravanId: string; view: CaravanView }
      | { error: { code: CaravanError['code'] | 'INVALID_INPUT' } }
    if ('error' in body) {
      setError(ERRORS[body.error.code] ?? 'Erreur.')
    } else if (body.view.status === 'cancelled') {
      setError(`Caravane annulée : il vous manque ${cargoText(body.view.missing)}.`)
    } else {
      setSent(body.view)
      setSentId(body.caravanId)
    }
    await refresh()
  }

  return (
    <>
      <h1>
        <Entity kind="caravan" /> Relais des caravanes
      </h1>
      <p className="muted">
        Envoyez une cargaison au village d'un autre joueur. Gare aux brigands : une caravane
        attaquée perd la moitié de sa cargaison, et rentre avec le reste.
      </p>

      <form
        className="panel caravan-form"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <label htmlFor="caravan-recipient">Destination</label>
        <select
          id="caravan-recipient"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          required
        >
          {destinations.length === 0 && <option value="">Aucun autre village</option>}
          {destinations.map((d) => (
            <option key={d.playerId} value={d.playerId}>
              {d.villageName}
            </option>
          ))}
        </select>

        <fieldset className="caravan-cargo">
          <legend>Cargaison</legend>
          {RESOURCES.map((resource) => (
            <label key={resource} className="caravan-amount">
              <Entity kind={resource} showLabel />
              <input
                type="number"
                min={0}
                max={CARAVAN_CAPACITY}
                value={cargo[resource]}
                onChange={(e) =>
                  setCargo({
                    ...cargo,
                    [resource]: Math.max(0, Math.floor(Number(e.target.value))),
                  })
                }
              />
            </label>
          ))}
          <div className="caravan-load" aria-live="polite">
            <div
              className={total > CARAVAN_CAPACITY ? 'caravan-meter is-over' : 'caravan-meter'}
              style={{ width: `${Math.min(100, (total / CARAVAN_CAPACITY) * 100)}%` }}
            />
            <span>
              {total} / {CARAVAN_CAPACITY} unités · trajet de {duration(travelTimeOf(load))}
            </span>
          </div>
        </fieldset>

        <fieldset className="caravan-escorts">
          <legend>Escorte</legend>
          {ESCORTS.map((level) => (
            <label
              key={level}
              className={escort === level ? 'caravan-escort is-chosen' : 'caravan-escort'}
            >
              <input
                type="radio"
                name="escort"
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
              <small className="muted">{ESCORT[level].hint}</small>
              {total > 0 && (
                <small className="caravan-escort-risk">
                  Risque : {percent(attackChance(load, level))}
                </small>
              )}
            </label>
          ))}
        </fieldset>

        <div className="caravan-risk" data-level={danger.level} aria-live="polite">
          <span className="caravan-risk-label">
            <span aria-hidden="true">{look('brigand').glyph}</span> Risque d'attaque :{' '}
            <strong>
              {percent(risk)} ({danger.label.toLowerCase()})
            </strong>
          </span>
          <div className="caravan-risk-track" aria-hidden="true">
            {/* Le dégradé couvre toute la jauge ; la part au-delà du risque est voilée. */}
            <div className="caravan-risk-rest" style={{ width: `${(1 - risk) * 100}%` }} />
          </div>
          <small className="muted">
            Plus la cargaison est précieuse, plus elle attire les brigands ; l'or les attire trois
            fois plus que le bois ou la pierre. Une attaque coûte la moitié de la cargaison.
          </small>
        </div>

        <button type="submit" disabled={!recipientId || total === 0 || total > CARAVAN_CAPACITY}>
          Envoyer la caravane
        </button>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>

      {sent && sentId && (
        <section className="panel caravan-sent" aria-live="polite">
          <p>
            <strong>La caravane est partie vers {sent.recipientName} !</strong> Arrivée prévue dans{' '}
            {duration(sent.arrivesAt - sent.departedAt)}.
          </p>
          <div className="row">
            <Link className="button" href={`/caravan/${sentId}`}>
              Suivre la caravane
            </Link>
            <Link className="button is-secondary" href="/village">
              Retour au village
            </Link>
          </div>
        </section>
      )}

      <ExpeditionPanel onSent={refresh} />

      <section className="panel" aria-label="Vos caravanes">
        <h2>Vos caravanes</h2>
        {list?.caravans.length === 0 && <p className="muted">Aucune caravane pour le moment.</p>}
        <ul className="caravans">
          {list?.caravans.map((c) => (
            <li key={c.caravanId} data-status={c.status}>
              <span>
                {c.mission === 'expedition' ? (
                  <>
                    Expédition vers {c.recipientName}
                    {c.status === 'returned' && (
                      <> : {totalOf(c.cargo) > 0 ? <CargoText cargo={c.cargo} /> : 'bredouille'}</>
                    )}
                  </>
                ) : (
                  <>
                    {c.role === 'sender' ? <>Vers {c.recipientName}</> : <>De {c.senderName}</>} :{' '}
                    <CargoText cargo={c.cargo} />
                  </>
                )}{' '}
                <span className="muted">({STATUS[c.status]})</span>
              </span>
              {c.status !== 'cancelled' && (
                <Link href={`/caravan/${c.caravanId}`}>
                  {c.status === 'travelling' || c.status === 'loading' ? 'Suivre' : 'Revoir'}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

// ---------------------------------------------------------------------------
// Les caravanes sur la carte du village
// ---------------------------------------------------------------------------

/** Chariot à dessiner sur la carte du village (même forme que MapTraveller, côté Village). */
export interface CaravanTraveller {
  id: string
  href: string
  label: string
  direction: 'out' | 'in'
  from: number
  to: number
}

/** Délai entre deux relectures des caravanes en route, depuis la carte. */
const TRAFFIC_REFRESH_MS = 15_000

/**
 * Caravanes en route du joueur, envoyées ou attendues, sous la forme de chariots à dessiner
 * sur la carte du village. Les heures du serveur sont converties dans l'horloge locale.
 */
export function useCaravanTraffic(): CaravanTraveller[] {
  const [list, setList] = useState<{ body: CaravanList; offset: number } | null>(null)

  const refresh = useCallback(async () => {
    const res = await client.index.$get()
    if (!res.ok) return
    const body = await res.json()
    setList({ body, offset: body.now - Date.now() })
  }, [])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, TRAFFIC_REFRESH_MS)
    return () => clearInterval(timer)
  }, [refresh])

  return useMemo(() => {
    if (!list) return []
    return list.body.caravans
      .filter((c) => c.status === 'travelling')
      .map((c) => ({
        id: c.caravanId,
        href: `/caravan/${c.caravanId}`,
        label:
          c.mission === 'expedition'
            ? `Suivre l'expédition vers ${c.recipientName}`
            : c.role === 'sender'
              ? `Suivre la caravane vers ${c.recipientName}`
              : `Suivre la caravane de ${c.senderName}`,
        direction: c.role === 'sender' ? ('out' as const) : ('in' as const),
        from: c.departedAt - list.offset,
        to: c.arrivesAt - list.offset,
      }))
  }, [list])
}

// ---------------------------------------------------------------------------
// La vue de profil d'une caravane
// ---------------------------------------------------------------------------

/** Délai entre deux lectures d'une caravane en route : chacune constate l'issue, si elle est échue. */
const POLL_MS = 2_500
/** Durées des étapes mises en scène d'une attaque, et du retour de la caravane. */
const AMBUSH_STEPS: [JourneyPhase, number][] = [
  ['ambush', 0],
  ['fight', 1_400],
  ['fleeing', 3_300],
  ['returning', 4_600],
  ['returned', 9_600],
]
const RETURN_MS = 5_000
/** Durée de l'arrivée mise en scène, avant la livraison. */
const ARRIVAL_MS = 2_400
/** Issue assez récente pour être jouée à l'ouverture de la vue, plutôt que résumée. */
const RECENT_MS = 15_000

/**
 * Vue de profil d'une caravane : elle roule sur la route, devant une forêt qui défile, avec
 * en bas la progression de son trajet. L'attaque des brigands ou l'arrivée au village sont
 * mises en scène au moment où le serveur les révèle.
 */
export function CaravanJourney({ caravanId }: { caravanId: string }) {
  // undefined : chargement ; null : caravane introuvable, ou réservée à d'autres joueurs.
  const [view, setView] = useState<CaravanView | null | undefined>(undefined)
  const [phase, setPhase] = useState<JourneyPhase>('loading')
  const [phaseAt, setPhaseAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const offset = useRef(0)
  const sawTravel = useRef(false)
  const played = useRef<string | null>(null)
  // Étapes programmées d'une mise en scène : elles ne sont annulées que si la vue disparaît,
  // et non à chaque relecture de la caravane.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const refresh = useCallback(async () => {
    const res = await client[':id'].$get({ param: { id: caravanId } })
    if (res.status === 404) return setView(null)
    if (!res.ok) return
    const body = (await res.json()) as { view: CaravanView; now: number }
    offset.current = body.now - Date.now()
    setView(body.view)
  }, [caravanId])

  useEffect(() => {
    refresh()
  }, [refresh])

  // TEMPS RÉEL : chaque événement de la caravane, constaté par l'autre joueur ou par le rappel
  // différé, provoque une relecture.
  useChannel(caravanStream(caravanId), refresh)

  // Tant que la caravane est en route, la vue est relue régulièrement : la lecture constate
  // l'attaque ou l'arrivée dès que leur heure est passée.
  const pending = view?.status === 'travelling' || view?.status === 'loading'
  useEffect(() => {
    if (!pending) return
    const poll = setInterval(refresh, POLL_MS)
    return () => clearInterval(poll)
  }, [pending, refresh])

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(tick)
  }, [])

  // Choix du moment mis en scène, à chaque nouvel état de la caravane.
  useEffect(() => {
    // Une expédition choisit son moment d'après l'heure (ExpeditionJourney).
    if (!view || view.mission === 'expedition') return
    const serverNow = Date.now() + offset.current
    const start = (next: JourneyPhase) => {
      setPhase(next)
      setPhaseAt(Date.now())
    }
    if (view.status === 'loading' || view.status === 'cancelled') return start(view.status)
    if (view.status === 'travelling') {
      sawTravel.current = true
      return start('travelling')
    }
    if (played.current === view.status) return
    played.current = view.status
    const endedAt = view.status === 'ambushed' ? (view.ambushedAt ?? 0) : view.arrivesAt
    const live = sawTravel.current || serverNow - endedAt < RECENT_MS
    if (view.status === 'delivered') {
      if (!live) return start('delivered')
      start('arriving')
      timers.current.push(setTimeout(() => start('delivered'), ARRIVAL_MS))
      return
    }
    if (!live) return start('returned')
    for (const [step, delay] of AMBUSH_STEPS) {
      timers.current.push(setTimeout(() => start(step), delay))
    }
  }, [view])

  if (view === undefined) return <h1 className="sr-only">Caravane</h1>
  if (view === null) {
    return (
      <div className="panel">
        <h1>Caravane introuvable</h1>
        <p className="muted">Cette caravane n'existe pas, ou ne vous concerne pas.</p>
      </div>
    )
  }

  const serverNow = now + offset.current
  if (view.mission === 'expedition') return <ExpeditionJourney view={view} serverNow={serverNow} />
  const span = Math.max(1, view.arrivesAt - view.departedAt)
  const ambushAt = view.ambushedAt === null ? null : (view.ambushedAt - view.departedAt) / span
  const progress = (() => {
    switch (phase) {
      case 'loading':
      case 'cancelled':
        return 0
      case 'travelling':
        return Math.min(0.99, (serverNow - view.departedAt) / span)
      case 'ambush':
      case 'fight':
      case 'fleeing':
        return ambushAt ?? 0
      case 'returning':
        return (ambushAt ?? 0) * Math.max(0, 1 - (now - phaseAt) / RETURN_MS)
      case 'returned':
        return 0
      case 'arriving':
      case 'delivered':
        return 1
    }
  })()

  const home = view.role === 'sender' ? 'Votre village' : `Village de ${view.senderName}`
  const destination = view.role === 'recipient' ? 'Votre village' : view.recipientName
  const defended = view.escort !== 'none'
  const caption: Record<JourneyPhase, string> = {
    loading: 'Chargement de la caravane...',
    travelling: `En route vers ${view.recipientName} avec ${cargoText(view.cargo)} : arrivée prévue dans ${duration(view.arrivesAt - serverNow)}.`,
    ambush: 'Des brigands surgissent des fourrés !',
    fight: defended
      ? "L'escorte tente de repousser les brigands..."
      : 'Le cocher se défend comme il peut...',
    fleeing: `Les brigands s'enfuient avec ${cargoText(view.stolen)}.`,
    returning: `La caravane fait demi-tour avec ${cargoText(view.returned)}.`,
    returned: `Attaquée par des brigands : ${cargoText(view.stolen)} perdus, ${cargoText(view.returned)} rendus à l'expéditeur.`,
    arriving: `La caravane arrive à ${view.recipientName} !`,
    delivered: `Livrée : ${cargoText(view.cargo)} remis à ${view.recipientName}.`,
    cancelled: 'Caravane annulée : le village ne disposait pas de la cargaison.',
  }

  return (
    <div className="journey" data-phase={phase}>
      <h1 className="sr-only">
        Caravane {view.role === 'sender' ? `vers ${view.recipientName}` : `de ${view.senderName}`}
      </h1>
      <div className="journey-stage">
        <JourneyScene
          phase={phase}
          cargo={view.cargo}
          escort={view.escort}
          destination={view.recipientName}
        />
      </div>
      {/* Le bord gauche, d'où vient la route, ramène au village. */}
      <EdgeExits edges={['left']} />
      <ProgressBar
        progress={progress}
        from={home}
        to={destination}
        ambushAt={phase === 'travelling' ? null : ambushAt}
        turned={['fleeing', 'returning', 'returned'].includes(phase)}
        caption={caption[phase]}
      />
      <span className="sr-only">{STATUS[view.status]}</span>
    </div>
  )
}
