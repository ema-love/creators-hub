import { ticketFontFiles } from './ticketAssets'

const SCALE = 5 // 264 × 455 design → 1320 × 2275 px

const cache = new Map<string, Promise<string>>()

function toDataUrl(url: string): Promise<string> {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`Could not load ${url}`)
          return r.blob()
        })
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = () => reject(reader.error)
              reader.readAsDataURL(blob)
            }),
        ),
    )
  }
  return cache.get(url)!
}

/**
 * Turns a rendered ticket SVG into a self-contained SVG (fonts and photo
 * embedded), then rasterises it at high resolution. Text and the QR code
 * are vector, so they stay crisp and scannable.
 */
export async function renderTicketPng(svg: SVGSVGElement): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const width = 264 * SCALE
  const height = 455 * SCALE
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))

  for (const img of Array.from(clone.querySelectorAll('image'))) {
    const href = img.getAttribute('href')
    if (href && !href.startsWith('data:')) img.setAttribute('href', await toDataUrl(href))
  }
  const faces = await Promise.all(
    ticketFontFiles.map(
      async (f) => `@font-face{font-family:'${f.family}';src:url(${await toDataUrl(f.url)}) format('woff2');font-weight:100 900;}`,
    ),
  )
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = faces.join('')
  clone.insertBefore(style, clone.firstChild)

  const markup = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const image = new Image()
    image.decoding = 'sync'
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Could not render the ticket'))
      image.src = url
    })
    // Give embedded fonts a moment to apply inside the SVG image.
    await new Promise((r) => setTimeout(r, 120))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')!.drawImage(image, 0, 0, width, height)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image'))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function downloadTicket(svg: SVGSVGElement, filename: string) {
  const blob = await renderTicketPng(svg)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
