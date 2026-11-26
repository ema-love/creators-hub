import { Team } from '../sections/Team'
import { usePageMeta } from '../hooks/useDocumentTitle'

/** /team: the same cards as the homepage's team section, as their own page. */
export default function TeamPage() {
  usePageMeta('/team')
  return <Team asPage />
}
