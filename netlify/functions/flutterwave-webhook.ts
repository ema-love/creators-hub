import { confirmOrder } from '../lib/confirm'
import { createFlutterwave, isAuthenticWebhook } from '../lib/flutterwave'
import { blobOrderStore } from '../lib/orders'
import { json, requireEnv } from '../lib/http'
import { ensureTicketEmailed } from '../lib/deliver'
import { deliveryConfig } from '../lib/delivery'

/**
 * POST /.netlify/functions/flutterwave-webhook
 * Set this URL as the webhook in the Flutterwave dashboard. It records
 * payments even when the buyer closes the tab before returning to the site.
 * The payload is never trusted on its own: each payment is re-verified.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!isAuthenticWebhook(req.headers.get('verif-hash'), process.env.FLW_SECRET_HASH ?? '')) {
    return json({ error: 'Unauthorised' }, 401)
  }

  const payload = (await req.json().catch(() => null)) as { event?: string; data?: { id?: number; tx_ref?: string } } | null
  const txRef = payload?.data?.tx_ref
  if (payload?.event !== 'charge.completed' || !txRef) return json({ received: true })

  try {
    const store = blobOrderStore()
    const result = await confirmOrder(store, createFlutterwave(requireEnv('FLW_SECRET_KEY')), {
      txRef,
      transactionId: payload.data?.id ? String(payload.data.id) : null,
    })
    if (result.state === 'paid') await ensureTicketEmailed(store, result.order, deliveryConfig(req))
    return json({ received: true, state: result.state })
  } catch (err) {
    console.error('webhook failed', err)
    // A non-2xx response makes Flutterwave retry later.
    return json({ error: 'Temporary failure' }, 500)
  }
}
