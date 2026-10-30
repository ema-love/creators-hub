import { firstRoom } from '../content/event'

/**
 * Builds an all-day .ics entry from confirmed event details only
 * (name, date, city). Times and venue are added once confirmed.
 */
export function firstRoomCalendarHref(): string {
  const start = firstRoom.dateISO.replaceAll('-', '')
  const endDate = new Date(`${firstRoom.dateISO}T00:00:00Z`)
  endDate.setUTCDate(endDate.getUTCDate() + 1)
  const end = endDate.toISOString().slice(0, 10).replaceAll('-', '')
  const location = [firstRoom.venue, `${firstRoom.city}, ${firstRoom.country}`].filter(Boolean).join(', ')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Creators Hub//The First Room//EN',
    'BEGIN:VEVENT',
    `UID:creators-hub-001-${start}@creatorshub`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${firstRoom.fullName}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${firstRoom.direction} Venue and times to be announced.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
