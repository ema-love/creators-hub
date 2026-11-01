import QRCode from 'qrcode'
import { siteOrigin, ticketVerifyUrl } from '../lib/http'
import { blobKv } from '../lib/kv'
import { findTicketSlot } from '../lib/tickets'

/**
 * GET /.netlify/functions/ticket-qr?t=<token>
 * PNG QR code for a ticket (used in emails). Only issued tickets have one.
 */
export default async (req: Request) => {
  const token = new URL(req.url).searchParams.get('t') ?? ''
  if (!token || !(await findTicketSlot(blobKv('tickets'), { token }))) return new Response('Not found', { status: 404 })

  const png = await QRCode.toBuffer(ticketVerifyUrl(siteOrigin(req), token), {
    width: 480,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#1A1714', light: '#E4DCD0' },
  })
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, max-age=86400' },
  })
}
