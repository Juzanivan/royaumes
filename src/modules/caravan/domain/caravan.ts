/**
 * Domaine de la Caravane : le voyage d'une cargaison d'un village à un autre, selon le modèle
 * decider. L'état d'une caravane résume l'avancement de sa saga avec le Village : chargement,
 * route, puis livraison ou attaque.
 *
 * Une caravane peut aussi partir en expédition vers la grotte (règles 13 à 17) : elle part à
 * vide, l'explore, et rapporte à son expéditeur le butin qu'elle y a trouvé. Elle suit la même
 * saga, dans le même flux ; son destinataire est son expéditeur.
 * Ce fichier est écrit en TypeScript pur : il n'importe aucun autre module.
 */
import { brigandsPlan } from './brigands'
import { CAVE_NAME, caveLoot } from './cave'
import {
  CARAVAN_CAPACITY,
  CARGO_RESOURCES,
  type Cargo,
  ESCORTS,
  type Escort,
  EXPEDITION_MS,
  MAX_IN_TRANSIT,
  splitLoot,
  totalOf,
  travelTimeOf,
} from './rules'

/**
 * États d'une caravane ; les trois derniers sont finaux.
 * - loading : la cargaison est demandée au village de l'expéditeur ;
 * - travelling : la caravane est en route ;
 * - cancelled : le village ne disposait pas des ressources, rien n'est parti ;
 * - delivered : la cargaison a été livrée au destinataire ;
 * - ambushed : les brigands ont attaqué, le reste est rendu à l'expéditeur ;
 * - returned : l'expédition est revenue de la grotte, avec ou sans butin.
 */
export type CaravanStatus =
  | 'loading'
  | 'travelling'
  | 'cancelled'
  | 'delivered'
  | 'ambushed'
  | 'returned'

/** Mission d'une caravane : livrer une cargaison à un autre joueur, ou explorer la grotte. */
export type Mission = 'delivery' | 'expedition'

// ---------------------------------------------------------------------------
// État
// ---------------------------------------------------------------------------

export interface CaravanState {
  /** Faux tant que la caravane n'a pas été envoyée. */
  exists: boolean
  mission: Mission
  caravanId: string
  senderId: string
  senderName: string
  recipientId: string
  /** Nom du village du destinataire : c'est vers lui que la caravane fait route. */
  recipientName: string
  cargo: Cargo
  escort: Escort
  /** Graine des brigands : secrète, elle détermine l'issue du voyage. */
  seed: number
  status: CaravanStatus
  sentAt: number
  /** Heure du départ et heure d'arrivée prévue, fixées au départ ; 0 avant le départ. */
  departedAt: number
  arrivesAt: number
  /** Après une attaque : son heure, la part des brigands et le reste rendu. */
  ambushedAt: number | null
  stolen: Cargo
  returned: Cargo
  /** Ressources qui manquaient à l'expéditeur, si la caravane a été annulée. */
  missing: Cargo
  /** Butin rapporté de la grotte, au retour d'une expédition. */
  loot: Cargo
}

export const initialState: CaravanState = {
  exists: false,
  mission: 'delivery',
  caravanId: '',
  senderId: '',
  senderName: '',
  recipientId: '',
  recipientName: '',
  cargo: {},
  escort: 'none',
  seed: 0,
  status: 'loading',
  sentAt: 0,
  departedAt: 0,
  arrivesAt: 0,
  ambushedAt: null,
  stolen: {},
  returned: {},
  missing: {},
  loot: {},
}

// ---------------------------------------------------------------------------
// Événements
// ---------------------------------------------------------------------------

export type CaravanEvent =
  | {
      type: 'CaravanSent'
      data: {
        caravanId: string
        senderId: string
        senderName: string
        recipientId: string
        recipientName: string
        cargo: Cargo
        escort: Escort
        seed: number
        at: number
      }
    }
  | { type: 'CaravanCancelled'; data: { missing: Cargo; at: number } }
  | { type: 'CaravanDeparted'; data: { at: number; arrivesAt: number } }
  | { type: 'CaravanAmbushed'; data: { at: number; stolen: Cargo; returned: Cargo } }
  | { type: 'CaravanDelivered'; data: { at: number } }
  | {
      type: 'ExpeditionSent'
      data: {
        caravanId: string
        senderId: string
        senderName: string
        escort: Escort
        seed: number
        at: number
      }
    }
  | { type: 'ExpeditionReturned'; data: { at: number; loot: Cargo } }

// ---------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------

/**
 * Joueur qui participe à un voyage : l'expéditeur, désigné par son nom, ou le destinataire,
 * désigné par le nom de son village.
 */
export interface Party {
  id: string
  name: string
}

