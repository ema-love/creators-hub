import { designById, ticketDesigns, type TicketDesignId } from '../../src/content/ticketDesigns'
import type { TicketTierId } from '../../src/content/tickets'
import type { Kv } from './kv'
import { withCheckIn, type Ticket } from './tickets'

type Count = { issued: number; checkedIn: number }

export type StaffSummary = {
  totals: Count
  byCategory: Record<TicketTierId, Count>
  byDesign: Array<{ id: TicketDesignId; name: string } & Count>
  recent: Array<{ id: string; attendeeName: string; design: TicketDesignId; category: TicketTierId; checkedInAt: string }>
  generatedAt: string
}

const zero = (): Count => ({ issued: 0, checkedIn: 0 })

/** Door and sales numbers for the staff Overview. Void tickets are left out. */
export async function staffSummary(kv: Kv, now = new Date()): Promise<StaffSummary> {
  const keys = await kv.list('slot/')
  const tickets: Ticket[] = []
  for (let i = 0; i < keys.length; i += 25) {
    const batch = await Promise.all(keys.slice(i, i + 25).map((k) => kv.get<Ticket>(k)))
    for (const t of batch) if (t && t.status !== 'void') tickets.push(await withCheckIn(kv, t))
  }

  const totals = zero()
  const byCategory: Record<TicketTierId, Count> = { regular: zero(), premium: zero() }
  const byDesign = new Map<TicketDesignId, Count>(ticketDesigns.map((d) => [d.id, zero()]))
  for (const t of tickets) {
    const used = t.status === 'checked_in' ? 1 : 0
    for (const c of [totals, byCategory[t.category], byDesign.get(t.design)!]) {
      c.issued += 1
      c.checkedIn += used
    }
  }

  const recent = tickets
    .filter((t) => t.checkedInAt)
    .sort((a, b) => b.checkedInAt!.localeCompare(a.checkedInAt!))
    .slice(0, 12)
    .map((t) => ({ id: t.id, attendeeName: t.attendeeName, design: t.design, category: t.category, checkedInAt: t.checkedInAt! }))

  return {
    totals,
    byCategory,
    byDesign: ticketDesigns.map((d) => ({ id: d.id, name: designById(d.id).name, ...byDesign.get(d.id)! })),
    recent,
    generatedAt: now.toISOString(),
  }
}
