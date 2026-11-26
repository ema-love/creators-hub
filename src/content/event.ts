/**
 * Creator’s Hub 001: The First Room.
 *
 * Confirmed: name, date, time, city, the online option and direction.
 * Anything set to `null` is unconfirmed and renders as a labelled placeholder.
 * Do not fill these in without approval from the Creator’s Hub team.
 */
export const firstRoom = {
  edition: '001',
  name: 'The First Room',
  fullName: 'Creator’s Hub 001: The First Room',
  dateISO: '2026-12-19',
  dateLabel: 'Saturday 19 December 2026',
  /** Compact form for tight spaces. */
  dateCompact: 'Sat 19 Dec',
  dateShort: '19.12.26',
  city: 'Lagos',
  country: 'Nigeria',
  direction:
    'A multidisciplinary conference bringing together people across fashion, technology, film and storytelling, arts and design.',
  intro:
    'The inaugural Creator’s Hub gathering. One day, one room, every discipline at the same table.',

  /** Confirmed: 9:00 AM to 3:00 PM West Africa Time (UTC+1). */
  time: '9:00 AM',
  endTime: '3:00 PM',
  timeRange: '9:00 AM – 3:00 PM (WAT)',
  /** Compact form, e.g. for the online confirmation. */
  timeCompact: '9 AM–3 PM WAT',
  /** In person in Lagos, plus a virtual option. */
  online: true,
  formatLabel: 'In Lagos and online',
  startUtc: '2026-12-19T08:00:00Z',
  /** Free registration opened on the website. */
  registrationOpened: '2026-11-09T00:00:00+01:00',

  // ——— Unconfirmed: rendered as placeholders ———
  // Registration settings live in ./tickets.ts.
  venue: null as string | null,
  /** Street address once the venue is confirmed (shown to Google in the event data). */
  venueAddress: null as string | null,
  /** 3:00 PM in Lagos. */
  endUtc: '2026-12-19T14:00:00Z' as string | null,
  speakers: [] as Array<{ name: string; role: string }>,
  programme: [] as Array<{ time: string; title: string }>,
  partners: [] as Array<{ name: string }>,
}

export const firstRoomDetails = [
  { label: 'Date', value: firstRoom.dateLabel },
  { label: 'Where', value: `${firstRoom.city}, ${firstRoom.country} + online` },
  { label: 'Venue', value: firstRoom.venue },
  { label: 'Time', value: firstRoom.timeRange },
] as const
