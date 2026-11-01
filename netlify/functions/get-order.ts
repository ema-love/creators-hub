import { timingSafeEqual } from 'node:crypto'
import { tierById } from '../../src/content/tickets'
import { ownerView } from '../lib/fulfil'
import { json } from '../lib/http'
import { blobKv } from '../lib/kv'
import { blobOrderStore } from '../lib/orders'
import { ticketsForOrder } from '../lib/tickets'

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/**
 * GET /.netlify/functions/get-order?ref=…&k=…
 * The buyer's private "your tickets" link (sent by email). `k` is the order's secret access key.
 */
export default async (req: Request) => {
  const params = new URL(req.url).searchParams
  const ref = params.get('ref') ?? ''
  const key = params.get('k') ?? ''
  const order = ref ? await blobOrderStore().get(ref) : null
  if (!order || !key || !same(key, order.accessKey)) return json({ error: 'We couldn’t find those tickets.' }, 404)
  if (order.status !== 'paid') return json({ state: order.status })

  const tickets = await ticketsForOrder(blobKv('tickets'), order)
  return json({
    state: 'paid',
    order: { reference: order.txRef, tier: tierById(order.tier).name, quantity: order.quantity, name: order.name },
    tickets: tickets.map(ownerView),
  })
}
