export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

/** Reads a required environment variable (set in Netlify → Environment variables). */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

/** Public site URL for links: Netlify's primary URL, else the request's origin. */
export function siteOrigin(req: Request): string {
  return process.env.URL || new URL(req.url).origin
}

/** Caller identity for rate limiting. */
export const clientId = (req: Request) => req.headers.get('x-nf-client-connection-ip') ?? 'unknown'

/** Short on purpose: the QR code encodes this, and shorter means bigger, easier-to-scan modules. */
export const ticketVerifyUrl = (origin: string, token: string) => `${origin}/v/${encodeURIComponent(token)}`
export const ticketQrUrl = (origin: string, token: string) => `${origin}/.netlify/functions/ticket-qr?t=${encodeURIComponent(token)}`
/** The attendee's private "your ticket" page. */
export const registrationUrl = (origin: string, ref: string, key: string) =>
  `${origin}/tickets/order?${new URLSearchParams({ ref, k: key })}`
