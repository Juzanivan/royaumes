/**
 * Entrée publique « partagée » du module Caravane : utilisable par le serveur
 * comme par l'interface. Elle ne contient que des types, des schémas de
 * validation et des constantes, sans aucun code propre au serveur.
 */
import { z } from 'zod'
import { ResourceAmounts } from '@/modules/realm/contracts'
import type { CaravanStatus } from './domain/caravan'
import { type Cargo, ESCORTS, type Escort } from './domain/rules'

export type { CaravanError, CaravanStatus } from './domain/caravan'
export type { Cargo, Escort } from './domain/rules'
export {
  CARAVAN_CAPACITY,
  ESCORT_PRICE,
  ESCORTS,
  MAX_IN_TRANSIT,
  totalOf,
  travelTimeOf,
} from './domain/rules'
export type { CaravanView } from './domain/view'

/** Corps attendu pour envoyer une caravane : le destinataire, la cargaison et l'escorte. */
export const SendCaravanInput = z.object({
  recipientId: z.string().min(1),
  cargo: ResourceAmounts,
  escort: z.enum(ESCORTS),
})

/** Village vers lequel une caravane peut être envoyée. */
export interface Destination {
  playerId: string
  villageName: string
}

/** Caravane telle que la présente la liste d'un joueur. */
export interface CaravanSummary {
  caravanId: string
  /** Rôle du joueur qui consulte la liste. */
  role: 'sender' | 'recipient'
  senderName: string
  /** Nom du village du destinataire. */
  recipientName: string
  cargo: Cargo
  escort: Escort
  status: CaravanStatus
  departedAt: number
  arrivesAt: number
  /** Heure de l'annulation, de la livraison ou de l'attaque, une fois constatée. */
  endedAt: number | null
}

/**
 * Liste des caravanes d'un joueur, avec l'heure du serveur : l'interface s'en sert pour
 * placer les caravanes en route sur leur trajet, même si l'horloge du joueur est décalée.
 */
export interface CaravanList {
  now: number
  caravans: CaravanSummary[]
}

/** Préfixe commun aux noms des flux de toutes les caravanes. */
export const CARAVAN_STREAM_PREFIX = 'caravan-'

/**
 * Nom du flux qui contient les événements d'une caravane. C'est aussi le nom de son canal
 * temps réel, réservé à l'expéditeur et au destinataire.
 */
export const caravanStream = (caravanId: string) => `${CARAVAN_STREAM_PREFIX}${caravanId}`

/** Sujets des messages adressés à la Caravane. */
export const CARAVAN_TOPICS = {
  /** Réponse du Village à un mouvement de ressources. */
  transferResult: 'caravan.transfer-result',
  /** Rappel différé d'une caravane, à l'heure de son issue. */
  resolve: 'caravan.resolve',
} as const
