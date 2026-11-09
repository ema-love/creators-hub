import { describe, expect, it, vi } from 'vitest'
import { createGmailMailer, renderRegistrationEmail, type Email, type Mailer } from './email'
import { memoryKv } from './kv'
import { canonicalEmail, capacityFromEnv, findByEmail, parseRegistration, registerAttendee, seatsTaken } from './register'
import { deliverRegistration, EMAIL_PENDING, flushEmailQueue, flushSheetQueue, SHEET_PENDING } from './registrationDelivery'
import { memoryRegistrationStore } from './registrations'
import { staffSummary } from './staffSummary'
import { findTicketSlot, ticketForRegistration } from './tickets'
import { verifyTicket } from './verifyTicket'

const PIN = 'door-2026'
const ada = { name: 'Ada Obi', email: 'ada@example.com', design: 'fashion' as const }
const setup = () => ({ kv: memoryKv(), store: memoryRegistrationStore() })
const noLimit = { capacity: null }

describe('parseRegistration', () => {
  it('accepts a name, email and creative arm', () => {
    expect(parseRegistration({ name: '  Ada   Obi ', email: ' ADA@Example.com ', design: 'film' })).toEqual({
      ok: true,
      value: { name: 'Ada Obi', email: 'ada@example.com', design: 'film' },
    })
  })

  it('rejects missing or invalid details', () => {
    expect(parseRegistration({ name: 'A', email: 'a@b.co', design: 'film' }).ok).toBe(false)
    expect(parseRegistration({ name: 'Ada Obi', email: 'not-an-email', design: 'film' }).ok).toBe(false)
    expect(parseRegistration({ name: 'Ada Obi', email: 'a@b.co', design: 'music' }).ok).toBe(false)
  })

  it('ignores any quantity sent by the client', () => {
    const r = parseRegistration({ ...ada, quantity: 5, tickets: 3 })
    expect(r.ok && r.value).toEqual(ada)
  })

  it('rejects bots that fill the hidden field', () => {
    expect(parseRegistration({ ...ada, company: 'Spam Ltd' }).ok).toBe(false)
  })
})

describe('canonicalEmail', () => {
  it('treats addresses that reach the same inbox as the same', () => {
    expect(canonicalEmail('Ada@Example.com')).toBe('ada@example.com')
    expect(canonicalEmail('ada+events@example.com')).toBe('ada@example.com')
    expect(canonicalEmail('a.d.a+x@gmail.com')).toBe('ada@gmail.com')
    expect(canonicalEmail('ada@googlemail.com')).toBe('ada@gmail.com')
    expect(canonicalEmail('a.da@example.com')).toBe('a.da@example.com') // dots only matter for Gmail
  })
})

