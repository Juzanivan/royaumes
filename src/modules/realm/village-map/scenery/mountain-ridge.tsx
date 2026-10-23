import { iso } from '../geometry/iso'
import { RidgePeak } from './ridge-peak'

/** Recul des montagnes par rapport au bord du terrain (nul : elles reposent sur le bord), et demi-largeur d'une montagne, en cases ; les pieds de deux montagnes voisines se chevauchent. */
const OUTSET = 0
const HALF_WIDTH = 2.1
/** Hauteur maximale d'un sommet, en pixels, et marge à garder sous le haut de la scène. */
const MAX_HEIGHT = 160
const TOP_MARGIN = 30
/** Haut de la zone visible du dessin, dans le repère du SVG (voir village-map.tsx). */
const VIEW_TOP = 24

/**
 * Position de chaque montagne le long de son bord (en cases) et hauteur souhaitée. Trois par
 * bord : la chaîne ferme l'arrière du terrain, comme la palissade en ferme l'avant.
 */
const RANGE: { along: 'x' | 'y'; t: number; height: number }[] = [
  { along: 'x', t: 1.4, height: 150 },
  { along: 'x', t: 4.9, height: 160 },
  { along: 'x', t: 8.4, height: 135 },
  { along: 'y', t: 1.6, height: 140 },
  { along: 'y', t: 5.1, height: 155 },
  { along: 'y', t: 8.6, height: 130 },
]

/**
 * Chaîne de montagnes le long des deux bords arrière du terrain. Chaque sommet est limité en
 * hauteur pour rester dans la scène : près du coin arrière, où le terrain est le plus haut à
 * l'écran, les montagnes sont donc moins élevées. Elles sont dessinées du fond vers l'avant.
 */
export function MountainRidge() {
  const peaks = RANGE.map(({ along, t, height }) => {
    const x = along === 'x' ? t : -OUTSET
    const y = along === 'x' ? -OUTSET : t
    const room = iso(x, y)[1] - VIEW_TOP - TOP_MARGIN
    return { along, x, y, h: Math.min(height, MAX_HEIGHT, room) }
  }).sort((a, b) => a.x + a.y - (b.x + b.y))
  return (
    <g>
      {peaks.map((p) => (
        <RidgePeak
          key={`${p.along}-${p.x}-${p.y}`}
          x={p.x}
          y={p.y}
          h={p.h}
          w={HALF_WIDTH}
          along={p.along}
        />
      ))}
    </g>
  )
}
