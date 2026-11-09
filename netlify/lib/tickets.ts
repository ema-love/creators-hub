import { randomBytes } from 'node:crypto'
import { designById, formatTicketId, type TicketDesignId } from '../../src/content/ticketDesigns'
import { TICKET_CATEGORY, type TicketTierId } from '../../src/content/tickets'
import { claim, type Kv } from './kv'
import type { Registration } from './registrations'

export type TicketStatus = 'valid' | 'checked_in' | 'void'

/** One free admission, issued when someone registers. */
export type Ticket = {
  id: string
  /** Registration reference. */
  ref: string
  attendeeName: string
  email: string
  category: TicketTierId
  design: TicketDesignId
  status: TicketStatus
  /** Secret, random; encoded in the QR code. */
  token: string
  issuedAt: string
  checkedInAt?: string
}

/*
 * Keys in the "tickets" store:
 *   slot/<ref>              the registration's Ticket
 *   num/<letter>/<n>        ticket number taken (first creator wins, so IDs are unique)
 *   counter/<letter>        hint for the next free number
 *   id/<ticketId>, tok/<token>  → slot key
 *   checkin/<ticketId>      admission record (first creator wins, so one check-in)
 *   email/<hash>, seat/<n>  registration claims (see register.ts)
 */
export const slotKey = (ref: string) => `slot/${ref}`

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

/**
 * Issues the registration's ticket, or returns it if it already exists.
 * Only the request that won the email claim calls this, so there is no
 * competing issuer; the create-only write still guards against a retry.
 */
export async function issueTicket(kv: Kv, registration: Registration, now = new Date()): Promise<Ticket> {
  const slot = slotKey(registration.ref)
  const existing = await kv.get<Ticket>(slot)
  if (existing) return existing

  const design = designById(registration.design)
  const ticket: Ticket = {
    id: formatTicketId(design.letter, await claimNumber(kv, design.letter, slot)),
    ref: registration.ref,
    attendeeName: registration.name,
    email: registration.email,
    category: TICKET_CATEGORY,
    design: registration.design,
    status: 'valid',
    token: newTicketToken(),
    issuedAt: now.toISOString(),
  }
  const issued = (await kv.create(slot, ticket)) ? ticket : (await kv.get<Ticket>(slot))!
  await kv.put(`id/${issued.id}`, { slot })
  await kv.put(`tok/${issued.token}`, { slot })
  return issued
}

export async function ticketForRegistration(kv: Kv, ref: string): Promise<Ticket | null> {
  const t = await kv.get<Ticket>(slotKey(ref))
  return t ? withCheckIn(kv, t) : null
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

/** Ticket fields the holder's own pages need, including the QR token. */
export const ownerView = (t: Ticket) => ({
  id: t.id,
  attendeeName: t.attendeeName,
  category: t.category,
  design: t.design,
  status: t.status,
  token: t.token,
  checkedInAt: t.checkedInAt ?? null,
})
