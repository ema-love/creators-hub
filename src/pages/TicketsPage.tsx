import { Tickets } from '../sections/Tickets'
import { usePageMeta } from '../hooks/useDocumentTitle'

export default function TicketsPage() {
  usePageMeta('/tickets')
  return <Tickets asPage />
}