describe('registerAttendee', () => {
  it('issues exactly one free ticket with a unique ID', async () => {
    const { kv, store } = setup()
    const out = await registerAttendee(kv, store, ada, noLimit)
    expect(out.state).toBe('registered')
    if (out.state !== 'registered') return
    expect(out.ticket).toMatchObject({ id: 'CH001-F-0001', attendeeName: 'Ada Obi', category: 'free', status: 'valid', design: 'fashion' })
    expect(out.registration).toMatchObject({ ref: expect.stringMatching(/^CH001-[0-9A-F]{16}$/), ticketId: 'CH001-F-0001' })
    expect(out.ticket.token).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(await store.get(out.registration.ref)).toMatchObject({ ticketId: 'CH001-F-0001' })
  })

  it('numbers tickets per creative arm', async () => {
    const { kv, store } = setup()
    const ids = []
    for (const [email, design] of [['a@x.co', 'fashion'], ['b@x.co', 'film'], ['c@x.co', 'fashion']] as const) {
      const r = await registerAttendee(kv, store, { name: 'Some One', email, design }, noLimit)
      ids.push(r.state === 'registered' ? r.ticket.id : r.state)
    }
    expect(ids).toEqual(['CH001-F-0001', 'CH001-S-0001', 'CH001-F-0002'])
  })

  it('refuses a second registration for the same inbox, however it is written', async () => {
    const { kv, store } = setup()
    await registerAttendee(kv, store, { ...ada, email: 'ada.obi@gmail.com' }, noLimit)
    for (const email of ['ada.obi@gmail.com', 'ADA.OBI@gmail.com', 'adaobi+2@gmail.com', 'a.d.a.o.b.i@googlemail.com']) {
      const again = await registerAttendee(kv, store, { ...ada, email, design: 'film' }, noLimit)
      expect(again.state, email).toBe('already_registered')
    }
    expect((await kv.list('slot/')).length).toBe(1)
  })

  it('gives one ticket when the same email is submitted many times at once', async () => {
    const { kv, store } = setup()
    const results = await Promise.all(Array.from({ length: 8 }, () => registerAttendee(kv, store, ada, noLimit)))
    expect(results.filter((r) => r.state === 'registered')).toHaveLength(1)
    expect(results.filter((r) => r.state === 'already_registered')).toHaveLength(7)
    expect((await kv.list('slot/')).length).toBe(1)
  })

  it('never goes over capacity, even with everyone registering at once', async () => {
    const { kv, store } = setup()
    const people = Array.from({ length: 10 }, (_, i) => ({ name: `Person ${i}`, email: `p${i}@x.co`, design: 'technology' as const }))
    const results = await Promise.all(people.map((p) => registerAttendee(kv, store, p, { capacity: 3 })))
    expect(results.filter((r) => r.state === 'registered')).toHaveLength(3)
    expect(results.filter((r) => r.state === 'full')).toHaveLength(7)
    expect(await seatsTaken(kv)).toBe(3)
    expect((await kv.list('slot/')).length).toBe(3)
  })

  it('lets someone turned away by a full event register once capacity is raised', async () => {
    const { kv, store } = setup()
    await registerAttendee(kv, store, ada, { capacity: 1 })
    const ben = { name: 'Ben Ade', email: 'ben@x.co', design: 'film' as const }
    expect((await registerAttendee(kv, store, ben, { capacity: 1 })).state).toBe('full')
    expect((await registerAttendee(kv, store, ben, { capacity: 2 })).state).toBe('registered')
  })

  it('is closed when capacity is 0', async () => {
    const { kv, store } = setup()
    expect((await registerAttendee(kv, store, ada, { capacity: 0 })).state).toBe('closed')
  })

  it('recovers an email whose earlier attempt died midway', async () => {
    const { kv, store } = setup()
    const t0 = new Date('2026-11-09T10:00:00Z')
    // Simulate a request that claimed the email and then crashed.
    const key = (await kv.list('email/')).length
    expect(key).toBe(0)
    await registerAttendee(kv, store, ada, { capacity: null, now: t0 })
    const [emailKey] = await kv.list('email/')
    await kv.put(emailKey!, { ref: 'CH001-DEADDEADDEADDEAD', at: t0.getTime() })
    expect((await registerAttendee(kv, store, ada, { capacity: null, now: new Date(t0.getTime() + 5_000) })).state).toBe('already_registered')
    expect((await registerAttendee(kv, store, ada, { capacity: null, now: new Date(t0.getTime() + 120_000) })).state).toBe('registered')
  })
})

describe('capacityFromEnv', () => {
  it('reads EVENT_CAPACITY', () => {
    expect(capacityFromEnv('')).toBeNull()
    expect(capacityFromEnv(undefined)).toBeNull()
    expect(capacityFromEnv('250')).toBe(250)
    expect(capacityFromEnv('0')).toBe(0)
    expect(capacityFromEnv('lots')).toBeNull()
    expect(capacityFromEnv('-5')).toBeNull()
  })
})

