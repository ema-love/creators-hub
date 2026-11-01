import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Download, Maximize2, X } from 'lucide-react'
import type { TicketDesignId } from '../../content/ticketDesigns'
import type { TicketTierId } from '../../content/tickets'
import { cn } from '../../lib/cn'
import { QRCode } from './QRCode'
import { TicketDesign } from './TicketDesign'
import { downloadTicket } from './ticketDownload'

export type OwnedTicket = {
  id: string
  attendeeName: string
  category: TicketTierId
  design: TicketDesignId
  status: 'valid' | 'checked_in' | 'void'
  token: string
  checkedInAt: string | null
}

export const verifyUrlFor = (token: string) => `${window.location.origin}/v/${encodeURIComponent(token)}`

/**
 * A purchased ticket with its actions: enlarge the QR for scanning,
 * download as a high-resolution PNG. Marked for printing.
 */
export function TicketCard({ ticket, className }: { ticket: OwnedTicket; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(false)
  const qrValue = verifyUrlFor(ticket.token)

  const download = async () => {
    if (!svgRef.current) return
    setBusy(true)
    setError('')
    try {
      await downloadTicket(svgRef.current, `${ticket.id}-creators-hub-001.png`)
    } catch {
      setError('Download didn’t work in this browser. Use Print instead, or screenshot the ticket.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <figure className={cn('print-ticket w-full max-w-[360px]', className)}>
      <div className="relative">
        <TicketDesign
          svgRef={svgRef}
          design={ticket.design}
          category={ticket.category}
          attendeeName={ticket.attendeeName}
          ticketId={ticket.id}
          qrValue={qrValue}
          className="drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]"
        />
        {ticket.status === 'checked_in' && (
          <span className="absolute left-3 top-[45%] rotate-[-8deg] rounded-md border-2 border-electric px-3 py-1 font-display text-lg font-semibold uppercase tracking-wider text-electric print:hidden">
            Checked in
          </span>
        )}
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2.5 text-sm hover:border-cream"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" /> Show QR for scanning
        </button>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-sm font-medium text-ink hover:bg-electric disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden="true" /> {busy ? 'Preparing…' : 'Download'}
        </button>
        {error && (
          <p role="alert" className="w-full text-center text-sm text-rust">
            {error}
          </p>
        )}
      </figcaption>

      <AnimatePresence>
        {zoom && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`QR code for ${ticket.id}`}
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-ink/95 p-6 print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
          >
            <div className="w-full max-w-sm rounded-[20px] bg-[#E4DCD0] p-5">
              <svg viewBox="0 0 52 52" className="block h-auto w-full">
                <QRCode value={qrValue} x={0} y={0} size={52} />
              </svg>
            </div>
            <p className="text-center text-cream">
              <span className="block font-display text-xl">{ticket.attendeeName}</span>
              <span className="mt-1 block font-mono text-sm text-cream/70">{ticket.id}</span>
            </p>
            <button type="button" autoFocus className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-5 py-2.5 text-sm">
              <X className="h-4 w-4" aria-hidden="true" /> Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </figure>
  )
}

/** Grid of an order's tickets, with Print for the whole set. */
export function TicketList({ tickets }: { tickets: OwnedTicket[] }) {
  return (
    <div className="print-area">
      <div className="flex flex-wrap justify-center gap-12">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
      <div className="mt-10 flex justify-center print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="link-draw text-sm text-cream/70 hover:text-cream"
        >
          Print {tickets.length === 1 ? 'ticket' : `all ${tickets.length} tickets`}
        </button>
      </div>
    </div>
  )
}
