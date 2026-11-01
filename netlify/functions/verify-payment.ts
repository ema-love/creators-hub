import { tierById } from '../../src/content/tickets'
import { confirmOrder } from '../lib/confirm'
import { deliveryConfig } from '../lib/delivery'
import { createFlutterwave } from '../lib/flutterwave'
import { fulfilPaidOrder, ownerView } from '../lib/fulfil'
import { json, orderUrl, requireEnv } from '../lib/http'
import { blobKv } from '../lib/kv'
import { blobOrderStore } from '../lib/orders'

/**
 * GET /.netlify/functions/verify-payment?tx_ref=…&transaction_id=…
 * Called by the confirmation page after Flutterwave redirects back. Tickets
 * exist only once Flutterwave has confirmed the payment on the server.
 */
export default async (req: Request) => {
  const params = new URL(req.url).searchParams
  const txRef = params.get('tx_ref')
  if (!txRef) return json({ error: 'Missing payment reference.' }, 400)

  try {
    const orders = blobOrderStore()
    const result = await confirmOrder(orders, createFlutterwave(requireEnv('FLW_SECRET_KEY')), {
      txRef,
      transactionId: params.get('transaction_id'),
    })
    if (result.state === 'not_found') return json({ state: 'not_found' }, 404)

    const summary = (o: typeof result.order) => ({
      reference: o.txRef,
      tier: tierById(o.tier).name,
      quantity: o.quantity,
      amount: o.amount,
      currency: o.currency,
      name: o.name,
      email: o.email,
    })

    if (result.state !== 'paid') {
      return json({ state: result.state, reason: result.state === 'failed' ? result.reason : undefined, order: summary(result.order) })
    }

    const delivery = deliveryConfig(req)
    const { order, tickets } = await fulfilPaidOrder(orders, blobKv('tickets'), result.order, delivery)
    return json({
      state: 'paid',
      order: { ...summary(order), emailSent: Boolean(order.emailSentAt), url: orderUrl(delivery.siteOrigin, order.txRef, order.accessKey) },
      tickets: tickets.map(ownerView),
    })
  } catch (err) {
    console.error('verify failed', err)
    return json({ error: 'We couldn’t check this payment right now.' }, 502)
  }
}
