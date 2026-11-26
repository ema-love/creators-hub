import { Tickets } from '../sections/Tickets'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { firstRoom } from '../content/event'

const description = `Register free for ${firstRoom.fullName}, ${firstRoom.dateLabel}, ${firstRoom.timeRange}. Join in ${firstRoom.city} or online. One registration per person.`

export default function TicketsPage() {
  useDocumentTitle('Free registration', description)
  return <Tickets asPage />
}
