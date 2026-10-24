import type { Cargo, Escort } from '../domain/rules'
import { Cave } from './cave'
import { Guard, Knight } from './figures'
import { Foreground, Landscape } from './landscape'
import { JourneySky } from './sky'
import { Horse, WagonSide } from './wagon'

/**
 * Moments d'une expédition mis en scène : l'aller, l'exploration de la grotte, le retour, puis
 * le butin rapporté. La scène ne connaît aucune règle : l'écran choisit le moment.
 */
export type ExpeditionPhase =
  | 'loading'
  | 'outbound'
  | 'exploring'
  | 'inbound'
  | 'returned'
  | 'cancelled'

/** Moments où le décor défile. */
const MOVING: ExpeditionPhase[] = ['outbound', 'inbound']
/** Moments où la caravane a fait demi-tour, vers son village. */
const TURNED: ExpeditionPhase[] = ['inbound', 'returned']

/** Escorte de l'expédition : elle entre dans la grotte pendant l'exploration. */
function ExplorerFigures({ escort, exploring }: { escort: Escort; exploring: boolean }) {
  if (escort === 'none') return null
  return (
    <g className={exploring ? 'journey-explorers is-exploring' : 'journey-explorers'}>
      {escort === 'guards' ? (
        <>
          <Guard x={330} />
          <Guard x={1290} delay={0.3} />
        </>
      ) : (
        <>
          <Knight x={300} />
          <Knight x={1300} delay={0.25} />
        </>
      )}
    </g>
  )
}

/**
 * Scène de profil d'une expédition : la caravane roule à vide vers la grotte, attend devant son
 * entrée pendant que l'escorte la fouille, puis rentre ; le butin n'apparaît dans le chariot
 * qu'une fois l'expédition revenue.
 */
export function ExpeditionScene({
  phase,
  escort,
  loot,
  caveShown,
}: {
  phase: ExpeditionPhase
  escort: Escort
  loot: Cargo
  /** Vrai quand la grotte est en vue : à la fin de l'aller, et pendant l'exploration. */
  caveShown: boolean
}) {
  const classes = [
    'journey-scene',
    MOVING.includes(phase) ? 'is-moving' : 'is-stopped',
    phase === 'inbound' ? 'is-reversed' : '',
  ].join(' ')
  const exploring = phase === 'exploring'
  return (
    // biome-ignore lint/a11y/useSemanticElements: un <fieldset> ne peut pas remplacer un <svg> ; le groupe est nommé par aria-label, sans <title> qui s'afficherait en infobulle.
    <svg
      className={classes}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      role="group"
      aria-label="La caravane en expédition vers la grotte"
    >
      <JourneySky />
      <Landscape />
      <g className={caveShown ? 'journey-gate is-shown' : 'journey-gate'}>
        <Cave exploring={exploring} />
      </g>
      <g className={TURNED.includes(phase) ? 'journey-caravan is-turned' : 'journey-caravan'}>
        <Horse x={1120} color="#5e3b22" delay={0.2} />
        <WagonSide x={720} cargo={phase === 'returned' ? loot : {}} lost={false} />
        <Horse x={1080} />
        <ExplorerFigures escort={escort} exploring={exploring} />
      </g>
      <Foreground />
    </svg>
  )
}
