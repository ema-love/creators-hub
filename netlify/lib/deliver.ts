import { renderTicketEmail, type Mailer } from './email'
import type { Order, OrderStore } from './orders'
import { ticketLinks } from './ticketLinks'

export type DeliveryConfig = { mailer: Mailer | null; signingSecret: string; siteOrigin: string }

/**
 * Emails the ticket for a paid order, once. If sending fails the order is
 * left unmarked, so the next confirmation (page refresh or webhook) retries.
 */
export async function ensureTicketEmailed(
  store: OrderStore,
  order: Order,
  { mailer, signingSecret, siteOrigin }: DeliveryConfig,
  now = new Date(),
): Promise<Order> {
  if (order.status !== 'paid' || order.emailSentAt || !mailer || !signingSecret) return order
  try {
    await mailer.send(renderTicketEmail(order, ticketLinks(siteOrigin, order.txRef, signingSecret)))
  } catch (err) {
    console.error(`ticket email failed for ${order.txRef}`, err)
    return order
  }
  const sent: Order = { ...order, emailSentAt: now.toISOString() }
  await store.save(sent)
  return sent
}
