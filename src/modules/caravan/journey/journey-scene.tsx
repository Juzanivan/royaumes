import type { Cargo, Escort } from '../domain/rules'
import { Brigand, Clash, Guard, Knight } from './figures'
import { VillageGate } from './gate'
import { Foreground, Landscape } from './landscape'
import { JourneySky } from './sky'
import { Horse, WagonSide } from './wagon'

/**
 * Moments du voyage mis en scène. La scène ne connaît aucune règle : l'écran qui l'affiche
 * choisit le moment à partir de la vue de la caravane.
 */
export type JourneyPhase =
  | 'loading'
  | 'travelling'
  | 'ambush'
  | 'fight'
  | 'fleeing'
  | 'returning'
  | 'returned'
  | 'arriving'
  | 'delivered'
  | 'cancelled'

/** Moments où le décor défile : la caravane avance, ou rentre. */
const MOVING: JourneyPhase[] = ['travelling', 'returning', 'arriving']
/** Moments où la caravane a fait demi-tour. */
const TURNED: JourneyPhase[] = ['fleeing', 'returning', 'returned']
/** Moments où les brigands sont sur la route, et où ils emportent leur butin. */
const BRIGANDS: JourneyPhase[] = ['ambush', 'fight', 'fleeing']

/** Escorte qui accompagne la caravane : des gardes à pied, ou des chevaliers. */
function EscortFigures({ escort }: { escort: Escort }) {
  if (escort === 'guards') {
    return (
      <>
        <Guard x={330} />
        <Guard x={1380} delay={0.3} />
      </>
    )
  }
  if (escort === 'knights') {
    return (
      <>
        <Knight x={300} />
        <Knight x={1420} delay={0.25} />
      </>
    )
  }
  return null
}

/**
 * Scène de profil d'une caravane sur la route : le paysage défile en parallaxe derrière le
 * chariot, ses chevaux et son escorte. Selon le moment, des brigands surgissent, emportent une
 * part de la cargaison et la caravane fait demi-tour, ou bien la porte du village de
 * destination apparaît au bout de la route.
 */
export function JourneyScene({
  phase,
  cargo,
  escort,
  destination,
}: {
  phase: JourneyPhase
  cargo: Cargo
  escort: Escort
  destination: string
}) {
  const classes = [
    'journey-scene',
    MOVING.includes(phase) ? 'is-moving' : 'is-stopped',
    phase === 'returning' ? 'is-reversed' : '',
  ].join(' ')
  return (
    <svg className={classes} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <title>{`La caravane sur la route de ${destination}`}</title>
      <JourneySky />
      <Landscape />
      <g
        className={
          phase === 'arriving' || phase === 'delivered' ? 'journey-gate is-shown' : 'journey-gate'
        }
      >
        <VillageGate x={1400} name={destination} />
      </g>
      <g className={TURNED.includes(phase) ? 'journey-caravan is-turned' : 'journey-caravan'}>
        <Horse x={1120} color="#5e3b22" delay={0.2} />
        <WagonSide x={720} cargo={cargo} lost={TURNED.includes(phase)} />
        <Horse x={1080} />
        <EscortFigures escort={escort} />
      </g>
      <g className={BRIGANDS.includes(phase) ? `journey-brigands is-${phase}` : 'journey-brigands'}>
        <Brigand x={1260} flip={phase !== 'fleeing'} />
        <Brigand x={1380} flip={phase !== 'fleeing'} />
        <Brigand x={1490} flip={phase !== 'fleeing'} />
      </g>
      {phase === 'fight' && (
        <g>
          <Clash x={1230} y={560} />
          <Clash x={1340} y={600} delay={0.35} />
          <Clash x={1180} y={640} delay={0.7} />
        </g>
      )}
      <Foreground />
    </svg>
  )
}