describe('tickets at the door', () => {
  it('admits a ticket once, even with several scanners at the same moment', async () => {
    const { kv, store } = setup()
    const r = await registerAttendee(kv, store, ada, noLimit)
    if (r.state !== 'registered') throw new Error('not registered')
    const scans = await Promise.all(
      Array.from({ length: 3 }, () => verifyTicket(kv, { token: r.ticket.token, pin: PIN, admit: true }, { staffPin: PIN })),
    )
    const outcomes = scans.map((s) => (s.ok ? s.outcome : 'error')).sort()
    expect(outcomes).toEqual(['admitted', 'checked_in', 'checked_in'])
    expect((await ticketForRegistration(kv, r.registration.ref))?.status).toBe('checked_in')
  })

  it('reports unknown tickets as invalid and needs the PIN to admit', async () => {
    const { kv, store } = setup()
    const r = await registerAttendee(kv, store, ada, noLimit)
    if (r.state !== 'registered') throw new Error('not registered')
    expect(await verifyTicket(kv, { token: 'made-up' }, { staffPin: PIN })).toMatchObject({ ok: true, outcome: 'invalid' })
    expect(await verifyTicket(kv, { token: r.ticket.token, admit: true }, { staffPin: PIN })).toMatchObject({ ok: true, outcome: 'valid' })
    expect(await verifyTicket(kv, { ticketId: 'ch001-f-0001' }, { staffPin: PIN })).toMatchObject({ ok: false, status: 401 })
    expect(await verifyTicket(kv, { ticketId: 'ch001-f-0001', pin: PIN }, { staffPin: PIN })).toMatchObject({ ok: true, outcome: 'valid' })
    expect(await findTicketSlot(kv, { ticketId: 'CH001-F-0001' })).toBe(`slot/${r.registration.ref}`)
  })

  it('summarises registrations and check-ins for staff', async () => {
    const { kv, store } = setup()
    const a = await registerAttendee(kv, store, ada, noLimit)
    await registerAttendee(kv, store, { name: 'Ben Ade', email: 'ben@x.co', design: 'film' }, noLimit)
    if (a.state !== 'registered') throw new Error('not registered')
    await verifyTicket(kv, { token: a.ticket.token, pin: PIN, admit: true }, { staffPin: PIN })
    const s = await staffSummary(kv, { capacity: 100 })
    expect(s.totals).toEqual({ issued: 2, checkedIn: 1 })
    expect(s.capacity).toBe(100)
    expect(s.byDesign.find((d) => d.id === 'fashion')).toMatchObject({ issued: 1, checkedIn: 1 })
    expect(s.recent[0]).toMatchObject({ id: 'CH001-F-0001', attendeeName: 'Ada Obi' })
  })
})

