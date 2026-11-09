import type { DisciplineId } from './site'
import type { TicketTierId } from './tickets'

/**
 * The four Creators Hub 001 ticket designs, one per creative arm.
 * Used by the website and the server, so it holds no image imports.
 * Artwork lives in src/assets/tickets/<id>.webp.
 */
export type TicketDesignId = DisciplineId

export type TicketDesignSpec = {
  id: TicketDesignId
  /** Letter used in ticket IDs, e.g. CH001-F-0001. */
  letter: 'F' | 'A' | 'T' | 'S'
  name: string
  /** Title lines as printed on the ticket. */
  title: string[]
  /** Colour of the short rule under the wordmark (sampled from the reference). */
  rule: string
}

export const ticketDesigns: TicketDesignSpec[] = [
  { id: 'fashion', letter: 'F', name: 'Fashion', title: ['FASHION'], rule: '#5E8C66' },
  { id: 'artdesign', letter: 'A', name: 'Arts & Design', title: ['ARTS & DESIGN'], rule: '#B98A5E' },
  { id: 'technology', letter: 'T', name: 'Technology', title: ['TECHNOLOGY'], rule: '#95B090' },
  { id: 'film', letter: 'S', name: 'Film & Storytelling', title: ['FILM &', 'STORYTELLING'], rule: '#A88D66' },
]

export const isTicketDesignId = (v: unknown): v is TicketDesignId => ticketDesigns.some((d) => d.id === v)
export const designById = (id: TicketDesignId) => ticketDesigns.find((d) => d.id === id)!

/** Printed category label and colour (sampled from the reference). Tickets are free and admit one person. */
export const categoryStyle: Record<TicketTierId, { label: string; color: string }> = {
  free: { label: 'ADMIT ONE', color: '#DCC583' },
}

export const EVENT_TAGLINE = 'Where creative worlds meet.'

/** CH001-F-0001 */
export const formatTicketId = (letter: string, n: number) => `CH001-${letter}-${String(n).padStart(4, '0')}`
