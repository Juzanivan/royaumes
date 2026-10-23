import { look } from '@/ui/theme'
import { type Building, CATALOG, MAX_LEVEL, type Stock, type VillageView } from '../../contracts'

/** Indique si le stock couvre un coût ; faux si le coût est absent (niveau maximal). */
const affordable = (stock: Stock, cost: Partial<Stock> | null) =>
  !!cost && Object.entries(cost).every(([r, n]) => stock[r as keyof Stock] >= (n ?? 0))

/**
 * Panneau d'un bâtiment : niveau et production, actuels et après amélioration, coût de
 * l'amélioration avec les quantités manquantes, et bouton d'amélioration. Il s'affiche du
 * côté de la carte opposé au bâtiment, pour ne pas le masquer.
 */
export function BuildingPanel({
  side,
  building,
  view,
  stock,
  error,
  onClose,
  onUpgrade,
}: {
  side: 'left' | 'right'
  building: Building
  view: VillageView
  stock: Stock
  error: string | null
  onClose: () => void
  onUpgrade: () => void
}) {
  const level = view.levels[building]
  const cost = view.nextCosts[building]
  const { produces, perMinute } = CATALOG[building]
  const { glyph, label } = look(building)
  return (
    <section className={`vmap-panel is-${side}`} aria-label={`${label}, niveau ${level}`}>
      <header>
        <h2>
          <span aria-hidden="true">{glyph}</span> {label}
        </h2>
        <button type="button" className="vmap-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      </header>
      <p>
        Niveau <strong>{level}</strong>
        {cost && (
          <>
            {' '}
            → <strong>{level + 1}</strong>
          </>
        )}
        <span className="muted"> / {MAX_LEVEL}</span>
      </p>
      <p>
        Production : <strong>{perMinute * level}</strong>
        {cost && (
          <>
            {' '}
            → <strong className="vmap-up">{perMinute * (level + 1)}</strong>
          </>
        )}{' '}
        {look(produces).label.toLowerCase()} / min
      </p>
      {cost ? (
        <>
          <ul className="vmap-cost">
            {Object.entries(cost).map(([r, n]) => {
              const missing = (n ?? 0) - Math.floor(stock[r as keyof Stock])
              return (
                <li key={r} className={missing > 0 ? 'is-missing' : ''}>
                  <span aria-hidden="true">{look(r).glyph}</span> {n} {look(r).label.toLowerCase()}
                  {missing > 0 && <small> (il manque {missing})</small>}
                </li>
              )
            })}
          </ul>
          <button type="button" disabled={!affordable(stock, cost)} onClick={onUpgrade}>
            {level === 0 ? 'Construire' : 'Améliorer'}
          </button>
        </>
      ) : (
        <p className="vmap-max">Niveau maximal atteint.</p>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
