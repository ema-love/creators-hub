import { firstRoom } from '../../src/content/event'
import { formatNaira, tierById } from '../../src/content/tickets'
import type { Order } from './orders'
import type { TicketLinks } from './ticketLinks'

export type Email = { to: string; subject: string; html: string; text: string; idempotencyKey: string }

export type Mailer = { send(email: Email): Promise<void> }

/** Sends through Resend (https://resend.com). `from` must use a domain verified in Resend. */
export function createResendMailer(apiKey: string, from: string, fetchImpl: typeof fetch = fetch): Mailer {
  return {
    async send(email) {
      const res = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          // Resend drops repeats with the same key, so a ticket is never emailed twice.
          'Idempotency-Key': email.idempotencyKey,
        },
        body: JSON.stringify({ from, to: [email.to], subject: email.subject, html: email.html, text: email.text }),
      })
      if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text().catch(() => '')}`)
    },
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const C = { ink: '#0A0A0A', card: '#141714', cream: '#F5F0E8', muted: '#A4B2C0', electric: '#00E5A0', rust: '#C4622D', line: '#2a2f2b' }
const FONT = "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif"

export function renderTicketEmail(order: Order, links: TicketLinks): Email {
  const tier = tierById(order.tier)
  const firstName = order.name.split(/\s+/)[0] ?? order.name
  const people = `${order.quantity} ${order.quantity === 1 ? 'person' : 'people'}`
  const venue = firstRoom.venue ?? 'To be announced'
  const time = firstRoom.time ?? 'To be announced'
  const paid = order.currency === 'NGN' ? formatNaira(order.amount) : `${order.amount} ${order.currency}`
  const subject = `Your ticket: ${firstRoom.fullName}`

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-top:1px solid ${C.line};font:400 13px/1.4 ${FONT};color:${C.muted};letter-spacing:.08em;text-transform:uppercase">${label}</td>
      <td align="right" style="padding:10px 0;border-top:1px solid ${C.line};font:500 15px/1.4 ${FONT};color:${C.cream}">${value}</td>
    </tr>`

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.ink}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Your ticket for ${esc(firstRoom.fullName)}, ${esc(firstRoom.dateLabel)} in ${esc(firstRoom.city)}. Show the QR code at the door.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ink}">
<tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="padding:0 4px 28px;font:600 20px/1 ${FONT};letter-spacing:-.03em;color:${C.cream}">Creators Hub</td></tr>
    <tr><td style="padding:0 4px;font:500 34px/1.1 ${FONT};letter-spacing:-.03em;color:${C.cream}">You’re in the room, ${esc(firstName)}.</td></tr>
    <tr><td style="padding:14px 4px 28px;font:400 16px/1.6 ${FONT};color:#cfd6d2">Your payment is confirmed. This email is your ticket: show the QR code at the door.</td></tr>
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font:500 12px/1 ${FONT};letter-spacing:.18em;text-transform:uppercase;color:${C.rust}">Creators Hub ${esc(firstRoom.edition)}</td></tr>
        <tr><td style="padding:10px 0 4px;font:500 30px/1.1 ${FONT};letter-spacing:-.03em;color:${C.cream}">${esc(firstRoom.name)}</td></tr>
        <tr><td style="padding:0 0 20px;font:400 15px/1.5 ${FONT};color:${C.muted}">${esc(firstRoom.dateLabel)} · ${esc(firstRoom.city)}, ${esc(firstRoom.country)}</td></tr>
        <tr><td align="center" style="padding:8px 0 6px">
          <div style="display:inline-block;background:${C.cream};border-radius:16px;padding:14px">
            <img src="${esc(links.qrUrl)}" width="200" height="200" alt="Ticket QR code for reference ${esc(order.txRef)}" style="display:block;width:200px;height:200px;border:0">
          </div>
        </td></tr>
        <tr><td align="center" style="padding:10px 0 22px;font:400 14px/1.5 ${FONT};color:${C.muted}">Admits ${people}. Scanned once at the door.</td></tr>
        <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row('Ticket', `${order.quantity} × ${esc(tier.name)}`)}
          ${row('Name', esc(order.name))}
          ${row('Venue', esc(venue))}
          ${row('Time', esc(time))}
          ${row('Paid', esc(paid))}
          ${row('Reference', `<span style="font-family:Menlo,Consolas,monospace;color:${C.electric}">${esc(order.txRef)}</span>`)}
        </table></td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:28px 4px 8px">
      <a href="${esc(links.passUrl)}" style="display:inline-block;background:${C.electric};color:${C.ink};font:600 15px/1 ${FONT};text-decoration:none;padding:16px 26px;border-radius:999px">Open your ticket</a>
    </td></tr>
    <tr><td style="padding:24px 4px 0;font:400 13px/1.6 ${FONT};color:${C.muted}">Venue and timings will be shared as soon as they’re confirmed. If the QR code doesn’t load, use the button above or give your reference at the door.</td></tr>
    <tr><td style="padding:28px 4px 0;border-top:1px solid ${C.line};font:400 12px/1.6 ${FONT};color:#6f7a76">Creators Hub · ${esc(firstRoom.fullName)} · ${esc(firstRoom.dateLabel)}, ${esc(firstRoom.city)}</td></tr>
  </table>
</td></tr></table>
</body></html>`

  const text = [
    `You’re in the room, ${firstName}.`,
    '',
    `${firstRoom.fullName}`,
    `${firstRoom.dateLabel} · ${firstRoom.city}, ${firstRoom.country}`,
    '',
    `Ticket: ${order.quantity} × ${tier.name} (admits ${people})`,
    `Name: ${order.name}`,
    `Venue: ${venue}`,
    `Time: ${time}`,
    `Paid: ${paid}`,
    `Reference: ${order.txRef}`,
    '',
    `Your ticket and QR code: ${links.passUrl}`,
    'Show the QR code at the door.',
  ].join('\n')

  return { to: order.email, subject, html, text, idempotencyKey: `ticket-email-${order.txRef}` }
}
