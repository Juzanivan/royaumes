import { headers } from 'next/headers'
import { currentUser } from '@/bootstrap/server'
import { VillageWithCaravans } from './village-with-caravans'

/**
 * Page du Village. Elle transmet au composant l'identifiant du joueur connecté, qui sert à
 * nommer le canal temps réel de son village.
 * Les chariots des caravanes en route roulent sur sa carte. La mise en page du groupe (jeu)
 * garantit qu'un joueur est connecté.
 */
export default async function VillagePage() {
  const user = await currentUser(await headers())
  return <VillageWithCaravans userId={user?.id ?? ''} />
}
