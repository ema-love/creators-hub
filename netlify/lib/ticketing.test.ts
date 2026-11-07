import { describe, expect, it, vi } from 'vitest'
import { ensureTicketsEmailed } from './deliver'
import { createResendMailer, renderTicketEmail } from './email'
import { fulfilPaidOrder } from './fulfil'
import { memoryKv } from './kv'
import type { Order, OrderStore } from './orders'
import { findTicketSlot, issueTickets, ticketsForOrder, type Ticket } from './tickets'
import { verifyTicket } from './verifyTicket'
import { staffSummary } from './staffSummary'
import { renderOrderAlert } from './notify'

const paid: Order = {
  txRef: 'CH001-PAID',
  status: 'paid',
  tier: 'premium',
  quantity: 3,
  unitPrice: 40_000,
  amount: 120_000,
  currency: 'NGN',
  name: 'Ada Obi',
  email: 'ada@example.com',
  phone: '',
  attendees: [
    { name: 'Ada <b>Obi</b>', design: 'fashion' },
    { name: 'Tunde Bakare', design: 'film' },
    { name: 'Zara Okafor', design: 'fashion' },
  ],
  accessKey: 'secret-key',
  createdAt: '2026-11-01T00:00:00.000Z',
  paidAt: '2026-11-01T00:01:00.000Z',
}

function orderStore(initial: Order[] = []): OrderStore & { data: Map<string, Order> } {
  const data = new Map(initial.map((o) => [o.txRef, o]))
  return { data, get: async (k) => data.get(k) ?? null, save: async (o) => void data.set(o.txRef, o) }
}

describe('issueTickets', () => {
  it('issues one ticket per attendee with sequential IDs per design', async () => {
    const kv = memoryKv()
    const tickets = await issueTickets(kv, paid)
    expect(tickets.map((t) => t.id)).toEqual(['CH001-F-0001', 'CH001-S-0001', 'CH001-F-0002'])
    expect(tickets.map((t) => t.attendeeName)).toEqual(['Ada <b>Obi</b>', 'Tunde Bakare', 'Zara Okafor'])
    expect(tickets.every((t) => t.status === 'valid' && t.paymentStatus === 'paid' && t.category === 'premium')).toBe(true)
    expect(tickets[0]).toMatchObject({ orderRef: 'CH001-PAID', email: 'ada@example.com', purchasedAt: paid.paidAt })
    expect(new Set(tickets.map((t) => t.token)).size).toBe(3)
    expect(tickets[0]!.token).toMatch(/^[A-Za-z0-9_-]{22}$/)
  })

  it('continues numbering across orders', async () => {
    const kv = memoryKv()
    await issueTickets(kv, paid)
    const next = await issueTickets(kv, { ...paid, txRef: 'CH001-SECOND', attendees: [{ name: 'Kemi', design: 'fashion' }] })
    expect(next[0]!.id).toBe('CH001-F-0003')
  })

  it('never duplicates tickets when called again (repeated callbacks)', async () => {
    const kv = memoryKv()
    const first = await issueTickets(kv, paid)
    const again = await issueTickets(kv, paid)
    expect(again).toEqual(first)
    expect([...kv.data.keys()].filter((k) => k.startsWith('slot/')).length).toBe(3)
  })

  it('never duplicates tickets or skips numbers when many callbacks run at once', async () => {
    const kv = memoryKv()
    const runs = await Promise.all(Array.from({ length: 6 }, () => issueTickets(kv, paid)))
    for (const r of runs) expect(r.map((t) => `${t.id}:${t.token}`)).toEqual(runs[0]!.map((t) => `${t.id}:${t.token}`))
    expect(runs[0]!.map((t) => t.id)).toEqual(['CH001-F-0001', 'CH001-S-0001', 'CH001-F-0002'])
    expect([...kv.data.keys()].filter((k) => k.startsWith('slot/')).length).toBe(3)
  })

  it('gives every ticket a unique number when different orders are issued at once', async () => {
    const kv = memoryKv()
    const orders = Array.from({ length: 8 }, (_, i) => ({ ...paid, txRef: `CH001-ORDER${i}`, attendees: [{ name: 'A B', design: 'fashion' as const }] }))
    const ids = (await Promise.all(orders.map((o) => issueTickets(kv, o)))).flat().map((t) => t.id)
    expect(new Set(ids).size).toBe(8)
  })

  it('refuses to issue tickets for unpaid orders', async () => {
    await expect(issueTickets(memoryKv(), { ...paid, status: 'pending' })).rejects.toThrow()
  })

  it('finds tickets by QR token and by ticket ID', async () => {
    const kv = memoryKv()
    const [t] = await issueTickets(kv, paid)
    expect(await findTicketSlot(kv, { token: t!.token })).toBe('slot/CH001-PAID/0')
    expect(await findTicketSlot(kv, { ticketId: ' ch001-f-0001 ' })).toBe('slot/CH001-PAID/0')
    expect(await findTicketSlot(kv, { token: 'made-up' })).toBeNull()
  })
})

