import type { Flutterwave, FlwTransaction } from './flutterwave'
import type { Order, OrderStore } from './orders'

export type Confirmation =
  | { state: 'paid'; order: Order }
  | { state: 'pending'; order: Order }
  | { state: 'failed'; order: Order; reason: string }
  | { state: 'not_found' }

/**
 * Confirms an order against Flutterwave. A ticket is only marked paid when
 * Flutterwave reports the transaction successful AND its reference, currency
 * and amount match the order we created. Safe to call repeatedly.
 */
export async function confirmOrder(
  store: OrderStore,
  flw: Flutterwave,
  { txRef, transactionId }: { txRef: string; transactionId?: string | null },
  now = new Date(),
): Promise<Confirmation> {
  const order = await store.get(txRef)
  if (!order) return { state: 'not_found' }
  if (order.status === 'paid') return { state: 'paid', order }

  let tx: FlwTransaction
  try {
    tx = transactionId ? await flw.verifyTransaction(transactionId) : await flw.verifyByReference(txRef)
  } catch {
    // Not found yet, or Flutterwave unreachable: leave the order as it is.
    return { state: 'pending', order }
  }

  if (tx.tx_ref !== order.txRef) return { state: 'failed', order, reason: 'Payment reference does not match this order.' }

  if (tx.status === 'successful') {
    if (tx.currency !== order.currency || tx.amount < order.amount) {
      return { state: 'failed', order, reason: 'Payment amount does not match this order.' }
    }
    const paid: Order = { ...order, status: 'paid', paidAt: now.toISOString(), transactionId: String(tx.id) }
    await store.save(paid)
    return { state: 'paid', order: paid }
  }

  if (tx.status === 'failed') {
    const failed: Order = { ...order, status: 'failed', transactionId: String(tx.id) }
    await store.save(failed)
    return { state: 'failed', order: failed, reason: 'The payment did not go through.' }
  }

  return { state: 'pending', order }
}
