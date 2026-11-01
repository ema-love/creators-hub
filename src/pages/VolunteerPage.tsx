import { Volunteer } from '../sections/Volunteer'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function VolunteerPage() {
  useDocumentTitle('Volunteer')
  return <Volunteer />
}
