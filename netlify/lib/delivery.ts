import { createResendMailer, type Mailer } from './email'
import { siteOrigin } from './http'

/** Email settings from environment variables. Email is skipped (with a warning) until Resend is configured. */
export function mailerFromEnv(): Mailer | null {
  const key = process.env.RESEND_API_KEY ?? ''
  const from = process.env.TICKET_EMAIL_FROM ?? ''
  if (!key || !from) {
    console.warn('RESEND_API_KEY or TICKET_EMAIL_FROM is not set: ticket emails are disabled')
    return null
  }
  return createResendMailer(key, from)
}

/** NOTIFY_EMAIL: private organiser address for new-order alerts. Set only in Netlify's environment variables. */
export const deliveryConfig = (req: Request) => ({
  mailer: mailerFromEnv(),
  siteOrigin: siteOrigin(req),
  notifyTo: (process.env.NOTIFY_EMAIL ?? '').trim(),
})
