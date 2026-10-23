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
      <ArchedWindow x={730} y={110} w={140} h={260} frame="#2c1b0f" />
      <Bookshelf x={-20} w={300} top={40} bottom={FLOOR} seed={1} />
      <Bookshelf x={280} w={300} top={40} bottom={FLOOR} seed={5} />
      <Bookshelf x={1020} w={300} top={40} bottom={FLOOR} seed={9} />
      <Bookshelf x={1320} w={300} top={40} bottom={FLOOR} seed={3} />
      <FloorBoards y={FLOOR} />
      <Desk x={800} y={720} />
      <Vignette color="#120a05" strength={0.6} />
    </>
  )
}
