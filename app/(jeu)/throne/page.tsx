import { headers } from 'next/headers'
import { currentUser } from '@/bootstrap/server'
import { ProfileScreen } from '@/ui/profile-screen'

/**
 * Page du trône : le profil du joueur connecté. La mise en page du groupe (jeu) garantit qu'un
 * joueur est connecté ; son nom et son adresse sont lus dans sa session, à chaque requête.
 */
export default async function ThronePage() {
  const user = await currentUser(await headers())
  return <ProfileScreen name={user?.name ?? ''} email={user?.email ?? ''} />
}
