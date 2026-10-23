/**
 * Entrée publique « partagée » du module Caravane : utilisable par le serveur
 * comme par l'interface. Elle ne contient que des types, des schémas de
 * validation et des constantes, sans aucun code propre au serveur.
 */
import { z } from 'zod'
import { ResourceAmounts } from '@/modules/realm/contracts'
import { ESCORTS } from './domain/rules'

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

/** Préfixe commun aux noms des flux de toutes les caravanes. */
export const CARAVAN_STREAM_PREFIX = 'caravan-'

/** Nom du flux qui contient les événements d'une caravane. */
export const caravanStream = (caravanId: string) => `${CARAVAN_STREAM_PREFIX}${caravanId}`

/** Sujets des messages adressés à la Caravane. */
export const CARAVAN_TOPICS = {
  /** Réponse du Village à un mouvement de ressources. */
  transferResult: 'caravan.transfer-result',
  /** Rappel différé d'une caravane, à l'heure de son issue. */
  resolve: 'caravan.resolve',
} as const
