/**
 * Registration for Creators Hub 001: The First Room.
 *
 * Tickets are free. Each person registers for exactly one ticket, and an
 * email address can only be registered once.
 *
 * Overall capacity is set in Netlify with the EVENT_CAPACITY environment
 * variable (a number; leave it empty for no limit, or 0 to close
 * registration). This file is read by the website and the server.
 */

/** The single ticket type. Kept as a type so ticket records stay self-describing. */
export type TicketTierId = 'free'
export const TICKET_CATEGORY: TicketTierId = 'free'

export const registrationCopy = {
  eyebrow: 'Free registration',
  title: ['Claim your place', 'in the room.'],
  lede: 'Registration for The First Room is free. One ticket per person, and each email address can register once.',
  points: ['Free to attend', 'One ticket per person', 'Your own QR ticket, ready instantly'],
  full: 'Registration is full. Every place for The First Room has been claimed.',
  closed: 'Registration isn’t open right now. Check back soon.',
}
