import { describe, expect, it, vi } from 'vitest'
import { checkIn } from './checkin'
import { ensureTicketEmailed } from './deliver'
import { createResendMailer, renderTicketEmail, type Mailer } from './email'
import type { Order, OrderStore } from './orders'
import { isValidTicketSignature, signTicket, ticketLinks } from './ticketLinks'

const SECRET = 'test-signing-secret'

const paid: Order = {
  txRef: 'CH001-PAID',
  status: 'paid',
  tier: 'premium',
  quantity: 2,
  unitPrice: 40_000,
  amount: 80_000,
  currency: 'NGN',
  name: 'Ada <b>Obi</b>',
  email: 'ada@example.com',
  phone: '',
  createdAt: '2026-11-01T00:00:00.000Z',
  paidAt: '2026-11-01T00:01:00.000Z',
}

function memoryStore(initial: Order[] = []): OrderStore & { data: Map<string, Order> } {
  const data = new Map(initial.map((o) => [o.txRef, o]))
  return { data, get: async (k) => data.get(k) ?? null, save: async (o) => void data.set(o.txRef, o) }
}

describe('ticket links', () => {
  it('signs references and rejects tampering', () => {
    const sig = signTicket('CH001-PAID', SECRET)
    expect(isValidTicketSignature('CH001-PAID', sig, SECRET)).toBe(true)
    expect(isValidTicketSignature('CH001-OTHER', sig, SECRET)).toBe(false)
    expect(isValidTicketSignature('CH001-PAID', sig, 'other-secret')).toBe(false)
    expect(isValidTicketSignature('CH001-PAID', null, SECRET)).toBe(false)
  })

  it('builds pass and QR URLs carrying the signature', () => {
    const links = ticketLinks('https://ch.test', 'CH001-PAID', SECRET)
    const sig = signTicket('CH001-PAID', SECRET)
    expect(links.passUrl).toBe(`https://ch.test/tickets/pass?ref=CH001-PAID&sig=${sig}`)
    expect(links.qrUrl).toBe(`https://ch.test/.netlify/functions/ticket-qr?ref=CH001-PAID&sig=${sig}`)
  })
})

describe('renderTicketEmail', () => {
  const email = renderTicketEmail(paid, ticketLinks('https://ch.test', paid.txRef, SECRET))

  it('addresses the buyer and includes the ticket details and QR code', () => {
    expect(email.to).toBe('ada@example.com')
    expect(email.subject).toBe('Your ticket: Creators Hub 001: The First Room')
    expect(email.html).toContain('CH001-PAID')
    expect(email.html).toContain('2 × Premium')
    expect(email.html).toContain('Admits 2 people')
    expect(email.html).toContain('/.netlify/functions/ticket-qr?ref=CH001-PAID')
    expect(email.text).toContain('/tickets/pass?ref=CH001-PAID')
    expect(email.idempotencyKey).toBe('ticket-email-CH001-PAID')
  })

  it('escapes names so they cannot inject HTML', () => {
    expect(email.html).not.toContain('<b>Obi</b>')
    expect(email.html).toContain('Ada &lt;b&gt;Obi&lt;/b&gt;')
  })

  it('shows unconfirmed venue and time as to be announced', () => {
    expect(email.html).toContain('To be announced')
  })
})

describe('ensureTicketEmailed', () => {
  const config = (mailer: Mailer | null) => ({ mailer, signingSecret: SECRET, siteOrigin: 'https://ch.test' })

  it('sends once and records it', async () => {
    const store = memoryStore([paid])
    const mailer = { send: vi.fn(async () => {}) }
    const first = await ensureTicketEmailed(store, paid, config(mailer))
    expect(first.emailSentAt).toBeTruthy()
    expect(store.data.get(paid.txRef)?.emailSentAt).toBeTruthy()
    await ensureTicketEmailed(store, first, config(mailer))
    expect(mailer.send).toHaveBeenCalledTimes(1)
  })

  it('leaves the order unmarked when sending fails, so it retries later', async () => {
    const store = memoryStore([paid])
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await ensureTicketEmailed(store, paid, config({ send: async () => Promise.reject(new Error('down')) }))
    expect(result.emailSentAt).toBeUndefined()
    expect(store.data.get(paid.txRef)?.emailSentAt).toBeUndefined()
  })

  it('does nothing for unpaid orders or when email is not configured', async () => {
    const mailer = { send: vi.fn(async () => {}) }
    await ensureTicketEmailed(memoryStore(), { ...paid, status: 'pending' }, config(mailer))
    await ensureTicketEmailed(memoryStore(), paid, config(null))
    expect(mailer.send).not.toHaveBeenCalled()
  })
})

