import { look } from '@/ui/theme'
import { RESOURCES, type Stock } from '../../contracts'

/** Stock du village, en surimpression en haut de la carte, avec la production de chaque ressource. */
export function ResourceHud({ stock, rates }: { stock: Stock; rates: Stock }) {
  return (
    <section className="vmap-hud" aria-label="Ressources">
      {RESOURCES.map((r) => {
        const { glyph, label } = look(r)
        return (
          <span key={r} className="vmap-pill" title={label}>
            <span aria-hidden="true">{glyph}</span>
            <strong>{Math.floor(stock[r])}</strong>
            <small>+{rates[r]}/min</small>
            <span className="sr-only">{label}</span>
          </span>
        )
      })}
    </section>
  )
}
