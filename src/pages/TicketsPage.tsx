import { Tickets } from '../sections/Tickets'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { firstRoom } from '../content/event'

const description = `Register free for ${firstRoom.fullName}, ${firstRoom.dateLabel} in ${firstRoom.city}. One ticket per person, with your own QR ticket issued instantly.`

export default function TicketsPage() {
  useDocumentTitle('Free registration', description)
  return <Tickets asPage />
}
