import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Lock, Minus, Plus } from 'lucide-react'
import { firstRoom } from '../content/event'
import {
  MAX_TICKETS_PER_ORDER,
  formatNaira,
  ticketTiers,
  type TicketTier,
  type TicketTierId,
} from '../content/tickets'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Placeholder } from '../components/ui/Placeholder'
import { Reveal } from '../components/ui/Reveal'
import { TextField } from '../components/forms/Fields'
import { TicketDesign } from '../components/tickets/TicketDesign'
import { ticketDesigns, type TicketDesignId } from '../content/ticketDesigns'
import { ease } from '../lib/motion'
import { cn } from '../lib/cn'

const CHECKOUT_URL = '/.netlify/functions/checkout'

/**
 * Ticket tiers and checkout. Payment happens on Flutterwave's hosted page;
 * the price is set on the server from src/content/tickets.ts.
 */
export function Tickets({ asPage = false }: { asPage?: boolean }) {
  const onSale = ticketTiers.some((t) => t.price !== null)
  const [selected, setSelected] = useState<TicketTierId | null>(null)
  const tier = ticketTiers.find((t) => t.id === selected) ?? null
  const Heading = asPage ? 'h1' : 'h2'

  return (
    <Section
      id="tickets"
      surface="dark"
      aria-labelledby="tickets-title"
      className={cn('bg-[#120d0a] pb-28 md:pb-36', asPage ? 'min-h-[90svh] pt-36 md:pt-44' : 'pt-28 md:pt-36')}
    >
      <div className="container-edge">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow className="text-rust">Tickets · {firstRoom.fullName}</Eyebrow>
            <Heading id="tickets-title" className="mt-6 text-headline font-medium">
              <MaskText inView={!asPage} lines={['Choose your seat', 'in the room.']} />
            </Heading>
          </div>
          <p className="text-cream/70 md:col-span-4 md:col-start-9">
            {onSale
              ? 'Pick a ticket, then pay securely with Flutterwave by card, bank transfer or USSD.'
              : 'Ticket prices and what each tier includes will be announced soon. Sales open here as soon as they’re confirmed.'}
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-6">
          {ticketTiers.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <TierCard tier={t} selected={selected === t.id} onSelect={() => setSelected(t.id)} />
            </Reveal>
          ))}
        </div>

        <AnimatePresence initial={false}>
          {tier && tier.price !== null && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: ease.out }}
              className="overflow-hidden"
            >
              <CheckoutForm tier={tier} price={tier.price} onCancel={() => setSelected(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  )
}

function TierCard({ tier, selected, onSelect }: { tier: TicketTier; selected: boolean; onSelect: () => void }) {
  const premium = tier.id === 'premium'
  const available = tier.price !== null
  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-[20px] border p-7 transition-colors duration-500 md:p-9',
        premium ? 'border-rust/50 bg-rust/[0.08]' : 'border-cream/15 bg-cream/[0.03]',
        selected && 'border-electric',
      )}
    >
      {premium && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-10 select-none font-display text-[9rem] font-semibold leading-none text-transparent"
          style={{ WebkitTextStroke: '1px rgba(196,98,45,0.35)' }}
        >
          001
        </span>
      )}
      <p className={cn('eyebrow', premium ? 'text-rust' : 'text-silver')}>{tier.name}</p>
      <p className="mt-6 font-display text-[clamp(2rem,4vw,3.25rem)] font-medium leading-none tracking-[-0.03em]">
        {available ? formatNaira(tier.price!) : <Placeholder className="text-base">Price to be announced</Placeholder>}
      </p>
      {available && <p className="mt-2 text-sm text-cream/55">per ticket</p>}
      <p className="mt-6 text-cream/80">{tier.summary}</p>

      <div className="mt-6 flex-1 border-t border-cream/10 pt-6">
        {tier.perks ? (
          <ul className="space-y-3">
            {tier.perks.map((perk) => (
              <li key={perk} className="flex gap-3 text-cream/85">
                <Check className={cn('mt-0.5 h-4 w-4 shrink-0', premium ? 'text-rust' : 'text-electric')} aria-hidden="true" />
                {perk}
              </li>
            ))}
          </ul>
        ) : (
          <Placeholder>What’s included will be announced</Placeholder>
        )}
      </div>

      <button
        type="button"
        onClick={onSelect}
        disabled={!available}
        aria-pressed={selected}
        className={cn(
          'group mt-8 inline-flex items-center justify-center gap-3 rounded-full px-6 py-4 font-display font-medium transition-colors duration-300',
          !available && 'cursor-not-allowed border border-cream/15 text-cream/50',
          available && premium && 'bg-rust text-ink hover:bg-cream',
          available && !premium && 'bg-electric text-ink hover:bg-cream',
        )}
      >
        {available ? (selected ? 'Selected' : `Get ${tier.name} tickets`) : 'Not on sale yet'}
        {available && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
      </button>
    </article>
  )
}

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string }
type Attendee = { name: string; design: TicketDesignId | null }

