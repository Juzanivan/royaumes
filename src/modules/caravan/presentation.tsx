/**
 * Présentation partagée par les écrans de la Caravane : client de l'API, libellés et mises en
 * forme des cargaisons et des durées.
 */
import { hc } from 'hono/client'
import { Entity } from '@/ui/entity'
import { look } from '@/ui/theme'
import type { CaravanApi } from './api'
import {
  CARAVAN_CAPACITY,
  type CaravanError,
  type CaravanStatus,
  type Cargo,
  type Escort,
} from './contracts'

/** Client HTTP typé, déduit de la sous-application Hono du module. */
export const client = hc<CaravanApi>('/api/caravans')

/** Libellé de chaque état d'une caravane. */
export const STATUS: Record<CaravanStatus, string> = {
  loading: 'Chargement',
  travelling: 'En route',
  cancelled: 'Annulée',
  delivered: 'Livrée',
  ambushed: 'Attaquée par des brigands',
  returned: 'Revenue de la grotte',
}

/** Présentation de chaque escorte. */
export const ESCORT: Record<Escort, { label: string; glyph: string; hint: string }> = {
  none: {
    label: 'Aucune escorte',
    glyph: '🐴',
    hint: 'Gratuit, mais les brigands ne craignent rien.',
  },
  guards: { label: 'Gardes', glyph: '🛡️', hint: 'Découragent les petites bandes.' },
  knights: { label: 'Chevaliers', glyph: '⚔️', hint: 'Seule une très grande bande ose attaquer.' },
}

/** Message affiché au joueur pour chaque erreur. */
export const ERRORS: Record<CaravanError['code'] | 'INVALID_INPUT', string> = {
  INVALID_INPUT: 'Saisie invalide : choisissez un destinataire et au moins une ressource.',
  CARAVAN_NOT_FOUND: 'Caravane introuvable.',
  ALREADY_EXISTS: 'Caravane déjà envoyée.',
  OWN_VILLAGE: 'Vous ne pouvez pas envoyer une caravane à votre propre village.',
  UNKNOWN_RECIPIENT: "Ce joueur n'a pas de village.",
  EMPTY_CARGO: 'La cargaison est vide.',
  OVER_CAPACITY: `Une caravane transporte au plus ${CARAVAN_CAPACITY} unités.`,
  TOO_MANY_CARAVANS:
    'Vous avez déjà trois caravanes en route : attendez le retour de l’une d’elles.',
  INVALID_ESCORT: 'Escorte inconnue.',
  NOT_DUE: 'Le voyage n’est pas terminé.',
}

/** Quantités en toutes lettres : « 30 bois, 10 pierre ». */
export const cargoText = (cargo: Cargo | null) =>
  Object.entries(cargo ?? {})
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([resource, amount]) => `${amount} ${look(resource).label.toLowerCase()}`)
    .join(', ') || 'rien'

/** Quantités avec leurs symboles. */
export function CargoText({ cargo }: { cargo: Cargo }) {
  return (
    <>
      {Object.entries(cargo).map(([resource, amount], index) => (
        <span key={resource}>
          {index > 0 && ', '}
          {amount} <Entity kind={resource} />
        </span>
      ))}
    </>
  )
}

/** Niveau de danger présenté au joueur, selon le risque d'attaque. */
export const dangerOf = (risk: number) =>
  risk < 0.2
    ? { level: 'low', label: 'Faible' }
    : risk < 0.45
      ? { level: 'mid', label: 'Modéré' }
      : { level: 'high', label: 'Élevé' }

/** Risque en pourcentage arrondi : « 34 % ». */
export const percent = (risk: number) => `${Math.round(risk * 100)} %`

/** Durée en minutes et secondes : « 1 min 08 ». */
export const duration = (ms: number) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(seconds / 60)
  return minutes > 0 ? `${minutes} min ${String(seconds % 60).padStart(2, '0')}` : `${seconds} s`
}
