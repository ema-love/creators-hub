import { Section } from '../components/layout/Section'
import { ArrowLink } from '../components/ui/ArrowLink'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <Section surface="dark" aria-labelledby="nf-title" className="grain flex min-h-[80svh] items-center pt-32 pb-20">
      <div className="container-edge">
        <p className="eyebrow text-electric">404</p>
        <h1 id="nf-title" className="mt-6 max-w-3xl text-display font-medium">
          This room hasn’t been built yet.
        </h1>
        <div className="mt-10">
          <ArrowLink to="/">Back to Creators Hub</ArrowLink>
        </div>
      </div>
    </Section>
  )
}
