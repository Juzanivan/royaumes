import type { StoredEvent } from '@/platform/event-store/event-store'
import { ERASURE, type PersonalDataContributor, type Replacement } from '@/platform/privacy/privacy'
import type { VillageService } from './application/village-service'
import { villageChannel } from './contracts'

/**
 * Réécriture d'un événement du Village sans les données personnelles du joueur : seul
 * l'événement de fondation contient le nom du village, et il est dans le flux du joueur. Une
 * rectification du nom du joueur, qui ne remplace pas le nom du village, n'y change rien.
 * Elle sert au Village dans le processus, et aux copies relayées d'un Village extrait (TD11).
 */
export function redactVillageEvent(
  event: StoredEvent,
  playerId: string,
  replacement: Replacement = ERASURE,
) {
  const village = replacement.village
  if (!village) return null
  if (event.stream !== villageChannel(playerId) || event.type !== 'VillageFounded') return null
  if (event.data.name === village) return null
  return { ...event.data, name: village }
}

/**
 * Données personnelles du Village : le nom du village, choisi par le joueur.
 * Ce fichier joue, pour les droits des joueurs, le rôle que jouent api.ts pour les requêtes
 * et messages.ts pour la boîte d'envoi.
 */
export function createRealmPersonalData(service: VillageService): PersonalDataContributor {
  return {
    name: 'realm',

    async export(playerId) {
      const view = await service.getView(playerId)
      return view ? { village: view.name, stock: view.stock, levels: view.levels } : null
    },

    redact: redactVillageEvent,
  }
}
