import { Globe } from 'lucide-react'
import logoOnDark from '../../assets/brand/logo-on-dark.png'
import { firstRoom } from '../../content/event'
import { designById, type TicketDesignId } from '../../content/ticketDesigns'
import { cn } from '../../lib/cn'

/**
 * The online attendee's pass: no QR code (it isn't an entry ticket), clearly
 * labelled "Online pass". Same proportions and palette as the in-person ticket.
 */
export function OnlinePass({
  attendeeName,
  design,
  passId,
  location,
  className,
}: {
  attendeeName: string
  design: TicketDesignId | null
  passId: string
  location?: string | null
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-[264/455] w-full flex-col overflow-hidden rounded-[11px] bg-[#0E0F0E] text-cream shadow-[0_24px_40px_rgba(0,0,0,0.55)]',
        className,
      )}
      role="img"
      aria-label={`Online pass for ${attendeeName}, ${passId}. ${firstRoom.fullName}, ${firstRoom.dateLabel}, ${firstRoom.timeRange}, online.`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(80% 50% at 80% 0%, rgba(0,229,160,0.22), transparent 70%), radial-gradient(70% 45% at 0% 100%, rgba(26,74,58,0.7), transparent 70%)' }}
      />
      <div className="relative flex flex-1 flex-col p-[9%]">
        <img src={logoOnDark} alt="" className="h-auto w-[62%]" />
        <span className="mt-[12%] inline-flex items-center gap-2 self-start rounded-full bg-electric px-3 py-1 text-[0.65rem] font-semibold tracking-[0.16em] text-ink">
          <Globe className="h-3 w-3" aria-hidden="true" /> ONLINE PASS
        </span>
        <p className="mt-auto font-display text-[1.7rem] font-medium leading-[1.02] tracking-[-0.03em]">The First Room</p>
        <p className="mt-2 text-[0.72rem] leading-snug text-cream/70">
          {firstRoom.dateCompact} · {firstRoom.timeCompact}
          <br />
          Online, from anywhere
        </p>
      </div>
      <div className="relative bg-[#E4DCD0] px-[9%] py-[7%] text-[#2C2720]">
        <p className="text-[0.55rem] font-semibold tracking-[0.16em] text-[#57524A]">ATTENDEE</p>
        <p className="mt-1 truncate font-display text-lg leading-tight">{attendeeName}</p>
        <p className="mt-1 truncate text-[0.65rem] text-[#57524A]">
          {design ? designById(design).name : 'Creative arm'}
          {location ? ` · ${location}` : ''}
        </p>
        <p className="mt-2 text-[0.62rem] font-semibold tracking-[0.06em] text-[#57524A]">{passId}</p>
      </div>
    </div>
  )
}