describe('fulfilPaidOrder', () => {
  it('issues and emails once, even if fulfilled twice', async () => {
    const kv = memoryKv()
    const orders = orderStore([paid])
    const mailer = { send: vi.fn(async () => {}) }
    const delivery = { mailer, siteOrigin: 'https://ch.test' }
    const first = await fulfilPaidOrder(orders, kv, paid, delivery)
    const second = await fulfilPaidOrder(orders, kv, first.order, delivery)
    expect(second.tickets).toEqual(first.tickets)
    expect(mailer.send).toHaveBeenCalledTimes(1)
    expect(orders.data.get(paid.txRef)?.emailSentAt).toBeTruthy()
  })

  it('retries the email next time if sending failed', async () => {
    const orders = orderStore([paid])
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const tickets = await issueTickets(memoryKv(), paid)
    const failed = await ensureTicketsEmailed(orders, paid, tickets, { mailer: { send: () => Promise.reject(new Error('down')) }, siteOrigin: 'x' })
    expect(failed.emailSentAt).toBeUndefined()
    const mailer = { send: vi.fn(async () => {}) }
    await ensureTicketsEmailed(orders, failed, tickets, { mailer, siteOrigin: 'x' })
    expect(mailer.send).toHaveBeenCalledTimes(1)
  })
})

describe('renderTicketEmail', () => {
  it('includes every ticket with its own QR code and link, and the order link', async () => {
    const tickets = await issueTickets(memoryKv(), paid)
    const email = renderTicketEmail(paid, tickets, 'https://ch.test')
    expect(email.subject).toBe('Your tickets: Creators Hub 001: The First Room')
    for (const t of tickets) {
      expect(email.html).toContain(t.id)
      expect(email.html).toContain(`/.netlify/functions/ticket-qr?t=${t.token}`)
      expect(email.text).toContain(`https://ch.test/v/${t.token}`)
    }
    expect(email.html).toContain('/email/ticket-fashion.jpg')
    expect(email.html).toContain('PREMIUM')
    expect(email.text).toContain('/tickets/order?ref=CH001-PAID&k=secret-key')
    expect(email.idempotencyKey).toBe('ticket-email-CH001-PAID')
  })

  it('escapes attendee names', async () => {
    const tickets = await issueTickets(memoryKv(), paid)
    const { html } = renderTicketEmail(paid, tickets, 'https://ch.test')
    expect(html).not.toContain('<b>Obi</b>')
    expect(html).toContain('Ada &lt;b&gt;Obi&lt;/b&gt;')
  })
})

describe('createResendMailer', () => {
  it('posts to Resend with the API key and an idempotency key', async () => {
    const fetchMock = vi.fn(async () => Response.json({ id: 'email_1' }))
    const mailer = createResendMailer('re_test', 'Creators Hub <tickets@ch.test>', fetchMock as unknown as typeof fetch)
    await mailer.send({ to: 'a@b.co', subject: 's', html: '<p>h</p>', text: 't', idempotencyKey: 'k1' })
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('k1')
  })
})

