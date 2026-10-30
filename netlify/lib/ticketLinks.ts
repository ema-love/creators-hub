import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Each ticket has a signed link. The QR code encodes it, so a code can't be
 * forged by guessing an order reference. Signing uses TICKET_SIGNING_SECRET.
 */
export function signTicket(ref: string, secret: string): string {
  return createHmac('sha256', secret).update(`ticket:${ref}`).digest('base64url').slice(0, 22)
}

export function isValidTicketSignature(ref: string, sig: string | null, secret: string): boolean {
  if (!sig || !secret) return false
  const expected = Buffer.from(signTicket(ref, secret))
  const received = Buffer.from(sig)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export type TicketLinks = {
  /** The ticket pass page. Attendees show it; staff scan it to check in. */
  passUrl: string
  /** PNG of the QR code (encodes passUrl), for emails. */
  qrUrl: string
}

export function ticketLinks(siteOrigin: string, ref: string, secret: string): TicketLinks {
  const q = new URLSearchParams({ ref, sig: signTicket(ref, secret) })
  return {
    passUrl: `${siteOrigin}/tickets/pass?${q}`,
    qrUrl: `${siteOrigin}/.netlify/functions/ticket-qr?${q}`,
  }
}

/** Public site URL for links in emails: Netlify's primary URL, else the request's origin. */
export function siteOrigin(req: Request): string {
  return process.env.URL || new URL(req.url).origin
}
