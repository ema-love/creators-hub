import { describe, expect, it } from 'vitest'
import { eventJsonLd, organizationJsonLd, sitemapXml } from '../../seo.config'
import { renderPage, staticPages } from '../../prerender.config'
import { pageMeta } from '../../src/content/seo'

const SITE = 'https://thecreators-hub.netlify.app'
const TEMPLATE = `<html><head><title>x</title><meta name="description" content="x" /><meta property="og:title" content="x" /><meta property="og:description" content="x" /></head><body><div id="root"></div></body></html>`
const jsonLdIn = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => JSON.parse(m[1]!) as unknown[])

describe('search: titles and descriptions', () => {
  it('uses the agreed titles', () => {
    expect(pageMeta['/'].title).toBe("Creator's Hub · Turning idealists into builders · Lagos")
    expect(pageMeta['/the-first-room'].title).toBe("Creator's Hub 001: The First Room · 19 Dec 2026 · Lagos + online · Free")
    expect(pageMeta['/tickets'].title).toBe('Register free · The First Room, 19 Dec 2026, Lagos + online')
  })

  it.each(Object.entries(pageMeta))('%s: about 150 characters, with Lagos, 19 December 2026, free and young creatives', (_, m) => {
    expect(m.description.length).toBeGreaterThanOrEqual(140)
    expect(m.description.length).toBeLessThanOrEqual(160)
    expect(m.description).toMatch(/Lagos/)
    expect(m.description).toMatch(/19 December 2026/)
    expect(m.description).toMatch(/free/i)
    expect(m.description).toMatch(/young creatives/i)
  })
})

describe('search: structured data', () => {
  it('describes the event as specified', () => {
    expect(eventJsonLd(SITE)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: "Creator's Hub 001: The First Room",
      description:
        'A free one-day gathering in Lagos (and online) for young creatives in tech, art & design, fashion, and film & storytelling. Turning idealists into builders.',
      startDate: '2026-12-19T09:00:00+01:00',
      endDate: '2026-12-19T15:00:00+01:00',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      location: [
        { '@type': 'Place', name: 'Venue to be announced', address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' } },
        { '@type': 'VirtualLocation', url: `${SITE}/tickets` },
      ],
      image: `${SITE}/og-image.jpg`,
      organizer: { '@type': 'Organization', name: "Creator's Hub", url: SITE },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN',
        availability: 'https://schema.org/InStock',
        url: `${SITE}/tickets`,
        validFrom: '2026-11-01T00:00:00+01:00',
      },
    })
  })

  it('describes the organisation, with its profiles', () => {
    const [org] = organizationJsonLd(SITE) as Array<Record<string, unknown>>
    expect(org).toMatchObject({ '@type': 'Organization', name: "Creator's Hub", url: SITE, logo: `${SITE}/logo.png` })
    expect(org!.sameAs).toEqual([
      'https://www.instagram.com/creatorshubafrica/',
      'https://www.linkedin.com/company/creatorshubafrica',
      'https://whatsapp.com/channel/0029Vb9JcdRK5cDAX538aL1i',
    ])
  })

  it('names the founder and the team on the organisation', () => {
    const [org] = organizationJsonLd(SITE) as Array<Record<string, unknown>>
    expect(org!.founder).toEqual({
      '@type': 'Person',
      '@id': `${SITE}/team/erioluwa-akintayo#person`,
      name: 'Erioluwa Mercy Akintayo',
      alternateName: ['Ema', 'Erioluwa Akintayo', 'Ema Akintayo'],
      jobTitle: 'Founder',
      url: `${SITE}/team/erioluwa-akintayo`,
      image: `${SITE}/team/erioluwa-akintayo.jpg`,
      sameAs: ['https://www.linkedin.com/in/erioluwa-akintayo-76449037a'],
    })
    expect(org!.member).toEqual([{ '@type': 'Person', name: 'Divine Kamsi Moses', jobTitle: 'Community Lead' }])
  })

  it('puts each page’s own data, title, description and text in the HTML Google receives', () => {
    const pages = Object.fromEntries(staticPages(SITE).map((p) => [p.path, renderPage(TEMPLATE, p, SITE)]))
    expect(jsonLdIn(pages['/']!).map((x) => (x as { '@type': string })['@type'])).toEqual(['Organization', 'WebSite'])
    for (const path of ['/the-first-room', '/tickets'] as const) {
      const html = pages[path]!
      expect(jsonLdIn(html).map((x) => (x as { '@type': string })['@type'])).toEqual(['Event'])
      expect(html).toContain(`<title>${pageMeta[path].title.replace(/&/g, '&amp;')}</title>`)
      expect(html).toContain(`<link rel="canonical" href="${SITE}${path}" />`)
    }
    expect(jsonLdIn(pages['/volunteer']!)).toEqual([])
    expect(pages['/']).toContain('Turning idealists into builders.')
    expect(pages['/the-first-room']).toContain('The four arms of The First Room')
    expect(pages['/tickets']).toContain('One registration per person')
    expect(pages['/team']).toContain('<title>The Team · Creator')
    expect(pages['/team']).toContain('Divine Kamsi Moses')
    expect(pages['/']).toContain('The team behind Creator’s Hub')
    const ema = pages['/team/erioluwa-akintayo']!
    expect(ema).toContain("<title>Erioluwa Mercy Akintayo (Ema) · Founder of Creator's Hub</title>")
    expect(ema).toContain('is the founder of Creator’s Hub')
    expect(ema).toContain(`<link rel="canonical" href="${SITE}/team/erioluwa-akintayo" />`)
    const [profile] = jsonLdIn(ema) as Array<Record<string, unknown>>
    expect(profile).toMatchObject({
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: 'Erioluwa Mercy Akintayo',
        jobTitle: 'Founder',
        worksFor: { '@type': 'Organization', name: "Creator's Hub" },
        sameAs: ['https://www.linkedin.com/in/erioluwa-akintayo-76449037a'],
      },
    })
  })

  it('dates the sitemap with each deploy', () => {
    const xml = sitemapXml(SITE, '2026-11-26')
    expect(xml.match(/<lastmod>2026-11-26<\/lastmod>/g)).toHaveLength(6)
    expect(xml).toContain(`<loc>${SITE}/team/erioluwa-akintayo</loc>`)
    expect(xml).toContain(`<loc>${SITE}/team</loc>`)
    expect(xml).toContain(`<loc>${SITE}/tickets</loc>`)
  })
})
