import { CaravanJourney } from '@/modules/caravan/ui'

/**
 * Vue de profil d'une caravane. Son adresse contient l'identifiant de la caravane ; seuls son
 * expéditeur et son destinataire peuvent la consulter.
 */
export default async function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CaravanJourney caravanId={id} />
}
