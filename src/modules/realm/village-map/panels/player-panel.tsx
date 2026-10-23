import { PlayerMenu } from '@/ui/player-menu'

/** Panneau du château : le menu du joueur (ses données, le thème, la déconnexion). */
export function PlayerPanel({
  villageName,
  userName,
  onClose,
}: {
  villageName: string
  userName: string
  onClose: () => void
}) {
  return (
    <section className="vmap-panel is-right" aria-label={`Château de ${villageName}`}>
      <header>
        <h2>
          <span aria-hidden="true">🏰</span> Château de {villageName}
        </h2>
        <button type="button" className="vmap-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      </header>
      <PlayerMenu userName={userName} />
    </section>
  )
}
