import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { firstRoom } from '../content/event'
import { Section } from '../components/layout/Section'
import { ArrowLink } from '../components/ui/ArrowLink'
import { TicketList, type OwnedTicket } from '../components/tickets/TicketCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; order: { reference: string; tier: string; quantity: number; name: string }; tickets: OwnedTicket[] }
  | { kind: 'unpaid' }
  | { kind: 'error'; message: string }

/** The buyer's private tickets page, from the link in their email (/tickets/order?ref=…&k=…). */
export default function TicketOrderPage() {
  useDocumentTitle('Your tickets')
  const [params] = useSearchParams()
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    const q = new URLSearchParams({ ref: params.get('ref') ?? '', k: params.get('k') ?? '' })
    fetch(`/.netlify/functions/get-order?${q}`)
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? 'We couldn’t load these tickets.')
        if (body.state !== 'paid') return setState({ kind: 'unpaid' })
        setState({ kind: 'ready', order: body.order, tickets: body.tickets })
      })
      .catch((e: Error) => setState({ kind: 'error', message: e.message }))
  }, [params])

  return (
    <Section surface="dark" aria-labelledby="order-title" className="grain min-h-[85svh] bg-[#0c0b0a] pt-32 pb-24">
      <div className="container-edge max-w-6xl">
        <div className="print:hidden">
          <p className="eyebrow text-rust">{firstRoom.fullName}</p>
          <h1 id="order-title" className="mt-4 text-headline font-medium">
            Your tickets
          </h1>
        </div>
        <div aria-live="polite" className="mt-8">
          {state.kind === 'loading' && <p className="text-cream/60">Loading your tickets…</p>}
          {state.kind === 'error' && (
            <div className="space-y-6">
              <p className="text-lede text-cream/80">{state.message} The link may be incomplete.</p>
              <ArrowLink to="/tickets/find">Send my tickets again</ArrowLink>
            </div>
          )}
          {state.kind === 'unpaid' && <p className="text-lede text-cream/80">Payment for this order hasn’t been confirmed, so no tickets have been issued.</p>}
          {state.kind === 'ready' && (
            <>
              <p className="max-w-2xl text-cream/70 print:hidden">
                Order <span className="select-all font-mono text-cream">{state.order.reference}</span> · {state.order.quantity} ×{' '}
                {state.order.tier}. Each ticket admits one person. Keep this page private: anyone with the link can see these tickets.
              </p>
              <div className="mt-14">
                <TicketList tickets={state.tickets} />
              </div>
            </>
          )}
        </div>
      </div>
    </Section>
  )
}
