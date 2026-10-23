'use client'
import { useCaravanTraffic } from '@/modules/caravan/ui'
import { VillageScreen } from '@/modules/realm/ui'

/**
 * Carte du village, sur laquelle roulent les chariots des caravanes en route. La page assemble
 * les deux modules : le Village dessine les chariots sans rien savoir de la Caravane, qui
 * fournit seulement leur liste.
 */
export function VillageWithCaravans({ userId, userName }: { userId: string; userName: string }) {
  const travellers = useCaravanTraffic()
  return <VillageScreen userId={userId} userName={userName} travellers={travellers} />
}
