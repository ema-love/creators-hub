import { randomBytes } from 'node:crypto'
import { designById, formatTicketId, type TicketDesignId } from '../../src/content/ticketDesigns'
import type { TicketTierId } from '../../src/content/tickets'
import { claim, type Kv } from './kv'
import type { Order } from './orders'

export type TicketStatus = 'valid' | 'checked_in' | 'void'

/** One admission. Created only after the order's payment is verified. */
export type Ticket = {
  id: string
  orderRef: string
  attendeeName: string
  email: string
  category: TicketTierId
  design: TicketDesignId
  paymentStatus: 'paid'
  status: TicketStatus
  /** Secret, random; encoded in the QR code. */
  token: string
  purchasedAt: string
  issuedAt: string
  checkedInAt?: string
}

/*
 * Keys in the "tickets" store:
 *   slot/<orderRef>/<n>     Ticket, one per attendee
 *   claim/<orderRef>/<n>    who is issuing that slot (first creator wins)
 *   num/<letter>/<n>        ticket number taken (first creator wins, so IDs are unique)
 *   counter/<letter>        hint for the next free number
 *   id/<ticketId>, tok/<token>  → slot key
 *   checkin/<ticketId>      admission record (first creator wins, so one check-in)
 */
const slotKey = (ref: string, i: number) => `slot/${ref}/${i}`

/** Claims the next free number for a design. Unique even under concurrency. */
async function claimNumber(kv: Kv, letter: string, slot: string): Promise<number> {
  let n = (await kv.get<{ next: number }>(`counter/${letter}`))?.next ?? 1
  for (let attempts = 0; attempts < 500; attempts++, n++) {
    if (await claim(kv, `num/${letter}/${n}`, { slot })) {
      await kv.put(`counter/${letter}`, { next: n + 1 })
      return n
    }
  }
  throw new Error(`Could not allocate a ticket number for ${letter}`)
}

export const newTicketToken = () => randomBytes(16).toString('base64url')

const CLAIM_STALE_MS = 20_000
const WAIT_MS = 150
const MAX_WAIT_MS = 6_000
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function createTicket(kv: Kv, order: Order, i: number, slot: string, now: Date): Promise<Ticket> {
  const attendee = order.attendees[i]!
  const design = designById(attendee.design)
  const ticket: Ticket = {
    id: formatTicketId(design.letter, await claimNumber(kv, design.letter, slot)),
    orderRef: order.txRef,
    attendeeName: attendee.name,
    email: order.email,
    category: order.tier,
    design: attendee.design,
    paymentStatus: 'paid',
    status: 'valid',
    token: newTicketToken(),
    purchasedAt: order.paidAt ?? now.toISOString(),
    issuedAt: now.toISOString(),
  }
  if (await kv.create(slot, ticket)) return ticket
  return (await kv.get<Ticket>(slot))!
}

/**
 * Issues one ticket per attendee for a paid order. Safe to call any number
 * of times, including concurrently (payment return page + webhook): each
 * slot is issued by whichever caller claims it first; the others wait for
 * that ticket instead of creating their own.
 */
export async function issueTickets(kv: Kv, order: Order, now = new Date()): Promise<Ticket[]> {
  if (order.status !== 'paid') throw new Error('Tickets are only issued for paid orders')
  const tickets: Ticket[] = []
  for (let i = 0; i < order.attendees.length; i++) {
    const slot = slotKey(order.txRef, i)
    let ticket = await kv.get<Ticket>(slot)
    if (!ticket) {
      const claimKey = `claim/${order.txRef}/${i}`
      if (await claim(kv, claimKey, { at: Date.now() })) {
        ticket = await createTicket(kv, order, i, slot, now)
      } else {
        for (let waited = 0; !ticket && waited < MAX_WAIT_MS; waited += WAIT_MS) {
          await sleep(WAIT_MS)
          ticket = await kv.get<Ticket>(slot)
        }
        if (!ticket) {
          // The claimant seems to have died mid-issue: take over if its claim is stale.
          const claim = await kv.get<{ at: number }>(claimKey)
          if (claim && Date.now() - claim.at < CLAIM_STALE_MS) throw new Error('Ticket issuing is still in progress')
          await kv.put(claimKey, { at: Date.now() })
          ticket = await createTicket(kv, order, i, slot, now)
        }
      }
    }
    await kv.put(`id/${ticket.id}`, { slot })
    await kv.put(`tok/${ticket.token}`, { slot })
    tickets.push(ticket)
  }
  return tickets
}

export async function ticketsForOrder(kv: Kv, order: Order): Promise<Ticket[]> {
  const out: Ticket[] = []
  for (let i = 0; i < order.attendees.length; i++) {
    const t = await kv.get<Ticket>(slotKey(order.txRef, i))
    if (t) out.push(await withCheckIn(kv, t))
  }
  return out
}

export async function findTicketSlot(kv: Kv, by: { token: string } | { ticketId: string }): Promise<string | null> {
  const key = 'token' in by ? `tok/${by.token}` : `id/${by.ticketId.trim().toUpperCase()}`
  return (await kv.get<{ slot: string }>(key))?.slot ?? null
}

/** The check-in record is the source of truth for whether a ticket has been used. */
export async function withCheckIn(kv: Kv, ticket: Ticket): Promise<Ticket> {
  if (ticket.status === 'checked_in') return ticket
  const record = await kv.get<{ at: string }>(`checkin/${ticket.id}`)
  return record ? { ...ticket, status: 'checked_in', checkedInAt: record.at } : ticket
}

/** What a ticket holder (or staff) sees. Never includes the token. */
export type TicketView = Omit<Ticket, 'token' | 'email'>
export function publicView(ticket: Ticket): TicketView {
  const view: Partial<Ticket> = { ...ticket }
  delete view.token
  delete view.email
  return view as TicketView
}
