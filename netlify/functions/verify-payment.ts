import { tierById } from '../../src/content/tickets'
import { confirmOrder } from '../lib/confirm'
import { createFlutterwave } from '../lib/flutterwave'
import { blobOrderStore } from '../lib/orders'
import { json, requireEnv } from '../lib/http'

/**
 * GET /.netlify/functions/verify-payment?tx_ref=…&transaction_id=…
 * Called by the confirmation page after Flutterwave redirects back.
 */
export default async (req: Request) => {
  const params = new URL(req.url).searchParams
  const txRef = params.get('tx_ref')
  if (!txRef) return json({ error: 'Missing payment reference.' }, 400)

  try {
    const result = await confirmOrder(blobOrderStore(), createFlutterwave(requireEnv('FLW_SECRET_KEY')), {
      txRef,
      transactionId: params.get('transaction_id'),
    })
    if (result.state === 'not_found') return json({ state: 'not_found' }, 404)

    const { order } = result
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
      },
    })
  } catch (err) {
    console.error('verify failed', err)
    return json({ error: 'We couldn’t check this payment right now.' }, 502)
  }
}
