import { createGmailMailer, createResendMailer, type Mailer } from './email'
import { siteOrigin } from './http'

/**
 * How confirmation emails are sent, from environment variables:
 *  - GMAIL_MAILER_URL + GMAIL_MAILER_KEY: the Creators Hub Gmail account
 *    (integrations/gmail-mailer/). No domain needed.
 *  - RESEND_API_KEY + TICKET_EMAIL_FROM: Resend, for a verified domain.
 * With neither, emails are off and attendees use their ticket page.
 */
export function mailerFromEnv(): Mailer | null {
  const gmailUrl = (process.env.GMAIL_MAILER_URL ?? '').trim()
  const gmailKey = (process.env.GMAIL_MAILER_KEY ?? '').trim()
  if (gmailUrl && gmailKey) return createGmailMailer(gmailUrl, gmailKey)

  const key = process.env.RESEND_API_KEY ?? ''
  const from = process.env.TICKET_EMAIL_FROM ?? ''
  if (key && from) return createResendMailer(key, from)

  console.warn('No email service is set up (GMAIL_MAILER_URL / GMAIL_MAILER_KEY): confirmation emails are off')
  return null
}

export const deliveryConfig = (req: Request) => ({
  mailer: mailerFromEnv(),
  siteOrigin: siteOrigin(req),
})
