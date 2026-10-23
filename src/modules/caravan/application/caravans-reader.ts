import type { CaravanSummary, Destination } from '../contracts'
import type { Party } from '../domain/caravan'

/** Port de lecture du modèle tenu par la projection de la Caravane, défini par la couche application. */
export interface CaravansReader {
  /** Caravanes envoyées et reçues par un joueur, les plus récentes d'abord. */
  list(viewerId: string): Promise<CaravanSummary[]>
  /** Nombre de caravanes d'un expéditeur en cours de chargement ou en route. */
  inTransit(senderId: string): Promise<number>
  /** Villages vers lesquels un joueur peut envoyer une caravane : tous, sauf le sien. */
  destinations(viewerId: string): Promise<Destination[]>
  /** Joueur qui possède un village, désigné par le nom de ce village ; null s'il n'en a pas. */
  destination(playerId: string): Promise<Party | null>
}
