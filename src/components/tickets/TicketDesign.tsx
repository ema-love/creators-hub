import { useId } from 'react'
import { categoryStyle, designById, EVENT_TAGLINE, type TicketDesignId } from '../../content/ticketDesigns'
import type { TicketTierId } from '../../content/tickets'
import { cn } from '../../lib/cn'
import { fitFontSize, useFontsReady } from './fitText'
import { TicketAttendeeSection } from './TicketAttendeeSection'
import { TICKET_SANS, TICKET_SERIF, ticketPhotos } from './ticketAssets'

export type TicketDesignProps = {
  design: TicketDesignId
  category: TicketTierId
  attendeeName: string
  ticketId: string
  qrValue: string | null
  className?: string
  svgRef?: React.Ref<SVGSVGElement>
}

const W = 264
const H = 455
const CREAM = '#F7F3EA'
const NOTCH_Y = 364
const NOTCH_R = 8.5
const CORNER = 11

/** Ticket outline: rounded corners, with tear-off notches where the stub meets the artwork. */
const OUTLINE = [
  `M${CORNER} 0H${W - CORNER}A${CORNER} ${CORNER} 0 0 1 ${W} ${CORNER}`,
  `V${NOTCH_Y - NOTCH_R}A${NOTCH_R} ${NOTCH_R} 0 0 0 ${W} ${NOTCH_Y + NOTCH_R}`,
  `V${H - CORNER}A${CORNER} ${CORNER} 0 0 1 ${W - CORNER} ${H}H${CORNER}A${CORNER} ${CORNER} 0 0 1 0 ${H - CORNER}`,
  `V${NOTCH_Y + NOTCH_R}A${NOTCH_R} ${NOTCH_R} 0 0 0 0 ${NOTCH_Y - NOTCH_R}V${CORNER}A${CORNER} ${CORNER} 0 0 1 ${CORNER} 0Z`,
].join('')

/**
 * Creators Hub 001 digital ticket, recreated from the approved reference.
 * One shared layout; each creative arm supplies its photograph, title and
 * rule colour. Layout coordinates are in the reference's 264 × 455 px space.
 */
export function TicketDesign({ design, category, attendeeName, ticketId, qrValue, className, svgRef }: TicketDesignProps) {
  useFontsReady()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const spec = designById(design)
  const cat = categoryStyle[category]
  const twoLine = spec.title.length > 1
  const titleSize = Math.min(...spec.title.map((line) => fitFontSize(line, TICKET_SERIF, 400, twoLine ? 31 : 32, 210, 22)))
  const titleBaselines = twoLine ? [237.5, 267] : [258.3]
  const shift = twoLine ? 2.5 : 0

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('block h-auto w-full', className)}
      role="img"
      aria-label={`${spec.name} ticket for ${attendeeName}, ${cat.label.toLowerCase()}, ${ticketId}. Creators Hub 001: The First Room, 19 December 2026, Lagos, Nigeria.`}
      style={{ fontVariantNumeric: 'lining-nums' }}
    >
      <defs>
        <clipPath id={`shape-${uid}`}>
          <path d={OUTLINE} />
        </clipPath>
      </defs>
      <g clipPath={`url(#shape-${uid})`}>
        <rect width={W} height={NOTCH_Y + 1} fill="#0B0C0B" />
        <image href={ticketPhotos[design]} x={0} y={0} width={W} height={NOTCH_Y + 1} preserveAspectRatio="xMidYMid slice" />

        {/* Wordmark and edition */}
        <text fontFamily={TICKET_SERIF} fontWeight={500} fontSize={14.6} fill={CREAM} letterSpacing="-0.01em">
          <tspan x={20.5} y={41.7}>CREATORS</tspan>
          <tspan x={20.5} y={55}>HUB</tspan>
        </text>
        <rect x={21} y={63.4} width={44} height={1.3} fill={spec.rule} />
        <text x={243} y={41.7} textAnchor="end" fontFamily={TICKET_SERIF} fontWeight={500} fontSize={14.6} fill={CREAM}>
          001
        </text>

        {/* Discipline title, event and tagline */}
        <text fontFamily={TICKET_SERIF} fontWeight={400} fontSize={titleSize} fill={CREAM} letterSpacing="0.005em">
          {spec.title.map((line, i) => (
            <tspan key={line} x={20} y={titleBaselines[i]}>
              {line}
            </tspan>
          ))}
        </text>
        <text x={20} y={291.7 + shift} fontFamily={TICKET_SERIF} fontWeight={400} fontSize={18} fill={CREAM}>
          THE FIRST ROOM.
        </text>
        <text x={20} y={308.2 + shift} fontFamily={TICKET_SERIF} fontWeight={400} fontSize={15.6} fill={CREAM} fillOpacity={0.92}>
          {EVENT_TAGLINE}
        </text>

        {/* Date, location and category */}
        <rect x={20} y={326.4} width={223} height={0.7} fill={CREAM} fillOpacity={0.22} />
        <rect x={132} y={326.8} width={0.7} height={NOTCH_Y - 326.8} fill={CREAM} fillOpacity={0.14} />
        <text fontFamily={TICKET_SANS} fontWeight={600} fontSize={9.6} letterSpacing="0.03em" fill={CREAM}>
          <tspan x={20} y={342.3}>19 DEC 2026</tspan>
          <tspan x={20} y={354.3}>LAGOS, NIGERIA</tspan>
        </text>
        <text x={243} y={350} textAnchor="end" fontFamily={TICKET_SANS} fontWeight={700} fontSize={9.7} letterSpacing="0.07em" fill={cat.color}>
          {cat.label}
        </text>

        <TicketAttendeeSection attendeeName={attendeeName} ticketId={ticketId} qrValue={qrValue} />
      </g>
      <path d={OUTLINE} fill="none" stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={0.8} />
    </svg>
  )
}
