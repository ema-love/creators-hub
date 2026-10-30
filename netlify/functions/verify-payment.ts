import { tierById } from '../../src/content/tickets'
import { confirmOrder } from '../lib/confirm'
import { createFlutterwave } from '../lib/flutterwave'
import { blobOrderStore } from '../lib/orders'
import { json, requireEnv } from '../lib/http'
import { ensureTicketEmailed } from '../lib/deliver'
import { deliveryConfig } from '../lib/delivery'
import { ticketLinks } from '../lib/ticketLinks'

/**
 * GET /.netlify/functions/verify-payment?tx_ref=…&transaction_id=…
 * Called by the confirmation page after Flutterwave redirects back.
 */
export default async (req: Request) => {
  const params = new URL(req.url).searchParams
  const txRef = params.get('tx_ref')
  if (!txRef) return json({ error: 'Missing payment reference.' }, 400)

  try {
    const store = blobOrderStore()
    const result = await confirmOrder(store, createFlutterwave(requireEnv('FLW_SECRET_KEY')), {
      txRef,
      transactionId: params.get('transaction_id'),
    })
    if (result.state === 'not_found') return json({ state: 'not_found' }, 404)

    const delivery = deliveryConfig(req)
    const order = result.state === 'paid' ? await ensureTicketEmailed(store, result.order, delivery) : result.order
    const links =
      result.state === 'paid' && delivery.signingSecret
        ? ticketLinks(delivery.siteOrigin, order.txRef, delivery.signingSecret)
        : null
    return json({
      state: result.state,
      reason: result.state === 'failed' ? result.reason : undefined,
      ticket: {
        reference: order.txRef,
        tier: tierById(order.tier).name,
        quantity: order.quantity,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        email: order.email,
        emailSent: Boolean(order.emailSentAt),
        passUrl: links?.passUrl ?? null,
        qrUrl: links?.qrUrl ?? null,
      },
    })
  } catch (err) {
    console.error('verify failed', err)
    return json({ error: 'We couldn’t check this payment right now.' }, 502)
  }
}