describe('createResendMailer', () => {
  it('posts to Resend with the API key and an idempotency key', async () => {
    const fetchMock = vi.fn(async () => Response.json({ id: 'email_1' }))
    const mailer = createResendMailer('re_test', 'Creators Hub <tickets@ch.test>', fetchMock as unknown as typeof fetch)
    await mailer.send({ to: 'a@b.co', subject: 's', html: '<p>h</p>', text: 't', idempotencyKey: 'k1' })
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(url).toBe('https://api.resend.com/emails')
    expect(headers.Authorization).toBe('Bearer re_test')
    expect(headers['Idempotency-Key']).toBe('k1')
    expect(JSON.parse(init.body as string)).toMatchObject({ from: 'Creators Hub <tickets@ch.test>', to: ['a@b.co'] })
  })

  it('throws when Resend rejects the email', async () => {
    const mailer = createResendMailer('bad', 'x@y.z', (async () => new Response('nope', { status: 403 })) as unknown as typeof fetch)
    await expect(mailer.send({ to: 'a@b.co', subject: 's', html: '', text: '', idempotencyKey: 'k' })).rejects.toThrow('403')
  })
})

describe('checkIn', () => {
  const opts = { signingSecret: SECRET, staffPin: '4821' }
  const sig = signTicket(paid.txRef, SECRET)

  it('shows the pass to anyone with a valid link, without admitting', async () => {
    const store = memoryStore([paid])
    const r = await checkIn(store, { ref: paid.txRef, sig, admit: true }, opts)
    expect(r).toMatchObject({ ok: true, outcome: 'valid', staff: false, pass: { quantity: 2, tier: 'Premium', paid: true } })
    expect(store.data.get(paid.txRef)?.checkedInAt).toBeUndefined()
  })

  it('rejects forged links', async () => {
    const r = await checkIn(memoryStore([paid]), { ref: paid.txRef, sig: 'forged' }, opts)
    expect(r).toMatchObject({ ok: false, status: 404 })
  })

  it('rejects a wrong staff PIN', async () => {
    const r = await checkIn(memoryStore([paid]), { ref: paid.txRef, sig, pin: '0000', admit: true }, opts)
    expect(r).toMatchObject({ ok: false, status: 401 })
  })

  it('admits once, then reports it as already admitted', async () => {
    const store = memoryStore([paid])
    const first = await checkIn(store, { ref: paid.txRef, sig, pin: '4821', admit: true }, opts)
    expect(first).toMatchObject({ ok: true, outcome: 'admitted', staff: true })
    const second = await checkIn(store, { ref: paid.txRef, sig, pin: '4821', admit: true }, opts)
    expect(second).toMatchObject({ ok: true, outcome: 'already_admitted' })
  })

  it('never admits unpaid orders', async () => {
    const store = memoryStore([{ ...paid, status: 'pending' }])
    const r = await checkIn(store, { ref: paid.txRef, sig, pin: '4821', admit: true }, opts)
    expect(r).toMatchObject({ ok: true, outcome: 'unpaid' })
    expect(store.data.get(paid.txRef)?.checkedInAt).toBeUndefined()
  })

  it('refuses staff access when no PIN is configured', async () => {
    const r = await checkIn(memoryStore([paid]), { ref: paid.txRef, sig, pin: '4821', admit: true }, { ...opts, staffPin: '' })
    expect(r).toMatchObject({ ok: false, status: 401 })
  })
})
