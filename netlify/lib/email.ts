import { firstRoom } from '../../src/content/event'
import { categoryStyle, designById, EVENT_TAGLINE } from '../../src/content/ticketDesigns'
import { registrationUrl, ticketQrUrl, ticketVerifyUrl } from './http'
import type { Registration } from './registrations'
import type { Ticket } from './tickets'

export type Email = { to: string; subject: string; html: string; text: string; idempotencyKey: string }

export type Mailer = { send(email: Email): Promise<void> }

/** Sends through Resend (https://resend.com). `from` must use a domain verified in Resend. */
export function createResendMailer(apiKey: string, from: string, fetchImpl: typeof fetch = fetch): Mailer {
  return {
    async send(email) {
      // RESEND_API_BASE exists only so the end-to-end tests can point at a local stand-in.
      const res = await fetchImpl(`${process.env.RESEND_API_BASE || 'https://api.resend.com'}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          // Resend drops repeats with the same key, so an email is never sent twice.
          'Idempotency-Key': email.idempotencyKey,
        },
        body: JSON.stringify({ from, to: [email.to], subject: email.subject, html: email.html, text: email.text }),
      })
      if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text().catch(() => '')}`)
    },
  }
}

/**
 * Sends through a Google Apps Script web app running on the Creators Hub
 * Gmail account (integrations/gmail-mailer/), so emails come from that
 * address. The script drops repeats of the same idempotency key, and says
 * "quota" when the account has used its daily sending allowance.
 */
export function createGmailMailer(url: string, key: string, fetchImpl: typeof fetch = fetch): Mailer {
  return {
    async send(email) {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, ...email }),
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      })
      const text = await res.text()
      let reply: { ok?: boolean; error?: string } = {}
      try {
        reply = JSON.parse(text)
      } catch {
        // An HTML page means the script isn't deployed for "Anyone".
      }
      if (!res.ok || reply.ok !== true) throw new Error(`Gmail mailer refused the email (${res.status}): ${reply.error ?? text.slice(0, 200)}`)
    },
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const C = { ink: '#070708', card: '#0E0F0E', cream: '#F7F3EA', stub: '#E4DCD0', label: '#57524A', name: '#2C2720', muted: '#A4B2C0', line: '#262826', electric: '#00E5A0' }
const SERIF = "'EB Garamond', Garamond, Georgia, 'Times New Roman', serif"
const SANS = "Montserrat, 'Helvetica Neue', Arial, sans-serif"

/** Email-safe rendering of one ticket, following the ticket design. */
function ticketBlock(t: Ticket, origin: string) {
  const d = designById(t.design)
  const cat = categoryStyle[t.category]
  return `
  <tr><td align="center" style="padding:0 0 28px">
    <table role="presentation" width="300" cellpadding="0" cellspacing="0" style="width:300px;border-radius:12px;overflow:hidden;background:${C.card}">
      <tr><td style="padding:0;line-height:0"><img src="${origin}/email/ticket-${d.id}.jpg" width="300" height="250" alt="" style="display:block;width:300px;height:250px;border:0"></td></tr>
      <tr><td style="padding:16px 22px 14px;background:${C.card}">
        <div style="font:500 30px/1.05 ${SERIF};color:${C.cream}">${d.title.map(esc).join('<br>')}</div>
        <div style="padding-top:10px;font:500 17px/1.2 ${SERIF};color:${C.cream}">THE FIRST ROOM.</div>
        <div style="padding-top:2px;font:400 14px/1.3 ${SERIF};color:${C.cream}">${esc(EVENT_TAGLINE)}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:1px solid #3a3d3a">
          <tr>
            <td style="padding-top:10px;font:600 10px/1.45 ${SANS};letter-spacing:.04em;color:${C.cream}">19 DEC 2026<br>LAGOS, NIGERIA</td>
            <td align="right" style="padding-top:10px;font:700 11px/1 ${SANS};letter-spacing:.08em;color:${cat.color}">${cat.label}</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="background:${C.stub};padding:16px 22px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td valign="middle">
            <div style="font:600 9px/1 ${SANS};letter-spacing:.16em;color:${C.label}">ATTENDEE</div>
            <div style="padding-top:7px;font:500 18px/1.15 ${SERIF};color:${C.name}">${esc(t.attendeeName)}</div>
            <div style="padding-top:7px;font:600 10px/1 ${SANS};letter-spacing:.06em;color:${C.label}">${esc(t.id)}</div>
          </td>
          <td align="right" valign="middle" width="96"><img src="${esc(ticketQrUrl(origin, t.token))}" width="96" height="96" alt="QR code for ticket ${esc(t.id)}" style="display:block;width:96px;height:96px;border:0"></td>
        </tr></table>
      </td></tr>
    </table>
    <div style="padding-top:10px"><a href="${esc(ticketVerifyUrl(origin, t.token))}" style="font:600 13px/1 ${SANS};color:${C.electric};text-decoration:none">Open ticket ${esc(t.id)} →</a></div>
  </td></tr>`
}