describe('verifyTicket', () => {
  const PIN = 'door-2026'
  async function setup(order: Order = paid) {
    const kv = memoryKv()
    const orders = orderStore([order])
    const tickets = await issueTickets(kv, { ...order, status: 'paid' })
    orders.data.set(order.txRef, order)
    return { kv, orders, tickets }
  }
  const opts = { staffPin: PIN }

  it('shows a valid ticket to its holder without admitting it', async () => {
    const { kv, orders, tickets } = await setup()
    const r = await verifyTicket(kv, orders, { token: tickets[0]!.token, admit: true }, opts)
    expect(r).toMatchObject({ ok: true, outcome: 'valid', staff: false, ticket: { id: 'CH001-F-0001', status: 'valid' } })
    if (r.ok) expect(r.ticket).not.toHaveProperty('token')
  })

  it('reports unknown or forged codes as invalid', async () => {
    const { kv, orders } = await setup()
    expect(await verifyTicket(kv, orders, { token: 'forged' }, opts)).toMatchObject({ ok: true, outcome: 'invalid', ticket: null })
  })

  it('reports tickets whose order is no longer paid as awaiting payment, and never admits them', async () => {
    const { kv, orders, tickets } = await setup({ ...paid, status: 'pending' })
    const r = await verifyTicket(kv, orders, { token: tickets[0]!.token, pin: PIN, admit: true }, opts)
    expect(r).toMatchObject({ ok: true, outcome: 'awaiting_payment' })
    expect((await kv.get<Ticket>('slot/CH001-PAID/0'))!.status).toBe('valid')
  })

  it('reports voided tickets as invalid', async () => {
    const { kv, orders, tickets } = await setup()
    const slot = (await kv.get<Ticket>('slot/CH001-PAID/0'))!
    await kv.put('slot/CH001-PAID/0', { ...slot, status: 'void' })
    expect(await verifyTicket(kv, orders, { token: tickets[0]!.token, pin: PIN, admit: true }, opts)).toMatchObject({ outcome: 'invalid' })
  })

  it('lets staff admit once, records the time, then flags repeat scans', async () => {
    const { kv, orders, tickets } = await setup()
    const now = new Date('2026-12-19T14:05:00Z')
    const first = await verifyTicket(kv, orders, { token: tickets[0]!.token, pin: PIN, admit: true }, opts, now)
    expect(first).toMatchObject({ ok: true, outcome: 'admitted', staff: true, ticket: { status: 'checked_in', checkedInAt: now.toISOString() } })
    const again = await verifyTicket(kv, orders, { token: tickets[0]!.token, pin: PIN, admit: true }, opts)
    expect(again).toMatchObject({ ok: true, outcome: 'checked_in', ticket: { checkedInAt: now.toISOString() } })
  })

  it('admits each ticket independently', async () => {
    const { kv, orders, tickets } = await setup()
    await verifyTicket(kv, orders, { token: tickets[0]!.token, pin: PIN, admit: true }, opts)
    expect(await verifyTicket(kv, orders, { token: tickets[1]!.token, pin: PIN, admit: true }, opts)).toMatchObject({ outcome: 'admitted' })
  })

  it('cannot admit the same ticket twice when two scanners race', async () => {
    const { kv, orders, tickets } = await setup()
    const [a, b] = await Promise.all([
      verifyTicket(kv, orders, { token: tickets[0]!.token, pin: PIN, admit: true }, opts),
      verifyTicket(kv, orders, { token: tickets[0]!.token, pin: PIN, admit: true }, opts),
    ])
    const outcomes = [a, b].map((r) => (r.ok ? r.outcome : 'error')).sort()
    expect(outcomes).toEqual(['admitted', 'checked_in'])
  })

  it('treats a ticket as used once its check-in record exists, whatever the ticket record says', async () => {
    const { kv, orders, tickets } = await setup()
    await kv.put(`checkin/${tickets[0]!.id}`, { at: '2026-12-19T14:00:00.000Z' })
    expect(await verifyTicket(kv, orders, { token: tickets[0]!.token, pin: PIN, admit: true }, opts)).toMatchObject({
      outcome: 'checked_in',
      ticket: { checkedInAt: '2026-12-19T14:00:00.000Z' },
    })
  })

  it('lets staff look a ticket up by ID, but not the public', async () => {
    const { kv, orders } = await setup()
    expect(await verifyTicket(kv, orders, { ticketId: 'CH001-S-0001', pin: PIN }, opts)).toMatchObject({ ok: true, outcome: 'valid', ticket: { attendeeName: 'Tunde Bakare' } })
    expect(await verifyTicket(kv, orders, { ticketId: 'CH001-S-0001' }, opts)).toMatchObject({ ok: false, status: 401 })
  })

  it('rejects wrong PINs and locks out after repeated failures', async () => {
    const { kv, orders, tickets } = await setup()
    const req = { token: tickets[0]!.token, pin: 'guess', admit: true, clientId: '1.2.3.4' }
    for (let i = 0; i < 8; i++) expect(await verifyTicket(kv, orders, req, opts)).toMatchObject({ ok: false, status: 401 })
    expect(await verifyTicket(kv, orders, req, opts)).toMatchObject({ ok: false, status: 429 })
    // Even the right PIN is refused from that client during the lockout.
    expect(await verifyTicket(kv, orders, { ...req, pin: PIN }, opts)).toMatchObject({ ok: false, status: 429 })
    expect((await kv.get<Ticket>('slot/CH001-PAID/0'))!.status).toBe('valid')
  })

  it('refuses all staff access when no PIN is configured', async () => {
    const { kv, orders, tickets } = await setup()
    expect(await verifyTicket(kv, orders, { token: tickets[0]!.token, pin: 'x', admit: true }, { staffPin: '' })).toMatchObject({ ok: false, status: 401 })
  })
})

