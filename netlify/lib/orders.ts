import { getStore } from '@netlify/blobs'
import type { TicketTierId } from '../../src/content/tickets'

export type OrderStatus = 'pending' | 'paid' | 'failed'

export type Order = {
  txRef: string
  status: OrderStatus
  tier: TicketTierId
  quantity: number
  unitPrice: number
  amount: number
  currency: string
  name: string
  email: string
  phone: string
  createdAt: string
  paidAt?: string
  transactionId?: string
}

export type OrderStore = {
  get(txRef: string): Promise<Order | null>
  save(order: Order): Promise<void>
}

/** Orders are kept in Netlify Blobs (store "ticket-orders"), keyed by payment reference. */
export function blobOrderStore(): OrderStore {
  const store = getStore({ name: 'ticket-orders', consistency: 'strong' })
  return {
    get: async (txRef) => (await store.get(txRef, { type: 'json' })) as Order | null,
    save: async (order) => {
      await store.setJSON(order.txRef, order)
    },
  }
}
