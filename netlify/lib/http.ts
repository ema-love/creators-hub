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

/** Ticket email and QR settings. Email is skipped (with a warning) until Resend is configured. */
export function ticketConfig() {
  const signingSecret = process.env.TICKET_SIGNING_SECRET ?? ''
  const resendKey = process.env.RESEND_API_KEY ?? ''
  const from = process.env.TICKET_EMAIL_FROM ?? ''
  if (!signingSecret) console.warn('TICKET_SIGNING_SECRET is not set: ticket QR codes and emails are disabled')
  else if (!resendKey || !from) console.warn('RESEND_API_KEY or TICKET_EMAIL_FROM is not set: ticket emails are disabled')
  return { signingSecret, resendKey, from }
}
