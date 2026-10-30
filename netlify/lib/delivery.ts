import { createResendMailer } from './email'
import { ticketConfig } from './http'
import { siteOrigin } from './ticketLinks'
import type { DeliveryConfig } from './deliver'

/** Builds the delivery settings for the current request from environment variables. */
export function deliveryConfig(req: Request): DeliveryConfig {
  const { signingSecret, resendKey, from } = ticketConfig()
  return {
    signingSecret,
    siteOrigin: siteOrigin(req),
    mailer: signingSecret && resendKey && from ? createResendMailer(resendKey, from) : null,
  }
}
