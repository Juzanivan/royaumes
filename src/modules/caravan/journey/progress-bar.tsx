import { look } from '@/ui/theme'

/**
 * Barre de progression du trajet, au bas de la vue de profil : le village de départ à gauche,
 * celui d'arrivée à droite, le chariot à la fraction parcourue, et l'emplacement de l'attaque
 * une fois qu'elle a eu lieu.
 */
export function ProgressBar({
  progress,
  from,
  to,
  ambushAt,
  turned,
  caption,
}: {
  /** Fraction du trajet parcourue, entre 0 et 1. */
  progress: number
  from: string
  to: string
  /** Fraction du trajet où les brigands ont attaqué, ou null. */
  ambushAt: number | null
  /** Vrai si la caravane rentre vers son village de départ. */
  turned: boolean
  caption: string
}) {
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100)
  return (
    <div className="journey-progress">
      <div className="journey-ends">
        <span>{from}</span>
        <span>{to}</span>
      </div>
      <div
        className="journey-track"
        role="progressbar"
        aria-label="Progression du trajet"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="journey-fill" style={{ width: `${percent}%` }} />
        {ambushAt !== null && (
          <span
            className="journey-ambush"
            style={{ left: `${ambushAt * 100}%` }}
            title="Attaque des brigands"
          >
            {look('brigand').glyph}
          </span>
        )}
        <span
          className={turned ? 'journey-marker is-turned' : 'journey-marker'}
          style={{ left: `${percent}%` }}
          aria-hidden="true"
        >
          {look('caravan').glyph}
        </span>
      </div>
      <p className="journey-caption" role="status">
        {caption}
      </p>
    </div>
  )
}
