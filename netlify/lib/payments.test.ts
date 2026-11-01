import { afterEach, describe, expect, it, vi } from 'vitest'
import { ticketTiers } from '../../src/content/tickets'
import { createOrder, parseCheckout, paymentRequestFor } from './checkout'
import { confirmOrder } from './confirm'
import { createFlutterwave, isAuthenticWebhook, type Flutterwave, type FlwTransaction } from './flutterwave'
import type { Order, OrderStore } from './orders'

// Tiers ship without prices; tests set their own.
function withPrices(regular: number | null, premium: number | null) {
  const original = ticketTiers.map((t) => t.price)
  ticketTiers[0]!.price = regular
  ticketTiers[1]!.price = premium
  return () => ticketTiers.forEach((t, i) => (t.price = original[i]!))
}

let restore = () => {}
afterEach(() => restore())

const attendees = [
  { name: 'Ada Obi', design: 'fashion' },
  { name: 'Tunde Bakare', design: 'film' },
]
const valid = { tier: 'regular', quantity: 2, name: 'Ada Obi', email: 'Ada@Example.com', phone: '+2348000000000', attendees }

describe('parseCheckout', () => {
  it('accepts a valid request and normalises the email', () => {
    restore = withPrices(10_000, 25_000)
    const r = parseCheckout(valid)
    expect(r).toEqual({ ok: true, value: { ...valid, tier: 'regular', email: 'ada@example.com' } })
  })

  it('requires one attendee (name and design) per ticket', () => {
    restore = withPrices(10_000, 25_000)
    expect(parseCheckout({ ...valid, attendees: attendees.slice(0, 1) })).toMatchObject({ ok: false, error: 'Add a name and design for each ticket.' })
    expect(parseCheckout({ ...valid, attendees: [attendees[0], { name: 'X', design: 'film' }] })).toMatchObject({ ok: false, error: 'Enter a name for ticket 2.' })
    expect(parseCheckout({ ...valid, attendees: [attendees[0], { name: 'Tunde', design: 'music' }] })).toMatchObject({ ok: false, error: 'Choose a design for ticket 2.' })
  })

  it('tidies attendee names', () => {
    restore = withPrices(10_000, 25_000)
    const r = parseCheckout({ ...valid, attendees: [attendees[0], { name: '  Tunde   Bakare ', design: 'film' }] })
    if (!r.ok) throw new Error('expected ok')
    expect(r.value.attendees[1]!.name).toBe('Tunde Bakare')
  })

  it('refuses tiers that have no price yet', () => {
    restore = withPrices(null, 25_000)
    expect(parseCheckout(valid)).toMatchObject({ ok: false, status: 409 })
  })

  it.each([
    [{ tier: 'vip' }, 'Choose a ticket type.'],
    [{ quantity: 0 }, 'Choose between 1 and 10 tickets.'],
    [{ quantity: 11 }, 'Choose between 1 and 10 tickets.'],
    [{ quantity: 1.5 }, 'Choose between 1 and 10 tickets.'],
    [{ name: 'A' }, 'Enter your full name.'],
    [{ email: 'not-an-email' }, 'Enter a valid email address.'],
  ])('rejects %o', (patch, error) => {
    restore = withPrices(10_000, 25_000)
    expect(parseCheckout({ ...valid, ...patch })).toMatchObject({ ok: false, status: 400, error })
  })

  it('ignores any price or amount sent by the browser', () => {
    restore = withPrices(10_000, 25_000)
    const r = parseCheckout({ ...valid, amount: 1, price: 1 })
    if (!r.ok) throw new Error('expected ok')
    expect(createOrder(r.value).amount).toBe(20_000)
  })
})

describe('createOrder / paymentRequestFor', () => {
  it('prices from the server-side tier and builds the Flutterwave request', () => {
    restore = withPrices(10_000, 25_000)
    const order = createOrder({ tier: 'premium', quantity: 3, name: 'Ada', email: 'a@b.co', phone: '', attendees: [...attendees, { name: 'Zara', design: 'technology' }] as never }, 'CH001-TEST')
    expect(order).toMatchObject({ amount: 75_000, unitPrice: 25_000, currency: 'NGN', status: 'pending' })
    expect(order.accessKey).toMatch(/^[A-Za-z0-9_-]{24}$/)
    const req = paymentRequestFor(order, 'https://creatorshub.example')
    expect(req).toMatchObject({
      tx_ref: 'CH001-TEST',
      amount: 75_000,
      currency: 'NGN',
      redirect_url: 'https://creatorshub.example/tickets/confirmation',
      customer: { email: 'a@b.co', name: 'Ada' },
    })
    expect(req.customer).not.toHaveProperty('phonenumber')
  })
})

function memoryStore(initial: Order[] = []): OrderStore & { data: Map<string, Order> } {
  const data = new Map(initial.map((o) => [o.txRef, o]))
  return { data, get: async (k) => data.get(k) ?? null, save: async (o) => void data.set(o.txRef, o) }
}

