import { ensureTicketsEmailed } from './deliver'
import type { Mailer } from './email'
import type { Kv } from './kv'
import type { Order, OrderStore } from './orders'
import { issueTickets, type Ticket } from './tickets'

/**
 * Everything that follows a verified payment: issue one ticket per attendee
 * (idempotent), then email them once. Called from the return page and the
 * webhook; either may run first, or both at once.
 */
export async function fulfilPaidOrder(
  orders: OrderStore,
  kv: Kv,
  order: Order,
  delivery: { mailer: Mailer | null; siteOrigin: string },
): Promise<{ order: Order; tickets: Ticket[] }> {
  const tickets = await issueTickets(kv, order)
  const emailed = await ensureTicketsEmailed(orders, order, tickets, delivery)
  return { order: emailed, tickets }
}

/** Ticket fields the buyer's own pages need, including the QR token. */
export const ownerView = (t: Ticket) => ({
  id: t.id,
  attendeeName: t.attendeeName,
  category: t.category,
  design: t.design,
  status: t.status,
  token: t.token,
  checkedInAt: t.checkedInAt ?? null,
})