export type CaravanCommand =
  // Commande du joueur.
  | {
      type: 'SendCaravan'
      caravanId: string
      sender: Party
      /** Destinataire choisi, ou null s'il n'a pas de village. */
      recipient: Party | null
      cargo: Cargo
      escort: Escort
      seed: number
      /** Nombre de caravanes de l'expéditeur déjà en route. */
      inTransit: number
    }
  // Commande du joueur : partir en expédition vers la grotte (règle 13).
  | {
      type: 'SendExpedition'
      caravanId: string
      sender: Party
      escort: Escort
      seed: number
      inTransit: number
    }
  // Commandes de la saga, issues des messages de la boîte d'envoi.
  | {
      type: 'RecordTransferResult'
      transferId: string
      outcome: 'withdrawn' | 'refused' | 'deposited'
      missing?: Cargo
    }
  /** Constater l'attaque ou l'arrivée, si son heure est passée. */
  | { type: 'Resolve' }
  /** Même chose, à la demande du rappel différé : une échéance non atteinte est une erreur. */
  | { type: 'ResolveDue' }

export type CaravanError =
  | { code: 'CARAVAN_NOT_FOUND' }
  | { code: 'ALREADY_EXISTS' }
  | { code: 'OWN_VILLAGE' }
  | { code: 'UNKNOWN_RECIPIENT' }
  | { code: 'EMPTY_CARGO' }
  | { code: 'OVER_CAPACITY'; capacity: number }
  | { code: 'TOO_MANY_CARAVANS'; max: number }
  | { code: 'INVALID_ESCORT' }
  | { code: 'NOT_DUE' }

export type Decision = { ok: true; events: CaravanEvent[] } | { ok: false; error: CaravanError }

const fail = (error: CaravanError): Decision => ({ ok: false, error })
const accept = (...events: CaravanEvent[]): Decision => ({ ok: true, events })

// ---------------------------------------------------------------------------
// Identifiants des mouvements de ressources
// ---------------------------------------------------------------------------

/**
 * Identifiant d'un mouvement de ressources, déterminé par la caravane et l'étape de la saga :
 * le Village s'en sert comme clé d'idempotence.
 */
export const transferIdOf = (caravanId: string, step: 'load' | 'deliver' | 'return' | 'loot') =>
  `${caravanId}:${step}`

/** Identifiant de la caravane à laquelle se rapporte un mouvement. */
export const caravanIdOf = (transferId: string) => transferId.slice(0, transferId.indexOf(':'))

// ---------------------------------------------------------------------------
// Échéances
// ---------------------------------------------------------------------------

/**
 * Issue prévue d'une caravane en route : l'heure de l'attaque, ou celle de l'arrivée.
 * Elle est déduite de la graine ; elle ne doit être présentée à aucun joueur avant son heure.
 * Les brigands n'attaquent pas une expédition, qui part à vide : son issue est son retour.
 */
export function outcomeOf(
  state: CaravanState,
): { kind: 'ambush'; at: number } | { kind: 'arrival'; at: number } {
  if (state.mission === 'expedition') return { kind: 'arrival', at: state.arrivesAt }
  const plan = brigandsPlan(state)
  if (!plan.attack) return { kind: 'arrival', at: state.arrivesAt }
  const duration = state.arrivesAt - state.departedAt
  return { kind: 'ambush', at: state.departedAt + Math.round(duration * plan.at) }
}

// ---------------------------------------------------------------------------
// evolve
// ---------------------------------------------------------------------------

export function evolve(state: CaravanState, event: CaravanEvent): CaravanState {
  switch (event.type) {
    case 'CaravanSent':
      return {
        ...initialState,
        exists: true,
        caravanId: event.data.caravanId,
        senderId: event.data.senderId,
        senderName: event.data.senderName,
        recipientId: event.data.recipientId,
        recipientName: event.data.recipientName,
        cargo: event.data.cargo,
        escort: event.data.escort,
        seed: event.data.seed,
        sentAt: event.data.at,
      }
    case 'CaravanCancelled':
      return { ...state, status: 'cancelled', missing: event.data.missing }
    case 'CaravanDeparted':
      return {
        ...state,
        status: 'travelling',
        departedAt: event.data.at,
        arrivesAt: event.data.arrivesAt,
      }
    case 'CaravanAmbushed':
      return {
        ...state,
        status: 'ambushed',
        ambushedAt: event.data.at,
        stolen: event.data.stolen,
        returned: event.data.returned,
      }
    case 'CaravanDelivered':
      return { ...state, status: 'delivered' }
    case 'ExpeditionSent':
      return {
        ...initialState,
        exists: true,
        mission: 'expedition',
        caravanId: event.data.caravanId,
        senderId: event.data.senderId,
        senderName: event.data.senderName,
        recipientId: event.data.senderId,
        recipientName: CAVE_NAME,
        escort: event.data.escort,
        seed: event.data.seed,
        sentAt: event.data.at,
      }
    case 'ExpeditionReturned':
      return { ...state, status: 'returned', loot: event.data.loot }
  }
}

export const replay = (events: CaravanEvent[]) => events.reduce(evolve, initialState)

// ---------------------------------------------------------------------------
// decide
// ---------------------------------------------------------------------------

