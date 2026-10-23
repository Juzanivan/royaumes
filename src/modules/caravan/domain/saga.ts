/**
 * Étapes de la saga de la Caravane : pour chaque événement d'une caravane, les demandes à
 * adresser au Village, ou à la caravane elle-même. Le domaine décide de ces demandes ; le
 * service les traduit en messages de la boîte d'envoi.
 */
import { type CaravanEvent, type CaravanState, outcomeOf, transferIdOf } from './caravan'
import { type Cargo, expeditionLoadOf, loadOf, totalOf } from './rules'

/** Demande produite par une étape de la saga. */
export type SagaRequest =
  /** Prélever des ressources : le Village répond, et la réponse fait progresser la saga. */
  | { kind: 'withdraw'; transferId: string; playerId: string; resources: Cargo }
  /** Verser des ressources : le versement ne peut pas échouer, aucune réponse n'est attendue. */
  | { kind: 'deposit'; transferId: string; playerId: string; resources: Cargo }
  /** Rappel adressé à la caravane à l'heure de son issue, si aucune lecture ne l'a constatée. */
  | { kind: 'resolve'; caravanId: string; at: number }

/**
 * Demandes déclenchées par un événement. L'état reçu est celui qui suit l'application de
 * l'événement : il contient l'expéditeur, le destinataire et la cargaison.
 */
export function requestsFor(state: CaravanState, event: CaravanEvent): SagaRequest[] {
  switch (event.type) {
    // 1. Envoi : prélèvement de la cargaison et du prix de l'escorte (étape compensable).
    case 'CaravanSent':
      return [
        {
          kind: 'withdraw',
          transferId: transferIdOf(state.caravanId, 'load'),
          playerId: state.senderId,
          resources: loadOf(state.cargo, state.escort),
        },
      ]

    // 2. Départ : la caravane se rappellera à l'heure de son issue.
    case 'CaravanDeparted':
      return [{ kind: 'resolve', caravanId: state.caravanId, at: outcomeOf(state).at }]

    // 3a. Livraison : toute la cargaison au destinataire (règle 8).
    case 'CaravanDelivered':
      return [
        {
          kind: 'deposit',
          transferId: transferIdOf(state.caravanId, 'deliver'),
          playerId: state.recipientId,
          resources: state.cargo,
        },
      ]

    // 3b. Compensation : ce qu'il reste de la cargaison est rendu à l'expéditeur (règle 9).
    case 'CaravanAmbushed':
      return [
        {
          kind: 'deposit',
          transferId: transferIdOf(state.caravanId, 'return'),
          playerId: state.senderId,
          resources: event.data.returned,
        },
      ]

    // Annulation : rien n'a été prélevé, rien n'est à compenser.
    case 'CaravanCancelled':
      return []

    // Expédition : prélèvement des provisions et du prix de l'escorte (règle 13).
    case 'ExpeditionSent':
      return [
        {
          kind: 'withdraw',
          transferId: transferIdOf(state.caravanId, 'load'),
          playerId: state.senderId,
          resources: expeditionLoadOf(state.escort),
        },
      ]

    // Retour de la grotte : le butin est versé à l'expéditeur, s'il y en a un (règle 17).
    case 'ExpeditionReturned':
      return totalOf(event.data.loot) === 0
        ? []
        : [
            {
              kind: 'deposit',
              transferId: transferIdOf(state.caravanId, 'loot'),
              playerId: state.senderId,
              resources: event.data.loot,
            },
          ]
  }
}
