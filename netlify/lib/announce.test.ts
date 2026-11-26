import { describe, expect, it, vi } from 'vitest'
import { attendanceCounts, createAnnouncement, listAnnouncements, parseMessage, recipients, registrationsCsv, renderAnnouncementEmail, sendAnnouncements } from './announce'
import type { Email } from './email'
import { memoryKv } from './kv'
import { registerAttendee } from './register'
import { memoryRegistrationStore } from './registrations'

const setup = async (n: number) => {
  const kv = memoryKv()
  const store = memoryRegistrationStore()
  for (let i = 0; i < n; i++) {
    await registerAttendee(kv, store, { name: `Person ${i}`, email: `p${i}@example.com`, design: 'fashion', attendance: i % 2 ? 'online' : 'in_person' }, { capacity: null, now: new Date(Date.UTC(2026, 10, 1, 0, i)) })
  }
  return { kv, store }
}

/** A mailer that allows `quota` emails, then refuses like Gmail at its daily limit. */
const gmail = (quota: number) => {
  const sent: Email[] = []
  const ids = new Set<string>()
  return {
    sent,
    setQuota: (q: number) => (quota = q),
    mailer: {
      send: async (e: Email) => {
        if (ids.has(e.idempotencyKey)) return
        if (quota < 1) throw new Error('quota')
        quota--
        ids.add(e.idempotencyKey)
        sent.push(e)
      },
    },
  }
}

const msg = { subject: 'Venue announcement: The First Room', message: 'The venue is confirmed.\n\nSee you there!' }

describe('messages to everyone registered', () => {
  it('sends each person the message once, pausing at the daily limit and resuming later', async () => {
    const { kv, store } = await setup(5)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const a = await createAnnouncement(kv, store, msg, new Date(Date.UTC(2026, 11, 1)))
    expect(a.total).toBe(5)

    const g = gmail(3)
    expect(await sendAnnouncements(kv, store, g.mailer, 'https://site.test')).toEqual({ sent: 3, stopped: 'limit' })
    expect((await listAnnouncements(kv))[0]).toMatchObject({ sent: 3, total: 5, status: 'sending' })

    g.setQuota(100)
    expect(await sendAnnouncements(kv, store, g.mailer, 'https://site.test')).toEqual({ sent: 2, stopped: 'done' })
    expect((await listAnnouncements(kv))[0]).toMatchObject({ sent: 5, status: 'done' })
    expect(new Set(g.sent.map((e) => e.to)).size).toBe(5)

    expect(await sendAnnouncements(kv, store, g.mailer, 'https://site.test')).toEqual({ sent: 0, stopped: 'done' })
    expect(g.sent).toHaveLength(5)
  })

  it('stops when its time is up and carries on next run', async () => {
    const { kv, store } = await setup(3)
    await createAnnouncement(kv, store, msg, new Date(Date.UTC(2026, 11, 1)))
    const g = gmail(100)
    let t = 0
    const r = await sendAnnouncements(kv, store, g.mailer, 'x', { budgetMs: 15, now: () => (t += 10) })
    expect(r.stopped).toBe('time')
    expect(r.sent).toBeLessThan(3)
    expect((await sendAnnouncements(kv, store, g.mailer, 'x')).stopped).toBe('done')
    expect(g.sent).toHaveLength(3)
  })

  it('goes to people registered when it was sent, not later sign-ups', async () => {
    const { kv, store } = await setup(2)
    await createAnnouncement(kv, store, msg, new Date(Date.UTC(2026, 11, 1)))
    await registerAttendee(kv, store, { name: 'Late Comer', email: 'late@example.com', design: 'film', attendance: 'in_person' }, { capacity: null, now: new Date(Date.UTC(2026, 11, 2)) })
    const g = gmail(100)
    await sendAnnouncements(kv, store, g.mailer, 'x')
    expect(g.sent.map((e) => e.to).sort()).toEqual(['p0@example.com', 'p1@example.com'])
  })

  it('renders a personal, escaped message with the ticket button', async () => {
    const { kv, store } = await setup(1)
    const [p] = await recipients(kv, store)
    const e = renderAnnouncementEmail({ id: 'a1', subject: 'Venue', message: 'Line <b>one</b>\nline two\n\nNew paragraph' }, p!, 'https://site.test')
    expect(e.to).toBe('p0@example.com')
    expect(e.html).toContain('Hi Person,')
    expect(e.html).toContain('Line &lt;b&gt;one&lt;/b&gt;<br>line two')
    expect(e.html).toContain('/tickets/order?ref=')
    expect(e.html.match(/<a\s/g)).toHaveLength(1)
    expect(e.idempotencyKey).toBe(`announce-a1-${p!.registration.ref}`)
  })

  it('checks the subject and message', () => {
    expect(parseMessage({ subject: 'Hi', message: 'Long enough message' })).toHaveProperty('error')
    expect(parseMessage({ subject: 'Venue news', message: 'short' })).toHaveProperty('error')
    expect(parseMessage({ subject: '  Venue   news ', message: ' The venue is confirmed. ' })).toEqual({ subject: 'Venue news', message: 'The venue is confirmed.' })
  })

  it('exports everyone as a CSV that is safe to open in a spreadsheet', async () => {
    const { kv, store } = await setup(1)
    await registerAttendee(kv, store, { name: '=HYPERLINK("x")', email: 'evil@example.com', design: 'film', attendance: 'in_person' }, { capacity: null })
    const csv = registrationsCsv(await recipients(kv, store))
    expect(csv.charCodeAt(0)).toBe(0xfeff) // tells Excel it's UTF-8, so names with accents show correctly
    const lines = csv.slice(1).trimEnd().split('\r\n')
    expect(lines[0]).toBe('Registered,Ticket ID,Name,Email,Creative arm,Attendance,City / country,Checked in,Reference')
    expect(lines).toHaveLength(3)
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`)
    expect(csv).toContain('p0@example.com')
  })

  it('can go to online attendees only (e.g. the joining link), or in person only', async () => {
    const { kv, store } = await setup(5) // p0, p2, p4 in person; p1, p3 online
    const online = await createAnnouncement(kv, store, { subject: 'Your joining link', message: 'Here is the link to join.' }, new Date(Date.UTC(2026, 11, 1)), 'online')
    expect(online.total).toBe(2)
    const g = gmail(100)
    await sendAnnouncements(kv, store, g.mailer, 'https://site.test')
    expect(g.sent.map((e) => e.to).sort()).toEqual(['p1@example.com', 'p3@example.com'])
    expect(g.sent[0]!.html).toContain('View your online pass')

    const inPerson = await createAnnouncement(kv, store, msg, new Date(Date.UTC(2026, 11, 2)), 'in_person')
    expect(inPerson.total).toBe(3)
    await sendAnnouncements(kv, store, g.mailer, 'https://site.test')
    expect(g.sent.slice(2).map((e) => e.to).sort()).toEqual(['p0@example.com', 'p2@example.com', 'p4@example.com'])
  })

  it('counts in person and online, and the CSV says which', async () => {
    const { kv, store } = await setup(3)
    const list = await recipients(kv, store)
    expect(attendanceCounts(list)).toEqual({ total: 3, inPerson: 2, online: 1 })
    expect(registrationsCsv(list)).toMatch(/,Online,/)
  })
})
