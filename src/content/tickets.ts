/**
 * Registration for Creator’s Hub 001: The First Room.
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
  lede: 'Join us in Lagos or online. Free. One registration per person.',
  points: ['Free to attend', 'In Lagos or online', 'One registration per person'],
  full: 'In-person places are full. You can still join online.',
  closed: 'Registration isn’t open right now. Check back soon.',
}

/** How someone will attend. */
export type Attendance = 'in_person' | 'online'
export const attendanceOptions: Array<{ id: Attendance; label: string; hint: string }> = [
  { id: 'in_person', label: 'In person, in Lagos', hint: 'Your QR ticket admits you at the door.' },
  { id: 'online', label: 'Online, from anywhere', hint: 'We’ll send your joining link before the event.' },
]
