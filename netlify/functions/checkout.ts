import { createFlutterwave } from '../lib/flutterwave'
import { createOrder, parseCheckout, paymentRequestFor } from '../lib/checkout'
import { blobOrderStore } from '../lib/orders'
import { json, requireEnv } from '../lib/http'

/**
 * POST /.netlify/functions/checkout
 * Body: { tier, quantity, name, email, phone }
 * Creates a pending order and returns a Flutterwave checkout link.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const parsed = parseCheckout(await req.json().catch(() => null))
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status)

  try {
    const flw = createFlutterwave(requireEnv('FLW_SECRET_KEY'))
    const order = createOrder(parsed.value)
    await blobOrderStore().save(order)
    const link = await flw.createPayment(paymentRequestFor(order, new URL(req.url).origin))
    return json({ link, reference: order.txRef })
  } catch (err) {
    console.error('checkout failed', err)
    return json({ error: 'We couldn’t start the payment. Please try again in a moment.' }, 502)
  }
}
