/**
 * Creators Hub 001: The First Room.
 *
 * Only `name`, `date`, `location` and `direction` are confirmed.
 * Anything set to `null` is unconfirmed and renders as a labelled placeholder.
 * Do not fill these in without approval from the Creators Hub team.
 */
export const firstRoom = {
  edition: '001',
  name: 'The First Room',
  fullName: 'Creators Hub 001: The First Room',
  dateISO: '2026-12-19',
  dateLabel: '19 December 2026',
  dateShort: '19.12.26',
  city: 'Lagos',
  country: 'Nigeria',
  direction:
    'A multidisciplinary conference bringing together people across fashion, technology, film and storytelling, arts and design.',
  intro:
    'The inaugural Creators Hub gathering. One day, one room, every discipline at the same table.',

  /** Start time, confirmed: 9:00 AM West Africa Time (UTC+1). */
  time: '9:00 AM',
  startUtc: '2026-12-19T08:00:00Z',

  // ——— Unconfirmed: rendered as placeholders ———
  // Registration settings live in ./tickets.ts.
  venue: null as string | null,
  speakers: [] as Array<{ name: string; role: string }>,
  programme: [] as Array<{ time: string; title: string }>,
  partners: [] as Array<{ name: string }>,
}

export const firstRoomDetails = [
  { label: 'Date', value: firstRoom.dateLabel },
  { label: 'City', value: `${firstRoom.city}, ${firstRoom.country}` },
  { label: 'Venue', value: firstRoom.venue },
  { label: 'Time', value: firstRoom.time },
] as const
