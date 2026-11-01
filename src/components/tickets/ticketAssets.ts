import '@fontsource-variable/eb-garamond'
import '@fontsource-variable/montserrat'
import garamondWoff2 from '@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-normal.woff2?url'
import montserratWoff2 from '@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2?url'
import fashion from '../../assets/tickets/fashion.webp'
import artdesign from '../../assets/tickets/artdesign.webp'
import technology from '../../assets/tickets/technology.webp'
import film from '../../assets/tickets/film.webp'
import type { TicketDesignId } from '../../content/ticketDesigns'

/** Photography for each ticket design (text removed, so it can be set live). */
export const ticketPhotos: Record<TicketDesignId, string> = { fashion, artdesign, technology, film }

export const TICKET_SERIF = 'EB Garamond Variable'
export const TICKET_SANS = 'Montserrat Variable'

/** Font files, embedded into downloaded tickets so they render identically. */
export const ticketFontFiles = [
  { family: TICKET_SERIF, url: garamondWoff2 },
  { family: TICKET_SANS, url: montserratWoff2 },
]
