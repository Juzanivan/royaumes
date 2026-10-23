/**
 * Vue d'une caravane : ce qu'en voit un joueur donné. Elle ne contient jamais la graine des
 * brigands, et ne révèle l'issue du voyage qu'une fois celle-ci constatée (règles 7 et 12).
 */
import type { CaravanState, CaravanStatus } from './caravan'
import type { Cargo, Escort } from './rules'

export interface CaravanView {
  caravanId: string
  /** Rôle du joueur qui consulte la vue. */
  role: 'sender' | 'recipient'
  senderName: string
  recipientName: string
  cargo: Cargo
  escort: Escort
  status: CaravanStatus
  sentAt: number
  departedAt: number
  arrivesAt: number
  /** Après une attaque seulement : son heure, la part des brigands et le reste rendu. */
  ambushedAt: number | null
  stolen: Cargo | null
  returned: Cargo | null
  /** Ressources manquantes, pour l'expéditeur d'une caravane annulée. */
  missing: Cargo | null
}

/** Vue d'une caravane pour un joueur ; null s'il n'en est ni l'expéditeur ni le destinataire. */
export function toView(state: CaravanState, viewerId: string): CaravanView | null {
  if (!state.exists) return null
  const role =
    state.senderId === viewerId ? 'sender' : state.recipientId === viewerId ? 'recipient' : null
  if (!role) return null
  const ambushed = state.status === 'ambushed'
  return {
    caravanId: state.caravanId,
    role,
    senderName: state.senderName,
    recipientName: state.recipientName,
    cargo: state.cargo,
    escort: state.escort,
    status: state.status,
    sentAt: state.sentAt,
    departedAt: state.departedAt,
    arrivesAt: state.arrivesAt,
    ambushedAt: ambushed ? state.ambushedAt : null,
    stolen: ambushed ? state.stolen : null,
    returned: ambushed ? state.returned : null,
    missing: state.status === 'cancelled' && role === 'sender' ? state.missing : null,
  }
}