describe('ticketsForOrder', () => {
  it('returns the issued tickets in attendee order', async () => {
    const kv = memoryKv()
    const issued = await issueTickets(kv, paid)
    expect(await ticketsForOrder(kv, paid)).toEqual(issued)
  })
})

describe('staffSummary', () => {
  it('counts tickets and check-ins by category and arm, newest arrivals first', async () => {
    const kv = memoryKv()
    const orders = orderStore([paid])
    const tickets = await issueTickets(kv, paid)
    await issueTickets(kv, { ...paid, txRef: 'CH001-REG', tier: 'regular', attendees: [{ name: 'Kemi A', design: 'technology' }] })
    await verifyTicket(kv, orders, { token: tickets[1]!.token, pin: 'p', admit: true }, { staffPin: 'p' }, new Date('2026-12-19T14:00:00Z'))
    await verifyTicket(kv, orders, { token: tickets[0]!.token, pin: 'p', admit: true }, { staffPin: 'p' }, new Date('2026-12-19T14:10:00Z'))
    const s = await staffSummary(kv)
    expect(s.totals).toEqual({ issued: 4, checkedIn: 2 })
    expect(s.byCategory).toEqual({ premium: { issued: 3, checkedIn: 2 }, regular: { issued: 1, checkedIn: 0 } })
    expect(s.byDesign.find((d) => d.id === 'fashion')).toMatchObject({ issued: 2, checkedIn: 1 })
    expect(s.byDesign.find((d) => d.id === 'film')).toMatchObject({ issued: 1, checkedIn: 1 })
    expect(s.recent.map((r) => r.id)).toEqual([tickets[0]!.id, tickets[1]!.id])
  })

  it('leaves out void tickets', async () => {
    const kv = memoryKv()
    await issueTickets(kv, paid)
    const slot = (await kv.get<Ticket>('slot/CH001-PAID/0'))!
    await kv.put('slot/CH001-PAID/0', { ...slot, status: 'void' })
    expect((await staffSummary(kv)).totals.issued).toBe(2)
  })
})

describe('organiser order alert', () => {
  it('sends one alert per order to the private address, separate from the buyer email', async () => {
    const kv = memoryKv()
    const orders = orderStore([paid])
    const sent: string[] = []
    const mailer = { send: vi.fn(async (e: { to: string }) => void sent.push(e.to)) }
    const delivery = { mailer, siteOrigin: 'https://ch.test', notifyTo: 'organiser@example.test' }
    const first = await fulfilPaidOrder(orders, kv, paid, delivery)
    await fulfilPaidOrder(orders, kv, first.order, delivery)
    expect(sent.sort()).toEqual(['ada@example.com', 'organiser@example.test'])
    expect(orders.data.get(paid.txRef)).toMatchObject({ emailSentAt: expect.any(String), notifiedAt: expect.any(String) })
  })

  it('is skipped when no private address is configured', async () => {
    const mailer = { send: vi.fn(async () => {}) }
    await fulfilPaidOrder(orderStore([paid]), memoryKv(), paid, { mailer, siteOrigin: 'x', notifyTo: '' })
    expect(mailer.send).toHaveBeenCalledTimes(1) // buyer's tickets only
  })

  it('lists every ticket and escapes names', async () => {
    const tickets = await issueTickets(memoryKv(), paid)
    const alert = renderOrderAlert(paid, tickets, 'organiser@example.test')
    expect(alert.subject).toContain('3 × PREMIUM')
    for (const t of tickets) expect(alert.text).toContain(t.id)
    expect(alert.html).not.toContain('<b>Obi</b>')
  })

  it('never puts the organiser address in the buyer’s ticket email', async () => {
    const tickets = await issueTickets(memoryKv(), paid)
    const buyer = renderTicketEmail(paid, tickets, 'https://ch.test')
    expect(buyer.html + buyer.text).not.toContain('organiser@example.test')
  })
})
