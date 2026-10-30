/**
 * Ticket tiers for Creators Hub 001: The First Room.
 *
 * This file is read by the website AND by the payment functions in
 * netlify/functions, so the price shown is always the price charged.
 *
 * Prices and perks have NOT been confirmed. While a tier's `price` is null
 * it shows "Price to be announced" and cannot be bought. To open sales, set
 * `price` (in naira, whole numbers) and replace `perks` with the confirmed
 * list, then redeploy.
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
    perks: null,
    price: null,
  },
  {
    id: 'premium',
    name: 'Premium',
    summary: 'An elevated First Room experience.',
    perks: null,
    price: null,
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
