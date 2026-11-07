import { firstRoom } from '../content/event'

const icsTime = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/**
 * Builds a calendar entry from confirmed details only: name, date, 9:00 AM
 * start (WAT) and city. No end time is set until one is confirmed; the venue
 * is added once announced.
 */
export function firstRoomCalendarHref(): string {
  const location = [firstRoom.venue, `${firstRoom.city}, ${firstRoom.country}`].filter(Boolean).join(', ')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Creators Hub//The First Room//EN',
    'BEGIN:VEVENT',
    `UID:creators-hub-001-${firstRoom.dateISO.replaceAll('-', '')}@creatorshub`,
    `DTSTAMP:${icsTime(new Date().toISOString())}`,
    `DTSTART:${icsTime(firstRoom.startUtc)}`,
    `SUMMARY:${firstRoom.fullName}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${firstRoom.direction} Starts ${firstRoom.time} (WAT). ${firstRoom.venue ? '' : 'Venue to be announced.'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
