import { firstRoom } from '../../src/content/event'
import { designById } from '../../src/content/ticketDesigns'
import { emailShell, L, type Email, type Mailer } from './email'
import { registrationUrl } from './http'
import type { Kv } from './kv'
import type { Registration, RegistrationStore } from './registrations'
import { withCheckIn, type Ticket } from './tickets'

/**
 * Messages to everyone registered (e.g. the venue announcement), sent from
 * the Creators Hub Gmail. Gmail allows about 100 emails a day, so a message
 * goes out in batches: each run sends what it can, and the 10-minute retry
 * carries on until everyone has it. Each person gets it once.
 *
 * Keys in the "tickets" store:
 *   announcement/<id>          { id, subject, message, createdAt, total, status }
 *   announce-sent/<id>/<ref>   that registration has been sent this message
 */
export type Announcement = {
  id: string
  subject: string
  message: string
  createdAt: string
  /** Everyone registered when it was created. */
  total: number
  status: 'sending' | 'done'
}

export type Recipient = { registration: Registration; ticket: Ticket }

/** Everyone registered (void tickets left out), oldest first. */
export async function recipients(kv: Kv, store: RegistrationStore): Promise<Recipient[]> {
  const keys = await kv.list('slot/')
  const out: Recipient[] = []
  for (let i = 0; i < keys.length; i += 25) {
    const batch = await Promise.all(
      keys.slice(i, i + 25).map(async (k) => {
        const ticket = await kv.get<Ticket>(k)
        const registration = ticket ? await store.get(ticket.ref) : null
        return ticket && registration && ticket.status !== 'void' ? { registration, ticket: await withCheckIn(kv, ticket) } : null
      }),
    )
    for (const r of batch) if (r) out.push(r)
  }
  return out.sort((a, b) => a.registration.createdAt.localeCompare(b.registration.createdAt))
}

export function parseMessage(body: Record<string, unknown> | null): { subject: string; message: string } | { error: string } {
  const subject = String(body?.subject ?? '').trim().replace(/\s+/g, ' ')
  const message = String(body?.message ?? '').replace(/\r\n?/g, '\n').trim()
  if (subject.length < 3 || subject.length > 150) return { error: 'Write a subject (up to 150 characters).' }
  if (message.length < 10 || message.length > 5000) return { error: 'Write a message (up to 5,000 characters).' }
  return { subject, message }
}

export async function createAnnouncement(kv: Kv, store: RegistrationStore, msg: { subject: string; message: string }, now = new Date()) {
  const id = `${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  const total = (await recipients(kv, store)).length
  const a: Announcement = { id, ...msg, createdAt: now.toISOString(), total, status: total ? 'sending' : 'done' }
  await kv.put(`announcement/${id}`, a)
  return a
}

export async function listAnnouncements(kv: Kv): Promise<Array<Announcement & { sent: number }>> {
  const keys = await kv.list('announcement/')
  const all = await Promise.all(keys.map((k) => kv.get<Announcement>(k)))
  const withCounts = await Promise.all(
    all.filter((a): a is Announcement => Boolean(a)).map(async (a) => ({ ...a, sent: (await kv.list(`announce-sent/${a.id}/`)).length })),
  )
  return withCounts.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * Sends pending announcements until everyone has them, Gmail refuses (daily
 * limit), or the time budget runs out. Safe to run from several places at
 * once: the mailer drops repeats of the same email.
 */
export async function sendAnnouncements(
  kv: Kv,
  store: RegistrationStore,
  mailer: Mailer,
  origin: string,
  { budgetMs = 8000, now = () => Date.now() } = {},
): Promise<{ sent: number; stopped: 'done' | 'limit' | 'time' }> {
  const start = now()
  let sent = 0
  const active = (await listAnnouncements(kv)).filter((a) => a.status === 'sending').reverse() // oldest first
  if (!active.length) return { sent, stopped: 'done' }
  const people = await recipients(kv, store)

  for (const a of active) {
    const done = new Set((await kv.list(`announce-sent/${a.id}/`)).map((k) => k.split('/').pop()))
    const todo = people.filter((p) => p.registration.createdAt <= a.createdAt && !done.has(p.registration.ref))
    for (const p of todo) {
      if (now() - start > budgetMs) return { sent, stopped: 'time' }
      try {
        await mailer.send(renderAnnouncementEmail(a, p, origin))
      } catch (err) {
        console.error(`announcement ${a.id} paused`, err)
        return { sent, stopped: 'limit' }
      }
      await kv.put(`announce-sent/${a.id}/${p.registration.ref}`, { at: new Date().toISOString() })
      sent++
    }
    await kv.put(`announcement/${a.id}`, { ...a, status: 'done' } satisfies Announcement)
  }
  return { sent, stopped: 'done' }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const C = { ink: '#070708', electric: '#00E5A0' }
const SERIF = "'EB Garamond', Garamond, Georgia, 'Times New Roman', serif"
const SANS = "Montserrat, 'Helvetica Neue', Arial, sans-serif"

/** One person's copy of an announcement, with a button back to their ticket. */
export function renderAnnouncementEmail(
  a: Pick<Announcement, 'id' | 'subject' | 'message'>,
  { registration, ticket }: Recipient,
  origin: string,
): Email {
  const firstName = registration.name.split(/\s+/)[0] ?? registration.name
  const url = registrationUrl(origin, registration.ref, registration.accessKey)
  const paragraphs = a.message.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const html = emailShell(
    origin,
    a.subject,
    `<tr><td class="t-head" style="padding:0 4px 8px;font:500 28px/1.15 ${SERIF};color:${L.head}">Hi ${esc(firstName)},</td></tr>
    ${paragraphs
      .map((p) => `<tr><td class="t-body" style="padding:8px 4px;font:400 15px/1.65 ${SANS};color:${L.body}">${esc(p).replace(/\n/g, '<br>')}</td></tr>`)
      .join('\n    ')}
    <tr><td style="padding:24px 4px 8px">
      <a href="${esc(url)}" style="display:inline-block;background:${C.electric};color:${C.ink};font:700 14px/1 ${SANS};text-decoration:none;padding:16px 26px;border-radius:999px">View your ticket (${esc(ticket.id)})</a>
    </td></tr>
    <tr><td class="t-foot" style="padding:24px 4px 0;font:400 12px/1.6 ${SANS};color:${L.foot}">You’re receiving this because you registered for ${esc(firstRoom.fullName)} (${esc(firstRoom.dateLabel)}, ${esc(firstRoom.city)}). Questions? Just reply to this email.</td></tr>`,
  )
  const text = [
    `Hi ${firstName},`,
    '',
    ...paragraphs.flatMap((p) => [p, '']),
    `Your ticket (${ticket.id}, ${designById(ticket.design).name}): ${url}`,
    '',
    `You’re receiving this because you registered for ${firstRoom.fullName}. Questions? Just reply to this email.`,
  ].join('\n')
  return { to: registration.email, subject: a.subject, html, text, idempotencyKey: `announce-${a.id}-${registration.ref}` }
}

/** Everyone registered, as a spreadsheet file. Cells that look like formulas are made safe. */
export function registrationsCsv(list: Recipient[]): string {
  const cell = (v: string) => {
    const s = /^[=+\-@]/.test(v) ? `'${v}` : v
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = [['Registered', 'Ticket ID', 'Name', 'Email', 'Creative arm', 'Checked in', 'Reference']]
  for (const { registration: r, ticket: t } of list) {
    rows.push([r.createdAt, t.id, r.name, r.email, designById(t.design).name, t.checkedInAt ?? '', r.ref])
  }
  return '﻿' + rows.map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n'
}
