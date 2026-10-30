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

  // ——— Unconfirmed: rendered as placeholders ———
  venue: null as string | null,
  time: null as string | null,
  tickets: null as { label: string; href: string } | null,
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
