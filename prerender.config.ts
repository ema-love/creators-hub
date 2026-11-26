import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { firstRoom } from './src/content/event.ts'
import { disciplines } from './src/content/site.ts'
import { BRAND_PLAIN, EVENT_NAME, firstRoomSection, founderLine, heroCopy, howWeWork, manifesto, oath, whoWeAre } from './src/content/founding.ts'
import { registrationCopy } from './src/content/tickets.ts'
import { pageMeta } from './src/content/seo.ts'
import { profilePages, teamMembers, teamSection } from './src/content/team.ts'
import { eventJsonLd, jsonLdScript, organizationJsonLd, profileJsonLd } from './seo.config.ts'
import { experienceText, volunteerBenefits, volunteerIntro, volunteerTeams } from './src/content/volunteer.ts'

/**
 * Ready-made HTML for the public pages, written at build time.
 *
 * The site is built in the browser with JavaScript, so without this every
 * page reaches Google blank and with the same title. Each public page now has
 * its own file (dist/<page>.html) with its own title, description and
 * canonical link, and the page's real words inside #root. Visitors see the
 * full site as soon as the app starts, which replaces this content; Netlify
 * serves these files before the single-page fallback.
 */

const FALLBACK_ORIGIN = 'https://thecreators-hub.netlify.app'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type Page = { path: string; title: string; description: string; body: string; /** Structured data for this page only. */ jsonLd?: unknown[] }

const when = `${firstRoom.dateLabel} · ${firstRoom.timeRange} · ${firstRoom.city}, ${firstRoom.country}, and online`
const venue = `Venue: ${firstRoom.venue ?? 'to be announced'}`
const nav = `<nav aria-label="Pages"><a href="/">Home</a> · <a href="/the-first-room">${esc(EVENT_NAME)}</a> · <a href="/tickets">Free registration</a> · <a href="/volunteer">Volunteer</a> · <a href="/team">The team</a></nav>`
const arms = `<ul>${disciplines.map((d) => `<li><strong>${esc(d.name)}</strong>: ${esc(d.line)}</li>`).join('')}</ul>`