/** The registration confirmation: the attendee's ticket, with its QR code. */
export function renderRegistrationEmail(
  registration: Registration,
  ticket: Ticket,
  origin: string,
  idempotencyKey = `registration-email-${registration.ref}`,
): Email {
  const firstName = registration.name.split(/\s+/)[0] ?? registration.name
  const subject = `You’re registered: ${firstRoom.fullName}`
  const viewUrl = registrationUrl(origin, registration.ref, registration.accessKey)

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ink}">
<tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
    <tr><td style="padding:0 4px 24px;font:600 14px/1.1 ${SERIF};letter-spacing:.02em;color:${C.cream}">CREATORS<br>HUB</td></tr>
    <tr><td style="padding:0 4px;font:500 32px/1.1 ${SERIF};color:${C.cream}">You’re in the room, ${esc(firstName)}.</td></tr>
    <tr><td style="padding:12px 4px 8px;font:400 15px/1.6 ${SANS};color:#cfd6d2">Your registration is confirmed. Your ticket is free and admits one person. Show its QR code at the door, on your phone or printed.</td></tr>
    <tr><td style="padding:8px 4px 28px;font:600 15px/1.6 ${SANS};color:${C.cream}">${esc(firstRoom.dateLabel)} · Starts ${esc(firstRoom.time)} (WAT) · ${esc(firstRoom.city)}, ${esc(firstRoom.country)}<br><span style="font-weight:400;color:${C.muted}">Venue: ${esc(firstRoom.venue ?? 'to be announced')}</span></td></tr>
    ${ticketBlock(ticket, origin)}
    <tr><td align="center" style="padding:4px 4px 8px">
      <a href="${esc(viewUrl)}" style="display:inline-block;background:${C.electric};color:${C.ink};font:700 14px/1 ${SANS};text-decoration:none;padding:16px 26px;border-radius:999px">View and download your ticket</a>
    </td></tr>
    <tr><td style="padding:24px 4px 0;font:400 13px/1.6 ${SANS};color:${C.muted}">Registration ${esc(registration.ref)}. ${firstRoom.venue ? '' : 'The venue will be shared as soon as it’s confirmed. '}Keep this email: the link above always brings your ticket back.</td></tr>
    <tr><td style="padding:24px 4px 0;font:400 12px/1.6 ${SANS};color:#6f7a76">Creators Hub · ${esc(firstRoom.fullName)} · ${esc(firstRoom.dateLabel)}, ${esc(firstRoom.city)}</td></tr>
  </table>
</td></tr></table>
</body></html>`

  const text = [
    `You’re in the room, ${firstName}.`,
    '',
    'Your registration is confirmed. Your ticket is free and admits one person.',
    '',
    `${firstRoom.fullName}`,
    `${firstRoom.dateLabel} · Starts ${firstRoom.time} (WAT) · ${firstRoom.city}, ${firstRoom.country}`,
    `Venue: ${firstRoom.venue ?? 'to be announced'}`,
    '',
    `${ticket.id} · ${designById(ticket.design).name} · ${categoryStyle[ticket.category].label}`,
    `Attendee: ${ticket.attendeeName}`,
    `Ticket: ${ticketVerifyUrl(origin, ticket.token)}`,
    '',
    `View and download your ticket: ${viewUrl}`,
    `Registration ${registration.ref}`,
  ].join('\n')

  return { to: registration.email, subject, html, text, idempotencyKey }
}
