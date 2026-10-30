import QRCode from 'qrcode'
import { isValidTicketSignature, ticketLinks, siteOrigin } from '../lib/ticketLinks'
import { ticketConfig } from '../lib/http'

/**
 * GET /.netlify/functions/ticket-qr?ref=…&sig=…
 * PNG QR code of the ticket's pass link, used in ticket emails and pages.
 */
export default async (req: Request) => {
  const params = new URL(req.url).searchParams
  const ref = params.get('ref') ?? ''
  const { signingSecret } = ticketConfig()
  if (!isValidTicketSignature(ref, params.get('sig'), signingSecret)) return new Response('Not found', { status: 404 })

  const png = await QRCode.toBuffer(ticketLinks(siteOrigin(req), ref, signingSecret).passUrl, {
    width: 480,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0A0A0A', light: '#F5F0E8' },
  })
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