describe('confirmation email and Google Sheet', () => {
  const recordingMailer = () => {
    const sent: Email[] = []
    return { sent, mailer: { send: async (e: Email) => void sent.push(e) } satisfies Mailer }
  }

  it('renders a free confirmation with the ticket and no payment details', async () => {
    const { kv, store } = setup()
    const r = await registerAttendee(kv, store, { ...ada, name: 'Ada <b>Obi</b>' }, noLimit)
    if (r.state !== 'registered') throw new Error('not registered')
    const email = renderRegistrationEmail(r.registration, r.ticket, 'https://site.test')
    expect(email.to).toBe('ada@example.com')
    expect(email.subject).toContain('You’re registered')
    expect(email.html).toContain('CH001-F-0001')
    expect(email.html).toContain(`https://site.test/.netlify/functions/ticket-qr?t=${r.ticket.token}`)
    expect(email.html).toContain('free')
    expect(email.html).not.toContain('<b>Obi</b>')
    expect(email.html + email.text).not.toMatch(/₦|NGN|paid|payment|Flutterwave/i)
  })

  it('emails and saves to the sheet once each', async () => {
    const { kv, store } = setup()
    const r = await registerAttendee(kv, store, ada, noLimit)
    if (r.state !== 'registered') throw new Error('not registered')
    const { sent, mailer } = recordingMailer()
    const sheetFetch = vi.fn(async () => new Response('{"ok":true}'))
    const sheet = { url: 'https://sheet.test/exec', key: 'k', fetch: sheetFetch as unknown as typeof fetch }

    const done = await deliverRegistration(kv, store, r.registration, r.ticket, { mailer, siteOrigin: 'https://site.test', sheet })
    expect(done.emailSentAt).toBeTruthy()
    expect(done.sheetSavedAt).toBeTruthy()
    expect(sent).toHaveLength(1)
    const body = JSON.parse(String((sheetFetch.mock.calls[0] as unknown as [string, RequestInit])[1].body))
    expect(body).toMatchObject({ key: 'k', kind: 'registration', registration: { ticketId: 'CH001-F-0001', name: 'Ada Obi', email: 'ada@example.com', arm: 'Fashion' } })

    await deliverRegistration(kv, store, done, r.ticket, { mailer, siteOrigin: 'https://site.test', sheet })
    expect(sent).toHaveLength(1)
    expect(sheetFetch).toHaveBeenCalledTimes(1)
  })

  it('queues rows the sheet missed and saves them later', async () => {
    const { kv, store } = setup()
    const r = await registerAttendee(kv, store, ada, noLimit)
    if (r.state !== 'registered') throw new Error('not registered')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const down = { url: 'u', key: 'k', fetch: (async () => new Response('down', { status: 500 })) as unknown as typeof fetch }
    const done = await deliverRegistration(kv, store, r.registration, r.ticket, { mailer: null, siteOrigin: 'https://site.test', sheet: down })
    expect(done.sheetSavedAt).toBeUndefined()
    expect(await kv.list(SHEET_PENDING)).toEqual([SHEET_PENDING + r.registration.ref])

    const up = { url: 'u', key: 'k', fetch: (async () => new Response('{"ok":true}')) as unknown as typeof fetch }
    expect(await flushSheetQueue(kv, store, up, (ref) => ticketForRegistration(kv, ref))).toEqual({ saved: 1, failed: 0 })
    expect(await kv.list(SHEET_PENDING)).toEqual([])
    expect((await store.get(r.registration.ref))?.sheetSavedAt).toBeTruthy()
  })

  it('a failed email never undoes the registration', async () => {
    const { kv, store } = setup()
    const r = await registerAttendee(kv, store, ada, noLimit)
    if (r.state !== 'registered') throw new Error('not registered')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const broken = { send: async () => Promise.reject(new Error('mail down')) }
    const done = await deliverRegistration(kv, store, r.registration, r.ticket, { mailer: broken, siteOrigin: 'x', sheet: null })
    expect(done.emailSentAt).toBeUndefined()
    expect(await findByEmail(kv, store, 'ADA@example.com')).toMatchObject({ ticket: { id: 'CH001-F-0001' } })
  })

  it('queues emails the mailer refused (daily limit) and sends them later, once', async () => {
    const { kv, store } = setup()
    const r = await registerAttendee(kv, store, ada, noLimit)
    if (r.state !== 'registered') throw new Error('not registered')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const full = { send: async () => Promise.reject(new Error('quota')) }
    const done = await deliverRegistration(kv, store, r.registration, r.ticket, { mailer: full, siteOrigin: 'https://site.test', sheet: null })
    expect(done.emailSentAt).toBeUndefined()
    expect(await kv.list(EMAIL_PENDING)).toEqual([EMAIL_PENDING + r.registration.ref])

    const ticketFor = (ref: string) => ticketForRegistration(kv, ref)
    expect(await flushEmailQueue(kv, store, full, 'https://site.test', ticketFor)).toEqual({ sent: 0, failed: 1 })
    const { sent, mailer } = recordingMailer()
    expect(await flushEmailQueue(kv, store, mailer, 'https://site.test', ticketFor)).toEqual({ sent: 1, failed: 0 })
    expect(sent[0]?.to).toBe('ada@example.com')
    expect(await kv.list(EMAIL_PENDING)).toEqual([])
    expect((await store.get(r.registration.ref))?.emailSentAt).toBeTruthy()
    expect(await flushEmailQueue(kv, store, mailer, 'https://site.test', ticketFor)).toEqual({ sent: 0, failed: 0 })
  })
})

describe('Gmail mailer', () => {
  const email: Email = { to: 'ada@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi', idempotencyKey: 'k-1' }

  it('posts the email with the connection key', async () => {
    const f = vi.fn(async () => new Response('{"ok":true}'))
    await createGmailMailer('https://script.test/exec', 'secret', f as unknown as typeof fetch).send(email)
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://script.test/exec')
    expect(JSON.parse(String(init.body))).toEqual({ key: 'secret', ...email })
  })

  it('fails when the script refuses, so the email is retried', async () => {
    const quota = vi.fn(async () => new Response('{"ok":false,"error":"quota"}'))
    await expect(createGmailMailer('u', 'k', quota as unknown as typeof fetch).send(email)).rejects.toThrow(/quota/)
    const html = vi.fn(async () => new Response('<html>Sign in</html>'))
    await expect(createGmailMailer('u', 'k', html as unknown as typeof fetch).send(email)).rejects.toThrow(/refused/)
  })
})
