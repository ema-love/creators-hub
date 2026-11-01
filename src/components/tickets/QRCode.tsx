import { useMemo } from 'react'
import QR from 'qrcode'

type QRCodeProps = {
  value: string
  x: number
  y: number
  size: number
  color?: string
}

/**
 * Vector QR code for use inside an SVG. Stays sharp at any size, including
 * in downloaded and printed tickets. Quiet zone comes from the cream stub.
 */
export function QRCode({ value, x, y, size, color = '#1A1714' }: QRCodeProps) {
  const { path, count } = useMemo(() => {
    const qr = QR.create(value, { errorCorrectionLevel: 'M' })
    const n = qr.modules.size
    const d: string[] = []
    for (let row = 0; row < n; row++) {
      let run = 0
      for (let col = 0; col <= n; col++) {
        const dark = col < n && qr.modules.get(row, col)
        if (dark) run++
        if (!dark && run) {
          d.push(`M${col - run} ${row}h${run}v1h-${run}z`)
          run = 0
        }
      }
    }
    return { path: d.join(''), count: n }
  }, [value])

  return (
    <g transform={`translate(${x} ${y}) scale(${size / count})`} role="img" aria-label="Ticket QR code">
      <path d={path} fill={color} shapeRendering="crispEdges" />
    </g>
  )
}
