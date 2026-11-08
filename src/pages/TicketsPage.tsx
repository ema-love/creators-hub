import { Tickets } from '../sections/Tickets'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { firstRoom } from '../content/event'
import { formatNaira, ticketTiers } from '../content/tickets'

const prices = ticketTiers
  .filter((t) => t.price != null)
  .map((t) => `${t.name} ${formatNaira(t.price!)}`)
  .join(' and ')

const description = `Tickets for ${firstRoom.fullName}, ${firstRoom.dateLabel} in ${firstRoom.city}.${
  prices ? ` ${prices}, paid securely with Flutterwave.` : ''
}`

export default function TicketsPage() {
  useDocumentTitle('Tickets', description)
  return <Tickets asPage />
}
