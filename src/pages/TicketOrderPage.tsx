import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import { firstRoom } from '../content/event'
import { Section } from '../components/layout/Section'
import { ArrowLink } from '../components/ui/ArrowLink'
import { TicketList, type OwnedTicket } from '../components/tickets/TicketCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; registration: { reference: string; name: string; emailSent: boolean; emailEnabled?: boolean }; ticket: OwnedTicket }
  | { kind: 'error'; message: string }

/**
 * The attendee's private ticket page (/tickets/order?ref=…&k=…): where they land
 * after registering (with &welcome=1), and where the confirmation email links.
 */
export default function TicketOrderPage() {
  useDocumentTitle('Your ticket')
  const [params] = useSearchParams()
  const welcome = params.get('welcome') === '1'
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    const q = new URLSearchParams({ ref: params.get('ref') ?? '', k: params.get('k') ?? '' })
    fetch(`/.netlify/functions/get-registration?${q}`)
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? 'We couldn’t load this ticket.')
        setState({ kind: 'ready', registration: body.registration, ticket: body.ticket })
      })
      .catch((e: Error) => setState({ kind: 'error', message: e.message }))
  }, [params])

  // Drop the one-off welcome flag so a bookmarked link is the plain ticket link.
  useEffect(() => {
    if (!welcome) return
    const url = new URL(window.location.href)
    url.searchParams.delete('welcome')
    window.history.replaceState(window.history.state, '', url)
  }, [welcome])

  const ready = state.kind === 'ready' ? state : null
  const firstName = ready?.registration.name.split(' ')[0]

  return (
    <Section surface="dark" aria-labelledby="order-title" className="grain min-h-[85svh] bg-[#0c0b0a] pt-32 pb-24">
      <div className="container-edge max-w-6xl">
        <div className="print:hidden">
          {welcome && ready && <CheckCircle2 className="mb-6 h-8 w-8 text-electric" aria-hidden="true" />}
          <p className="eyebrow text-electric">{firstRoom.fullName}</p>
          <h1 id="order-title" className="mt-4 text-headline font-medium">
            {welcome && ready ? `You’re registered, ${firstName}.` : 'Your ticket'}
          </h1>
        </div>
        <div aria-live="polite" className="mt-8">
          {state.kind === 'loading' && <p className="text-cream/60">Loading your ticket…</p>}
          {state.kind === 'error' && (
            <div className="space-y-6">
              <p className="text-lede text-cream/80">{state.message} The link may be incomplete.</p>
              <ArrowLink to="/tickets/find">Find my ticket</ArrowLink>
            </div>
          )}
          {ready && (
            <>
              <div className="max-w-2xl space-y-3 text-cream/75 print:hidden">
                <p>
                  {firstRoom.dateLabel} · Starts {firstRoom.time} · {firstRoom.city}. Venue: {firstRoom.venue ?? 'to be announced'}.
                </p>
                <p>
                  Your ticket is free and admits one person. Show its QR code at the door, on your phone or printed.{' '}
                  {ready.registration.emailSent
                    ? 'We’ve also emailed it to you.'
                    : ready.registration.emailEnabled
                      ? 'We’ll also email it to you shortly. Until then, download it below.'
                      : 'Download it below and bookmark this page: it’s your private link back to your ticket.'}
                </p>
                <p className="text-sm text-cream/55">
                  Registration <span className="select-all font-mono text-cream">{ready.registration.reference}</span>. Keep this page
                  private: anyone with the link can see your ticket.
                </p>
              </div>
              <div className="mt-14">
                <TicketList tickets={[ready.ticket]} />
              </div>
            </>
          )}
        </div>
      </div>
    </Section>
  )
}
