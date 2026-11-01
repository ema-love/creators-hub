import { randomBytes, randomUUID } from 'node:crypto'
import { firstRoom } from '../../src/content/event'
import { isTicketDesignId, type TicketDesignId } from '../../src/content/ticketDesigns'
import {
  MAX_TICKETS_PER_ORDER,
  TICKET_CURRENCY,
  isTicketTierId,
  tierById,
  type TicketTierId,
} from '../../src/content/tickets'
import type { PaymentRequest } from './flutterwave'
import type { Order } from './orders'

export type CheckoutInput = {
  tier: TicketTierId
  quantity: number
  name: string
  email: string
  phone: string
  attendees: Array<{ name: string; design: TicketDesignId }>
}

export type Result<T> = { ok: true; value: T } | { ok: false; status: number; error: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validates the buyer's request. Prices are never taken from the client. */
export function parseCheckout(body: unknown): Result<CheckoutInput> {
  const b = (body ?? {}) as Record<string, unknown>
  const fail = (error: string) => ({ ok: false as const, status: 400, error })

  if (!isTicketTierId(b.tier)) return fail('Choose a ticket type.')
  const quantity = Number(b.quantity)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TICKETS_PER_ORDER) {
    return fail(`Choose between 1 and ${MAX_TICKETS_PER_ORDER} tickets.`)
  }
  const name = String(b.name ?? '').trim()
  const email = String(b.email ?? '').trim().toLowerCase()
  const phone = String(b.phone ?? '').trim()
  if (name.length < 2 || name.length > 120) return fail('Enter your full name.')
  if (!EMAIL.test(email) || email.length > 200) return fail('Enter a valid email address.')
  if (phone.length > 30) return fail('Enter a shorter phone number.')

  const list = Array.isArray(b.attendees) ? b.attendees : []
  if (list.length !== quantity) return fail('Add a name and design for each ticket.')
  const attendees: CheckoutInput['attendees'] = []
  for (const [i, raw] of list.entries()) {
    const a = (raw ?? {}) as Record<string, unknown>
    const attendeeName = String(a.name ?? '').trim().replace(/\s+/g, ' ')
    if (attendeeName.length < 2 || attendeeName.length > 80) return fail(`Enter a name for ticket ${i + 1}.`)
    if (!isTicketDesignId(a.design)) return fail(`Choose a design for ticket ${i + 1}.`)
    attendees.push({ name: attendeeName, design: a.design })
  }

  const tier = tierById(b.tier)
  if (tier.price === null) {
    return { ok: false, status: 409, error: `${tier.name} tickets are not on sale yet.` }
  }
  return { ok: true, value: { tier: b.tier, quantity, name, email, phone, attendees } }
}

export function newTxRef() {
  return `CH001-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`
}

export function createOrder(input: CheckoutInput, txRef = newTxRef(), now = new Date()): Order {
  const unitPrice = tierById(input.tier).price!
  return {
    txRef,
    status: 'pending',
    tier: input.tier,
    quantity: input.quantity,
    unitPrice,
    amount: unitPrice * input.quantity,
    currency: TICKET_CURRENCY,
    name: input.name,
    email: input.email,
    phone: input.phone,
    attendees: input.attendees,
    accessKey: randomBytes(18).toString('base64url'),
    createdAt: now.toISOString(),
  }
}

export function paymentRequestFor(order: Order, siteOrigin: string): PaymentRequest {
  const tier = tierById(order.tier)
  return {
    tx_ref: order.txRef,
    amount: order.amount,
    currency: order.currency,
    redirect_url: `${siteOrigin}/tickets/confirmation`,
    customer: { email: order.email, name: order.name, ...(order.phone ? { phonenumber: order.phone } : {}) },
    customizations: {
      title: firstRoom.fullName,
      description: `${order.quantity} × ${tier.name} ticket${order.quantity > 1 ? 's' : ''} · ${firstRoom.dateLabel}, ${firstRoom.city}`,
    },
    meta: { tier: order.tier, quantity: order.quantity },
  }
}
