import { renderTicketEmail, type Mailer } from './email'
import type { Order, OrderStore } from './orders'
import type { Ticket } from './tickets'

/**
 * Emails an order's tickets, once. If sending fails the order is left
 * unmarked, so the next confirmation (page refresh or webhook) retries.
 */
export async function ensureTicketsEmailed(
  store: OrderStore,
  order: Order,
  tickets: Ticket[],
  { mailer, siteOrigin }: { mailer: Mailer | null; siteOrigin: string },
  now = new Date(),
): Promise<Order> {
  if (order.status !== 'paid' || order.emailSentAt || !mailer || tickets.length === 0) return order
  try {
    await mailer.send(renderTicketEmail(order, tickets, siteOrigin))
  } catch (err) {
    console.error(`ticket email failed for ${order.txRef}`, err)
    return order
  }
  const sent: Order = { ...order, emailSentAt: now.toISOString() }
  await store.save(sent)
  return sent
}
