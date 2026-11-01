import { fitFontSize } from './fitText'
import { QRCode } from './QRCode'
import { TICKET_SANS, TICKET_SERIF } from './ticketAssets'

const STUB = '#E4DCD0'
const LABEL = '#46413A'
const NAME = '#2C2720'

type Props = {
  attendeeName: string
  ticketId: string
  /** What the QR code encodes. Null shows the placeholder used in previews. */
  qrValue: string | null
}

/**
 * The cream, tear-off attendee stub: label, name, ticket ID and QR code.
 * Coordinates are in the ticket's 264 × 455 reference space.
 */
const NAME_MAX_WIDTH = 160

/** Very long names wrap onto two lines rather than shrinking past legibility. */
function nameLines(name: string): { lines: string[]; size: number } {
  const single = fitFontSize(name, TICKET_SERIF, 500, 17, NAME_MAX_WIDTH, 10)
  const words = name.split(' ')
  if (single >= 11.5 || words.length < 2) return { lines: [name], size: single }
  let best = { lines: [name], size: single }
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
    const size = Math.min(13, ...lines.map((l) => fitFontSize(l, TICKET_SERIF, 500, 13, NAME_MAX_WIDTH, 8)))
    if (size > best.size) best = { lines, size }
  }
  return best
}

export function TicketAttendeeSection({ attendeeName, ticketId, qrValue }: Props) {
  const name = nameLines(attendeeName)
  const baselines = name.lines.length > 1 ? [405.5, 418] : [413.5]
  return (
    <g>
      <rect x={0} y={364} width={264} height={91} fill={STUB} />
      <text x={20} y={392.5} fontFamily={TICKET_SANS} fontWeight={600} fontSize={9.3} letterSpacing="0.14em" fill={LABEL}>
        ATTENDEE
      </text>
      <text fontFamily={TICKET_SERIF} fontWeight={500} fontSize={name.size} fill={NAME}>
        {name.lines.map((line, i) => (
          <tspan key={i} x={20} y={baselines[i]}>
            {line}
          </tspan>
        ))}
      </text>
      <text x={20} y={434.3} fontFamily={TICKET_SANS} fontWeight={600} fontSize={9.6} letterSpacing="0.05em" fill={LABEL}>
        {ticketId}
      </text>
      {qrValue ? (
        <QRCode value={qrValue} x={191} y={383} size={52} />
      ) : (
        <g>
          <rect x={191.5} y={383.5} width={51} height={51} rx={3} fill="none" stroke={LABEL} strokeOpacity={0.45} strokeDasharray="3 2.5" />
          <text x={217} y={406} textAnchor="middle" fontFamily={TICKET_SANS} fontWeight={600} fontSize={5.4} letterSpacing="0.08em" fill={LABEL}>
            <tspan x={217}>QR CODE</tspan>
            <tspan x={217} dy={7.5}>AFTER PAYMENT</tspan>
          </text>
        </g>
      )}
    </g>
  )
}