function CheckoutForm({
  tier,
  price,
  onCancel,
}: {
  tier: TicketTier
  price: number
  onCancel: () => void
}) {
  const [quantity, setQuantity] = useState(1)
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: '', design: null }])
  const [buyerName, setBuyerName] = useState('')
  const [preview, setPreview] = useState(0)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const qtyId = useId()

  // One attendee row per ticket.
  useEffect(() => {
    setAttendees((list) =>
      quantity > list.length
        ? [...list, ...Array.from({ length: quantity - list.length }, () => ({ name: '', design: null }))]
        : list.slice(0, quantity),
    )
    setPreview((p) => Math.min(p, quantity - 1))
  }, [quantity])

  const update = (i: number, patch: Partial<Attendee>) =>
    setAttendees((list) => list.map((a, j) => (j === i ? { ...a, ...patch } : a)))

  // The first ticket defaults to the buyer's own name.
  const nameFor = (i: number) => attendees[i]?.name.trim() || (i === 0 ? buyerName.trim() : '')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    const missing = attendees.findIndex((a) => !a.design)
    if (missing >= 0) {
      setPreview(missing)
      setStatus({ kind: 'error', message: `Choose a creative arm for ticket ${missing + 1}.` })
      document.getElementById(`arm-${missing}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    const data = new FormData(form)
    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier.id,
          quantity,
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          attendees: attendees.map((a, i) => ({ name: nameFor(i), design: a.design })),
        }),
      })
      const body = (await res.json().catch(() => ({}))) as { link?: string; error?: string }
      if (!res.ok || !body.link) throw new Error(body.error ?? 'We couldn’t start the payment. Please try again.')
      window.location.assign(body.link)
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }

  const previewAttendee: Attendee = attendees[preview] ?? attendees[0] ?? { name: '', design: null }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-10 rounded-[20px] border border-cream/15 p-6 md:mt-8 md:grid-cols-12 md:p-10">
      <div className="space-y-8 md:col-span-7">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-title font-medium">Your details</h3>
          <button type="button" onClick={onCancel} className="link-draw text-sm text-cream/60 hover:text-cream">
            Change ticket type
          </button>
        </div>
        <div onInput={(e) => (e.target as HTMLInputElement).name === 'name' && setBuyerName((e.target as HTMLInputElement).value)}>
          <TextField label="Full name" name="name" required autoComplete="name" />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <TextField label="Email (tickets are sent here)" name="email" type="email" required autoComplete="email" />
          <TextField label="Phone (optional)" name="phone" autoComplete="tel" />
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm text-cream/60">Who’s each ticket for?</legend>
          {attendees.map((a, i) => (
            <div
              key={i}
              onFocus={() => setPreview(i)}
              className={cn('grid gap-4 rounded-[14px] border p-4', preview === i ? 'border-cream/35' : 'border-cream/10')}
            >
              <label className="flex flex-col gap-1.5 text-xs text-cream/55">
                Ticket {i + 1} · attendee name
                <input
                  id={`attendee-${i}`}
                  value={a.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder={i === 0 ? buyerName || 'Same as your name' : 'Full name'}
                  required={i > 0 || !buyerName}
                  minLength={2}
                  maxLength={80}
                  autoComplete="off"
                  className="border-0 border-b border-cream/25 bg-transparent px-0 py-2 text-base text-cream outline-none placeholder:text-cream/35 focus:border-cream"
                />
              </label>
              <div id={`arm-${i}`} role="radiogroup" aria-label={`Ticket ${i + 1}: which creative arm are you under?`} className="sm:col-span-2">
                <p className="text-xs text-cream/55">Which creative arm are you under?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ticketDesigns.map((d) => {
                    const on = a.design === d.id
                    return (
                      <button
                        key={d.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          update(i, { design: d.id })
                          setPreview(i)
                          if (status.kind === 'error') setStatus({ kind: 'idle' })
                        }}
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm transition-colors duration-300',
                          on ? 'border-electric bg-electric font-medium text-ink' : 'border-cream/25 text-cream/80 hover:border-cream',
                        )}
                      >
                        {d.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </fieldset>
      </div>

      <div className="flex flex-col gap-6 md:col-span-5 md:border-l md:border-cream/10 md:pl-10">
        <div className="mx-auto w-full max-w-[240px]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {previewAttendee.design ? (
              <motion.div
                key={previewAttendee.design}
                initial={{ opacity: 0, y: 16, rotate: -1.5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: ease.out }}
              >
                <TicketDesign
                  design={previewAttendee.design}
                  category={tier.id}
                  attendeeName={nameFor(preview) || 'Your name'}
                  ticketId={`CH001-${ticketDesigns.find((d) => d.id === previewAttendee.design)!.letter}-····`}
                  qrValue={null}
                />
                <p className="mt-2 text-center text-xs text-cream/45">
                  Your ticket {quantity > 1 ? `(ticket ${preview + 1})` : ''} preview. The ticket ID and QR code are issued once
                  payment is confirmed.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid aspect-[264/455] w-full place-items-center rounded-[11px] border border-dashed border-cream/20 p-6 text-center"
              >
                <p className="text-sm text-cream/55">
                  Choose {quantity > 1 ? `ticket ${preview + 1}’s` : 'your'} creative arm to see your ticket.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-cream/50">{tier.name}</p>
            <p className="mt-1 font-display">{formatNaira(price)} each</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/25 hover:border-cream disabled:opacity-40"
              aria-label="One fewer ticket"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <output id={qtyId} aria-live="polite" aria-label="Number of tickets" className="w-8 text-center font-display text-2xl tabular-nums">
              {quantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(MAX_TICKETS_PER_ORDER, q + 1))}
              disabled={quantity >= MAX_TICKETS_PER_ORDER}
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/25 hover:border-cream disabled:opacity-40"
              aria-label="One more ticket"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-baseline justify-between border-t border-cream/10 pt-6">
          <span className="text-cream/70">Total</span>
          <span className="font-display text-3xl font-medium tabular-nums">{formatNaira(price * quantity)}</span>
        </div>

        <button
          type="submit"
          disabled={status.kind === 'submitting'}
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-electric px-7 py-4 font-display font-medium text-ink transition-colors hover:bg-cream disabled:opacity-60"
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          {status.kind === 'submitting' ? 'Opening secure checkout…' : `Pay ${formatNaira(price * quantity)}`}
        </button>

        <div aria-live="polite" className="min-h-5 text-sm">
          {status.kind === 'error' ? (
            <p role="alert" className="text-rust">
              {status.message}
            </p>
          ) : (
            <p className="text-cream/50">
              You’ll pay on Flutterwave’s secure page by card, bank transfer or USSD, then come straight back here for your
              tickets.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
