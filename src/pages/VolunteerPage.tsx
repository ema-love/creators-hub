import { Volunteer } from '../sections/Volunteer'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function VolunteerPage() {
  useDocumentTitle(
    'Volunteer',
    'Join the Creators Hub Volunteer Collective for The First Room in Lagos. Roles in technology, programme, media and community. No experience required, no fee to take part.',
  )
  return <Volunteer />
}