/** Règles 1, 2, 3 et 6 : vérification d'un envoi, avant tout prélèvement. */
export function checkSend(
  command: Extract<CaravanCommand, { type: 'SendCaravan' }>,
): CaravanError | null {
  if (!command.recipient) return { code: 'UNKNOWN_RECIPIENT' }
  if (command.recipient.id === command.sender.id) return { code: 'OWN_VILLAGE' }
  if (!ESCORTS.includes(command.escort)) return { code: 'INVALID_ESCORT' }
  const amounts = Object.entries(command.cargo)
  const valid = amounts.every(
    ([resource, amount]) =>
      CARGO_RESOURCES.includes(resource as never) && Number.isInteger(amount) && (amount ?? 0) > 0,
  )
  if (amounts.length === 0 || !valid) return { code: 'EMPTY_CARGO' }
  if (totalOf(command.cargo) > CARAVAN_CAPACITY) {
    return { code: 'OVER_CAPACITY', capacity: CARAVAN_CAPACITY }
  }
  if (command.inTransit >= MAX_IN_TRANSIT) return { code: 'TOO_MANY_CARAVANS', max: MAX_IN_TRANSIT }
  return null
}

export function decide(state: CaravanState, command: CaravanCommand, now: number): Decision {
  if (command.type === 'SendCaravan') {
    if (state.exists) return fail({ code: 'ALREADY_EXISTS' })
    const error = checkSend(command)
    if (error) return fail(error)
    const recipient = command.recipient as Party
    return accept({
      type: 'CaravanSent',
      data: {
        caravanId: command.caravanId,
        senderId: command.sender.id,
        senderName: command.sender.name,
        recipientId: recipient.id,
        recipientName: recipient.name,
        cargo: command.cargo,
        escort: command.escort,
        seed: command.seed,
        at: now,
      },
    })
  }

  if (command.type === 'SendExpedition') {
    if (state.exists) return fail({ code: 'ALREADY_EXISTS' })
    if (!ESCORTS.includes(command.escort)) return fail({ code: 'INVALID_ESCORT' })
    if (command.inTransit >= MAX_IN_TRANSIT) {
      return fail({ code: 'TOO_MANY_CARAVANS', max: MAX_IN_TRANSIT })
    }
    return accept({
      type: 'ExpeditionSent',
      data: {
        caravanId: command.caravanId,
        senderId: command.sender.id,
        senderName: command.sender.name,
        escort: command.escort,
        seed: command.seed,
        at: now,
      },
    })
  }

  if (!state.exists) return fail({ code: 'CARAVAN_NOT_FOUND' })

  switch (command.type) {
    case 'RecordTransferResult':
      return recordTransferResult(state, command, now)
    case 'Resolve':
      return resolve(state, now) ?? accept()
    case 'ResolveDue':
      // Une caravane qui n'est plus en route n'a plus d'échéance : le rappel est sans objet.
      if (state.status !== 'travelling') return accept()
      // Échéance pas encore atteinte : une erreur, pour que le rappel soit retenté plus tard.
      return resolve(state, now) ?? fail({ code: 'NOT_DUE' })
  }
}

/**
 * Règles 4 et 5 : réponse du Village au prélèvement de la cargaison. Seule la réponse attendue
 * dans l'état courant fait progresser la saga ; une réponse en double est ignorée (règle 11).
 */
function recordTransferResult(
  state: CaravanState,
  result: Extract<CaravanCommand, { type: 'RecordTransferResult' }>,
  now: number,
): Decision {
  if (state.status !== 'loading' || result.transferId !== transferIdOf(state.caravanId, 'load')) {
    return accept()
  }
  if (result.outcome === 'refused') {
    return accept({ type: 'CaravanCancelled', data: { missing: result.missing ?? {}, at: now } })
  }
  return accept({
    type: 'CaravanDeparted',
    // Règles 5 et 14 : l'heure d'arrivée, ou de retour de la grotte, est fixée au départ.
    data: {
      at: now,
      arrivesAt: now + (state.mission === 'expedition' ? EXPEDITION_MS : travelTimeOf(state.cargo)),
    },
  })
}

/**
 * Règles 7 à 11 : constat de l'issue, si son heure est passée. L'événement porte l'heure
 * prévue, et non celle du constat : le récit du voyage ne dépend pas de l'instant où il est lu.
 * Renvoie null si l'heure n'est pas encore venue.
 */
function resolve(state: CaravanState, now: number): Decision | null {
  if (state.status !== 'travelling') return accept()
  const outcome = outcomeOf(state)
  if (now < outcome.at) return null
  if (state.mission === 'expedition') {
    // Règles 15 et 16 : le butin, déduit de la graine, n'est connu qu'au retour.
    return accept({ type: 'ExpeditionReturned', data: { at: outcome.at, loot: caveLoot(state) } })
  }
  if (outcome.kind === 'arrival') {
    return accept({ type: 'CaravanDelivered', data: { at: outcome.at } })
  }
  const { stolen, returned } = splitLoot(state.cargo)
  return accept({ type: 'CaravanAmbushed', data: { at: outcome.at, stolen, returned } })
}
