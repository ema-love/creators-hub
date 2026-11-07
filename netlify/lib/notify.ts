import { firstRoom } from '../../src/content/event'
import { categoryStyle, designById } from '../../src/content/ticketDesigns'
import { formatNaira } from '../../src/content/tickets'
import type { Email, Mailer } from './email'
import type { Order, OrderStore } from './orders'
import type { Ticket } from './tickets'

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/**
 * Private alert to the organiser for each confirmed order. The recipient
 * comes only from the NOTIFY_EMAIL environment variable (set in Netlify),
 * so it never appears in the code, the website or buyers' emails.
 */
export function renderOrderAlert(order: Order, tickets: Ticket[], to: string): Email {
  const paid = order.currency === 'NGN' ? formatNaira(order.amount) : `${order.amount} ${order.currency}`
  const rows = tickets.map(
    (t) => `<tr><td style="padding:4px 12px 4px 0;font-family:monospace">${esc(t.id)}</td><td style="padding:4px 12px 4px 0">${esc(t.attendeeName)}</td><td style="padding:4px 12px 4px 0">${esc(designById(t.design).name)}</td><td style="padding:4px 0">${categoryStyle[t.category].label}</td></tr>`,
  )
  const html = `<div style="font:14px/1.5 Arial,sans-serif;color:#111">
<p style="margin:0 0 12px;font-size:16px"><strong>New order: ${tickets.length} × ${esc(categoryStyle[order.tier].label)} · ${esc(paid)}</strong></p>
<p style="margin:0 0 12px">${esc(firstRoom.fullName)}<br>Order <span style="font-family:monospace">${esc(order.txRef)}</span>${order.transactionId ? ` · Flutterwave transaction ${esc(order.transactionId)}` : ''}</p>
<p style="margin:0 0 12px">Buyer: ${esc(order.name)} · ${esc(order.email)}${order.phone ? ` · ${esc(order.phone)}` : ''}</p>
<table style="border-collapse:collapse;font-size:14px">${rows.join('')}</table>
</div>`
  const text = [
    `New order: ${tickets.length} × ${categoryStyle[order.tier].label} · ${paid}`,
    `${firstRoom.fullName}`,
    `Order ${order.txRef}${order.transactionId ? ` · Flutterwave transaction ${order.transactionId}` : ''}`,
    `Buyer: ${order.name} · ${order.email}${order.phone ? ` · ${order.phone}` : ''}`,
    '',
    ...tickets.map((t) => `${t.id}  ${t.attendeeName}  ${designById(t.design).name}  ${categoryStyle[t.category].label}`),
  ].join('\n')
  return {
    to,
    subject: `New ticket order ${order.txRef} · ${tickets.length} × ${categoryStyle[order.tier].label} · ${paid}`,
    html,
    text,
    idempotencyKey: `order-alert-${order.txRef}`,
  }
}

/** Sends the organiser alert once per order; skipped when NOTIFY_EMAIL or email isn't configured. */
export async function ensureOrderAlerted(
  store: OrderStore,
  order: Order,
  tickets: Ticket[],
  { mailer, notifyTo }: { mailer: Mailer | null; notifyTo: string },
  now = new Date(),
): Promise<Order> {
  if (order.status !== 'paid' || order.notifiedAt || !mailer || !notifyTo || tickets.length === 0) return order
  try {
    await mailer.send(renderOrderAlert(order, tickets, notifyTo))
  } catch (err) {
    console.error(`order alert failed for ${order.txRef}`, err)
    return order
  }
  const latest = (await store.get(order.txRef)) ?? order
  const notified: Order = { ...latest, notifiedAt: now.toISOString() }
  await store.save(notified)
  return notified
}
