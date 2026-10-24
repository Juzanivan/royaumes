import { headers } from 'next/headers'
import { currentUser } from '@/bootstrap/server'
import { CastleScreen } from '@/ui/castle-screen'

/**
 * Page du château : la grande salle et ses portes. La mise en page du groupe (jeu) garantit
 * qu'un joueur est connecté ; son nom est affiché sous celui du château.
 */
export default async function CastlePage() {
  const user = await currentUser(await headers())
  return <CastleScreen userName={user?.name ?? ''} />
}
