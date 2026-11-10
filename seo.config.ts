import type { Plugin } from 'vite'
import { firstRoom } from './src/content/event.ts'

/**
 * Search engine setup, generated at build time:
 *  - robots.txt and sitemap.xml for the public pages
 *  - Google Search Console verification tag, from the GOOGLE_SITE_VERIFICATION
 *    environment variable (set in Netlify; the value is the `content` of the
 *    tag Search Console gives you)
 *  - structured data so Google can show The First Room as an event
 *
 * The site address comes from Netlify's URL variable (your primary domain),
 * so a custom domain added later is picked up on the next deploy.
 */

const FALLBACK_ORIGIN = 'https://thecreators-hub.netlify.app'

/** Pages to list in the sitemap. Private pages (staff, tickets, orders) are left out on purpose. */
export const PUBLIC_PAGES = ['/', '/the-first-room', '/tickets', '/volunteer']

/** Kept out of search: personal tickets, orders and the staff area. */
export const PRIVATE_PATHS = ['/staff', '/admin', '/v/', '/tickets/order', '/tickets/confirmation', '/tickets/find', '/tickets/check-in', '/.netlify/']

const origin = () => (process.env.URL || FALLBACK_ORIGIN).replace(/\/+$/, '')

export function robotsTxt(site = origin()) {
  return ['User-agent: *', 'Allow: /', ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`), '', `Sitemap: ${site}/sitemap.xml`, ''].join('\n')
}

export function sitemapXml(site = origin(), lastmod = new Date().toISOString().slice(0, 10)) {
  const urls = PUBLIC_PAGES.map(
    (p) => `  <url>\n    <loc>${site}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/** 2026-12-19T08:00:00Z → 2026-12-19T09:00:00+01:00 (West Africa Time). */
const toLagosTime = (utc: string) => new Date(Date.parse(utc) + 3600_000).toISOString().replace(/\.\d{3}Z$/, '+01:00')

export function eventJsonLd(site = origin()) {
  // Free registration, one ticket per person.
  const offers = [
    {
      '@type': 'Offer',
      name: 'Free registration',
      price: '0',
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock',
      url: `${site}/tickets`,
      validFrom: firstRoom.registrationOpened,
    },
  ]
  // Speakers and the end time are added automatically once they are confirmed in src/content/event.ts.
  const performers = firstRoom.speakers.map((s) => ({ '@type': 'Person', name: s.name }))
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: firstRoom.fullName,
    description: firstRoom.direction,
    startDate: toLagosTime(firstRoom.startUtc),
    ...(firstRoom.endUtc ? { endDate: toLagosTime(firstRoom.endUtc) } : {}),
    image: [`${site}/og-image.jpg`],
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: firstRoom.venue ?? `Venue to be announced, ${firstRoom.city}`,
      address: { '@type': 'PostalAddress', addressLocality: firstRoom.city, addressCountry: 'NG' },
    },
    organizer: { '@type': 'Organization', name: 'Creators Hub', url: site },
    ...(performers.length ? { performer: performers } : {}),
    url: `${site}/the-first-room`,
    isAccessibleForFree: true,
    offers,
  }
}

export function seo(): Plugin {
  return {
    name: 'creators-hub-seo',
    apply: 'build',
    transformIndexHtml() {
      const tags: { tag: string; attrs?: Record<string, string>; children?: string; injectTo: 'head' }[] = [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // `<` is escaped so the JSON can never close the script tag.
          children: JSON.stringify(eventJsonLd()).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ]
      // Share image: social apps need an absolute URL.
      const site = origin()
      const og: Record<string, string> = {
        'og:image': `${site}/og-image.jpg`,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': `${firstRoom.fullName}, ${firstRoom.dateLabel}, ${firstRoom.city}`,
        'og:url': `${site}/`,
        'og:site_name': 'Creators Hub',
      }
      for (const [property, content] of Object.entries(og)) tags.push({ tag: 'meta', attrs: { property, content }, injectTo: 'head' })
      tags.push({ tag: 'meta', attrs: { name: 'twitter:image', content: `${site}/og-image.jpg` }, injectTo: 'head' })

      const verification = (process.env.GOOGLE_SITE_VERIFICATION ?? '').trim()
      if (verification) {
        // Accept either the bare code or the whole tag pasted from Search Console.
        const code = verification.match(/content=["']([^"']+)["']/)?.[1] ?? verification
        if (/^[A-Za-z0-9_-]+$/.test(code)) {
          tags.push({ tag: 'meta', attrs: { name: 'google-site-verification', content: code }, injectTo: 'head' })
        } else {
          console.warn('GOOGLE_SITE_VERIFICATION is not a valid code; skipping the verification tag.')
        }
      }
      return tags
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() })
    },
  }
}
