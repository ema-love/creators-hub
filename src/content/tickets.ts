/**
 * Ticket tiers for Creators Hub 001: The First Room.
 *
 * This file is read by the website AND by the payment functions in
 * netlify/functions, so the price shown is always the price charged.
 *
 * Prices confirmed by Creators Hub: Regular ₦7,500, Premium ₦15,000.
 * `price` is in whole naira. Setting a tier's `price` to null takes it off
 * sale (it shows "Price to be announced" and the server refuses orders).
 */
export type TicketTierId = 'regular' | 'premium'

export type TicketTier = {
  id: TicketTierId
  name: string
  summary: string
  /** Confirmed inclusions. Null renders a "to be announced" placeholder. */
  perks: string[] | null
  /** Price per ticket in whole naira. Null = not on sale yet. */
  price: number | null
}

export const TICKET_CURRENCY = 'NGN'

/** Most tickets one order can hold. */
export const MAX_TICKETS_PER_ORDER = 10

export const ticketTiers: TicketTier[] = [
  {
    id: 'regular',
    name: 'Regular',
    summary: 'General admission to The First Room.',
    perks: ['General admission'],
    price: 7500,
  },
  {
    id: 'premium',
    name: 'Premium',
    summary: 'Full access to The First Room.',
    perks: ['Everything at The First Room included'],
    price: 15000,
  },
]

export const isTicketTierId = (value: unknown): value is TicketTierId =>
  ticketTiers.some((t) => t.id === value)

export const tierById = (id: TicketTierId) => ticketTiers.find((t) => t.id === id)!

export function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: TICKET_CURRENCY, maximumFractionDigits: 0 }).format(
    amount,
  )
}