function fakeFlw(tx: Partial<FlwTransaction> | Error): Flutterwave {
  const result = async () => {
    if (tx instanceof Error) throw tx
    return { id: 99, tx_ref: 'CH001-A', status: 'successful', amount: 20_000, currency: 'NGN', ...tx }
  }
  return { createPayment: vi.fn(), verifyTransaction: vi.fn(result), verifyByReference: vi.fn(result) }
}

const pending: Order = {
  txRef: 'CH001-A',
  status: 'pending',
  tier: 'regular',
  quantity: 2,
  unitPrice: 10_000,
  amount: 20_000,
  currency: 'NGN',
  name: 'Ada',
  email: 'a@b.co',
  phone: '',
  attendees: [
    { name: 'Ada', design: 'fashion' },
    { name: 'Tunde', design: 'film' },
  ],
  accessKey: 'k',
  createdAt: '2026-11-01T00:00:00.000Z',
}

describe('confirmOrder', () => {
  it('marks a matching successful payment as paid', async () => {
    const store = memoryStore([pending])
    const r = await confirmOrder(store, fakeFlw({}), { txRef: 'CH001-A', transactionId: '99' })
    expect(r.state).toBe('paid')
    expect(store.data.get('CH001-A')).toMatchObject({ status: 'paid', transactionId: '99' })
  })

  it('verifies by reference when no transaction id is given', async () => {
    const flw = fakeFlw({})
    await confirmOrder(memoryStore([pending]), flw, { txRef: 'CH001-A' })
    expect(flw.verifyByReference).toHaveBeenCalledWith('CH001-A')
  })

  it('rejects an underpaid transaction', async () => {
    const store = memoryStore([pending])
    const r = await confirmOrder(store, fakeFlw({ amount: 100 }), { txRef: 'CH001-A', transactionId: '99' })
    expect(r.state).toBe('failed')
    expect(store.data.get('CH001-A')?.status).toBe('pending')
  })

  it('rejects a different currency', async () => {
    const r = await confirmOrder(memoryStore([pending]), fakeFlw({ currency: 'USD' }), { txRef: 'CH001-A', transactionId: '99' })
    expect(r.state).toBe('failed')
  })

  it('rejects a transaction belonging to another order', async () => {
    const r = await confirmOrder(memoryStore([pending]), fakeFlw({ tx_ref: 'CH001-OTHER' }), {
      txRef: 'CH001-A',
      transactionId: '99',
    })
    expect(r.state).toBe('failed')
  })

  it('records a failed payment', async () => {
    const store = memoryStore([pending])
    const r = await confirmOrder(store, fakeFlw({ status: 'failed' }), { txRef: 'CH001-A', transactionId: '99' })
    expect(r.state).toBe('failed')
    expect(store.data.get('CH001-A')?.status).toBe('failed')
  })

  it('stays pending when Flutterwave cannot confirm yet', async () => {
    const r = await confirmOrder(memoryStore([pending]), fakeFlw(new Error('down')), { txRef: 'CH001-A' })
    expect(r.state).toBe('pending')
  })

  it('does not re-verify an order that is already paid', async () => {
    const flw = fakeFlw({})
    const r = await confirmOrder(memoryStore([{ ...pending, status: 'paid' }]), flw, { txRef: 'CH001-A' })
    expect(r.state).toBe('paid')
    expect(flw.verifyByReference).not.toHaveBeenCalled()
  })

  it('reports unknown references', async () => {
    expect(await confirmOrder(memoryStore(), fakeFlw({}), { txRef: 'nope' })).toEqual({ state: 'not_found' })
  })
})

describe('Flutterwave client', () => {
  it('sends the secret key and returns the checkout link', async () => {
    const fetchMock = vi.fn(async () => Response.json({ status: 'success', data: { link: 'https://checkout.flutterwave.com/x' } }))
    const flw = createFlutterwave('FLWSECK_TEST-123', fetchMock as unknown as typeof fetch)
    restore = withPrices(10_000, 25_000)
    const link = await flw.createPayment(paymentRequestFor(createOrder({ ...valid, tier: 'regular', attendees: attendees as never }, 'CH001-X'), 'https://x.test'))
    expect(link).toBe('https://checkout.flutterwave.com/x')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.flutterwave.com/v3/payments')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer FLWSECK_TEST-123')
  })

  it('throws on an error response', async () => {
    const fetchMock = vi.fn(async () => Response.json({ status: 'error', message: 'Invalid key' }, { status: 401 }))
    const flw = createFlutterwave('bad', fetchMock as unknown as typeof fetch)
    await expect(flw.verifyTransaction('1')).rejects.toThrow('Invalid key')
  })
})

describe('isAuthenticWebhook', () => {
  it('accepts only the exact secret hash', () => {
    expect(isAuthenticWebhook('s3cret', 's3cret')).toBe(true)
    expect(isAuthenticWebhook('s3creT', 's3cret')).toBe(false)
    expect(isAuthenticWebhook(null, 's3cret')).toBe(false)
    expect(isAuthenticWebhook('', '')).toBe(false)
  })
})
