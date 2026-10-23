import { ArchedWindow } from '../../parts/arched-window'
import { FloorBoards } from '../../parts/floor-boards'
import { Vignette } from '../../parts/vignette'
import { Bookshelf } from './bookshelf'
import { Desk } from './desk'

/** Ligne du sol de la salle. */
const FLOOR = 660

/** Décor de « Mes données » : les archives du château, où sont consignés les registres. */
export function AccountScene() {
  return (
    <>
      <rect width={1600} height={FLOOR} fill="#4a3426" />
      {/* Fenêtre des archives, à droite, entre deux bibliothèques : on y voit le soleil ou la lune. */}
      <rect x={1300} y={40} width={300} height={FLOOR - 40} fill="#3e2b1f" />
      <ArchedWindow x={1380} y={120} w={140} h={260} frame="#2c1b0f" celestial />
      <Bookshelf x={-20} w={300} top={40} bottom={FLOOR} seed={1} />
      <Bookshelf x={280} w={300} top={40} bottom={FLOOR} seed={5} />
      <Bookshelf x={1020} w={300} top={40} bottom={FLOOR} seed={9} />
      <FloorBoards y={FLOOR} />
      <Desk x={800} y={720} />
      <Vignette color="#120a05" strength={0.6} />
    </>
  )
}
