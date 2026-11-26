import type { Plugin } from 'vite'
import { BRAND_PLAIN, brandSummary } from './src/content/founding.ts'
import { eventSeo, socialProfiles } from './src/content/seo.ts'
import { legalName, profilePages, teamMembers, type TeamMember } from './src/content/team.ts'
import { firstRoom } from './src/content/event.ts'

const EVENT_NAME_PLAIN = `${BRAND_PLAIN} 001: The First Room`

/**
 * Search engine setup, generated at build time:
 *  - robots.txt and sitemap.xml for the public pages
 *  - Google Search Console verification tag, from the GOOGLE_SITE_VERIFICATION
 *    environment variable (set in Netlify; the value is the `content` of the
 *    tag Search Console gives you)
 *  - structured data (JSON-LD) builders: Event and Organization, placed on
 *    their pages by prerender.config.ts
 *
 * The site address comes from Netlify's URL variable (your primary domain),
 * so a custom domain added later is picked up on the next deploy.
 */

const FALLBACK_ORIGIN = 'https://thecreators-hub.netlify.app'

/** Pages to list in the sitemap. Private pages (staff, tickets, orders) are left out on purpose. */
export const PUBLIC_PAGES = ['/', '/the-first-room', '/tickets', '/volunteer', '/team', ...profilePages.map((m) => m.profile!.path)]

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

/**
 * Google Event data for Creator's Hub 001: The First Room, on /the-first-room
 * and /tickets. When the venue is confirmed, set `venue` and `venueAddress` in
 * src/content/event.ts and it appears here on the next deploy.
 */
export function eventJsonLd(site = origin()) {
  const address: Record<string, string> = { '@type': 'PostalAddress', addressLocality: firstRoom.city, addressCountry: 'NG' }
  if (firstRoom.venueAddress) address.streetAddress = firstRoom.venueAddress
  // Speakers are added automatically once they are confirmed in src/content/event.ts.
  const performers = firstRoom.speakers.map((s) => ({ '@type': 'Person', name: s.name }))
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: eventSeo.name,
    description: eventSeo.description,
    startDate: toLagosTime(firstRoom.startUtc),
    ...(firstRoom.endUtc ? { endDate: toLagosTime(firstRoom.endUtc) } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    // In person in Lagos, plus a virtual option.
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: [
      { '@type': 'Place', name: firstRoom.venue ?? 'Venue to be announced', address },
      { '@type': 'VirtualLocation', url: `${site}/tickets` },
    ],
    image: `${site}/og-image.jpg`,
    organizer: { '@type': 'Organization', name: BRAND_PLAIN, url: site },
    ...(performers.length ? { performer: performers } : {}),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock',
      url: `${site}/tickets`,
      validFrom: eventSeo.offerValidFrom,
    },
  }
}

/** A team member as a schema.org Person. Their LinkedIn goes in sameAs once it is added in src/content/team.ts. */
const person = (m: TeamMember, site: string) => ({
  '@type': 'Person',
  ...(m.profile ? { '@id': `${site}${m.profile.path}#person` } : {}),
  name: legalName(m),
  ...(m.profile ? { alternateName: m.profile.alternateNames } : m.name.includes('(') ? { alternateName: m.name.match(/\((.*?)\)/)![1] } : {}),
  jobTitle: m.role,
  ...(m.profile ? { url: `${site}${m.profile.path}` } : {}),
  ...(m.photo ? { image: `${site}${m.photo}` } : {}),
  ...(m.linkedin ? { sameAs: [m.linkedin] } : {}),
})

/**
 * Google ProfilePage data for a team member's own page: a Person who is the
 * founder (or member) of Creator's Hub, linked to their LinkedIn, so their
 * name can show on Google with their role.
 */
export function profileJsonLd(m: TeamMember, site = origin()) {
  const p = m.profile!
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${site}${p.path}`,
    name: p.title,
    description: p.description,
    mainEntity: {
      ...person(m, site),
      description: p.about.replace(/’/g, "'"),
      worksFor: { '@type': 'Organization', name: BRAND_PLAIN, url: site },
    },
  }
}

/** Google Organization data for Creator's Hub (with its founder and team), on the homepage. */
export function organizationJsonLd(site = origin()) {
  const founder = teamMembers.find((m) => m.founder)
  const members = teamMembers.filter((m) => !m.founder)
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: BRAND_PLAIN,
      alternateName: ['Creators Hub'],
      url: site,
      logo: `${site}/logo.png`,
      description: brandSummary + ' Founded in Lagos, Nigeria, in 2026.',
      sameAs: socialProfiles,
      ...(founder ? { founder: person(founder, site) } : {}),
      ...(members.length ? { member: members.map((m) => person(m, site)) } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BRAND_PLAIN,
      alternateName: ['Creators Hub'],
      url: `${site}/`,
    },
  ]
}

/** A JSON-LD script tag. `<` is escaped so the JSON can never close the tag. */
export const jsonLdScript = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

export function seo(): Plugin {
  return {
    name: 'creators-hub-seo',
    apply: 'build',
    transformIndexHtml() {
      // Structured data is added per page by prerender.config.ts (Organization on the
      // homepage, Event on /the-first-room and /tickets), not to every page.
      const tags: { tag: string; attrs?: Record<string, string>; children?: string; injectTo: 'head' }[] = []
      // Share image: social apps need an absolute URL.
      const site = origin()
      const og: Record<string, string> = {
        'og:image': `${site}/og-image.jpg`,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': `${EVENT_NAME_PLAIN}, ${firstRoom.dateLabel}, ${firstRoom.city}`,
        'og:url': `${site}/`,
        'og:site_name': BRAND_PLAIN,
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