export function staticPages(site = FALLBACK_ORIGIN): Page[] {
  return [
    {
      path: '/',
      ...pageMeta['/'],
      jsonLd: organizationJsonLd(site),
      body: `<h1>${esc(BRAND_PLAIN)}</h1>
<p>${esc(heroCopy.eyebrow)}</p>
<p><strong>${esc(heroCopy.headline.join(' '))}</strong> ${esc(heroCopy.statement)}</p>
<p><a href="/tickets">${esc(heroCopy.primary.label)}</a> · <a href="/volunteer">${esc(heroCopy.secondary.label)}</a></p>
<h2>${esc(whoWeAre.title.join(' '))}</h2>
<p>${esc(whoWeAre.body)}</p>
<h2 id="manifesto">${esc(manifesto.title.join(' '))}</h2>
<ol>${manifesto.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>
<h2>${esc(howWeWork.eyebrow)}</h2>
<ol>${howWeWork.steps.map((s) => `<li><strong>${esc(s.title)}</strong>: ${esc(s.body)}</li>`).join('')}</ol>
<h2>${esc(teamSection.title.join(' '))}</h2>
<p>${esc(teamSection.intro)}</p>
<ul>${teamMembers.map((m) => `<li><strong>${esc(m.name)}</strong>, ${esc(m.role)}. ${esc(m.bio)}</li>`).join('')}</ul>
<h2>${esc(oath.eyebrow)}</h2>
<blockquote><p>${esc(oath.before)} ${esc(oath.highlight)} ${esc(oath.after)}</p><p>${esc(founderLine)}</p><p>${esc(oath.signature)}</p></blockquote>
<h2>${esc(EVENT_NAME)}: ${esc(firstRoomSection.title.join(' '))}</h2>
<p>${esc(firstRoomSection.body)}</p>
<h3>${esc(firstRoomSection.armsLabel)}</h3>
<ul>${firstRoomSection.arms.map((a) => `<li><strong>${esc(a.name)}</strong>: ${esc(a.body)}</li>`).join('')}</ul>
<p>${esc(firstRoomSection.after)}</p>
<p><a href="/tickets">${esc(firstRoomSection.cta.label)}</a></p>
<p>${esc(firstRoomSection.small)}</p>`,
    },
    {
      path: '/the-first-room',
      ...pageMeta['/the-first-room'],
      jsonLd: [eventJsonLd(site)],
      body: `<h1>${esc(EVENT_NAME)}</h1>
<p>The inaugural Creator’s Hub event. ${esc(firstRoom.direction)} ${esc(firstRoom.intro)}</p>
<dl><dt>Date</dt><dd>${esc(firstRoom.dateLabel)}</dd><dt>Time</dt><dd>${esc(firstRoom.timeRange)}</dd><dt>Where</dt><dd>${esc(firstRoom.city)}, ${esc(firstRoom.country)}, and online from anywhere</dd><dt>Venue</dt><dd>${esc(firstRoom.venue ?? 'To be announced')}</dd><dt>Entry</dt><dd>Free, one registration per person</dd></dl>
<h2>The four arms of The First Room</h2>${arms}
<p><a href="/tickets">Register free for ${esc(EVENT_NAME)}</a></p>`,
    },
    {
      path: '/tickets',
      ...pageMeta['/tickets'],
      jsonLd: [eventJsonLd(site)],
      body: `<h1>Free registration: ${esc(firstRoom.fullName)}</h1>
<p>${esc(registrationCopy.lede)}</p>
<ul>${registrationCopy.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
<p>${esc(when)}. ${esc(venue)}.</p>
<p>Enter your name and email, choose your creative arm (fashion, technology, film and storytelling, or arts and design), and choose how you’ll attend. In person, your QR ticket is issued straight away; online, you get an online pass and we email your joining link before the event.</p>`,
    },
    {
      path: '/volunteer',
      title: `Volunteer · ${firstRoom.fullName}`,
      description: `Volunteer at ${firstRoom.fullName}, ${firstRoom.dateCompact} in ${firstRoom.city} and online. Six teams: welcome, programme, media, online host, community and marketplace. Beginners welcome.`,
      body: `<h1>The Volunteer Collective · ${esc(firstRoom.fullName)}</h1>
<p>${esc(volunteerIntro.lede)} ${esc(volunteerIntro.body)}</p>
<h2>${esc(volunteerBenefits.eyebrow)}</h2>
<ul>${volunteerBenefits.items.map((b) => `<li>${esc(b.title)}</li>`).join('')}</ul>
${volunteerTeams
  .map(
    (t) =>
      `<h2>${esc(t.title)}${t.status === 'conditional' ? ' (subject to confirmation)' : ''}</h2><p>${esc(t.summary)} ${esc(t.duties.join(' '))}</p><p>${esc(
        [experienceText(t), ...(t.notes ?? [])].join(' · '),
      )}</p>`,
  )
  .join('\n')}
<p><a href="/volunteer#apply">Apply to volunteer</a></p>`,
    },
    {
      path: '/team',
      ...pageMeta['/team'],
      body: `<h1>${esc(teamSection.title.join(' '))}</h1>
<p>${esc(teamSection.intro)}</p>
<ul>${teamMembers
        .map(
          (m) =>
            `<li><strong>${m.profile ? `<a href="${esc(m.profile.path)}">${esc(m.name)}</a>` : esc(m.name)}</strong>, ${esc(m.role)}. ${esc(m.bio)}${m.linkedin ? ` <a href="${esc(m.linkedin)}">LinkedIn</a>` : ''}</li>`,
        )
        .join('')}</ul>`,
    },
    ...profilePages.map((m) => ({
      path: m.profile!.path,
      title: m.profile!.title,
      description: m.profile!.description,
      jsonLd: [profileJsonLd(m, site)],
      body: `<h1>${esc(m.name)}</h1>
<p>${esc(m.role)} · Creator’s Hub</p>
${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}, ${esc(m.role)} of Creator’s Hub" width="320" height="320" />` : ''}
<p>${esc(m.profile!.about)}</p>
${m.linkedin ? `<p><a href="${esc(m.linkedin)}" rel="me">${esc(m.shortName)} on LinkedIn</a></p>` : ''}
${m.founder ? `<h2>${esc(oath.eyebrow)}</h2><blockquote><p>${esc(oath.before)} ${esc(oath.highlight)} ${esc(oath.after)}</p><p>${esc(founderLine)}</p></blockquote>` : ''}
<p><a href="/team">Meet the team</a> · <a href="/">Creator’s Hub</a></p>`,
    })),
  ]
}

/** Puts one page's title, description, canonical link and content into the built index.html. */
export function renderPage(template: string, page: Page, site: string): string {
  const url = `${site}${page.path === '/' ? '/' : page.path}`
  const t = esc(page.title)
  const d = esc(page.description)
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${d}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${t}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${d}" />`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
  html = html.replace(
    '</head>',
    `<link rel="canonical" href="${url}" />
${(page.jsonLd ?? []).map(jsonLdScript).join('\n')}
<style>[data-prerendered] h1{font-size:2.4rem;line-height:1.1;margin:1.5rem 0 1rem}[data-prerendered] h2{font-size:1.4rem;margin:2rem 0 .5rem}[data-prerendered] p,[data-prerendered] ul,[data-prerendered] dl{margin:0 0 1rem}[data-prerendered] ul{padding-left:1.2rem;list-style:disc}[data-prerendered] dt{opacity:.6;font-size:.85rem;text-transform:uppercase;letter-spacing:.1em}[data-prerendered] dd{margin:0 0 .6rem}[data-prerendered] a{color:#00E5A0}</style>
</head>`,
  )
  const content = `<main data-prerendered style="max-width:760px;margin:0 auto;padding:96px 24px;font-family:system-ui,sans-serif;line-height:1.6;color:#F5F0E8;background:#0A0A0A">
${nav}
${page.body}
</main>`
  return html.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
}

export function prerender(): Plugin {
  let outDir = 'dist'
  return {
    name: 'creators-hub-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      if (process.env.VITE_PREVIEW) return
      const site = (process.env.URL || FALLBACK_ORIGIN).replace(/\/+$/, '')
      const indexFile = path.join(outDir, 'index.html')
      const template = fs.readFileSync(indexFile, 'utf8')
      // Blank shell for every other address (staff, tickets/order, …): see netlify.toml.
      fs.writeFileSync(path.join(outDir, 'app.html'), template)
      for (const page of staticPages(site)) {
        // the-first-room.html, not the-first-room/index.html: Netlify serves it at /the-first-room with no redirect.
        const file = page.path === '/' ? indexFile : path.join(outDir, `${page.path.slice(1)}.html`)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, renderPage(template, page, site))
      }
    },
  }
}
