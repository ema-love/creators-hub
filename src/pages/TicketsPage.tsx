import { Tickets } from '../sections/Tickets'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function TicketsPage() {
  useDocumentTitle('Tickets')
  return <Tickets asPage />
}
