import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { firstRoom } from './src/content/event.ts'
import { disciplines } from './src/content/site.ts'
import { founding, mission, oath, philosophy, pillars, problem, roadmap } from './src/content/founding.ts'
import { registrationCopy } from './src/content/tickets.ts'
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

type Page = { path: string; title: string; description: string; body: string }

const when = `${firstRoom.dateLabel} · ${firstRoom.timeRange} · ${firstRoom.city}, ${firstRoom.country}, and online`
const venue = `Venue: ${firstRoom.venue ?? 'to be announced'}`
const nav = `<nav aria-label="Pages"><a href="/">Home</a> · <a href="/the-first-room">Creators Hub 001: The First Room</a> · <a href="/tickets">Free registration</a> · <a href="/volunteer">Volunteer</a></nav>`
const arms = `<ul>${disciplines.map((d) => `<li><strong>${esc(d.name)}</strong>: ${esc(d.line)}</li>`).join('')}</ul>`

export function staticPages(): Page[] {
  return [
    {
      path: '/',
      title: 'Creators Hub · The First Room · Lagos & online · 19 Dec 2026',
      description: `Creators Hub is a pan-African ecosystem where young thinkers get the education, community and creative space to turn their own ideas into reality. Register free for ${firstRoom.fullName}, ${firstRoom.dateLabel}, ${firstRoom.timeRange}, in Lagos or online.`,
      body: `<h1>Creators Hub</h1>
<p>${esc(founding.eyebrow)}</p>
<p><strong>${esc(founding.headline.join(' '))}</strong> ${esc(founding.statement)}</p>
<h2>${esc(mission.title.join(' '))}</h2>
<p><strong>Mission:</strong> ${esc(mission.mission)}</p>
<p><strong>Vision:</strong> ${esc(mission.vision)}</p>
<h2>${esc(problem.title.join(' '))}</h2>
<ul>${problem.items.map((i) => `<li><strong>${esc(i.title)}</strong>: ${esc(i.body)}</li>`).join('')}</ul>
<h2>${esc(pillars.title.join(' '))} The four pillars</h2>
<ul>${pillars.items.map((i) => `<li><strong>${esc(i.title)}</strong>: ${esc(i.body)}</li>`).join('')}</ul>
<h2>${esc(philosophy.title.join(' '))}</h2>
<ul>${philosophy.shifts.map((s) => `<li>“${esc(s.from)}” → ${esc(s.to)}</li>`).join('')}</ul>
<h2>${esc(roadmap.title.join(' '))}</h2>
<ol>${roadmap.phases.map((p) => `<li><strong>${esc(p.phase)} · ${esc(p.when)} · ${esc(p.where)}: ${esc(p.title)}</strong>. ${esc(p.body)}</li>`).join('')}</ol>
<h2>${esc(oath.eyebrow)}</h2>
<blockquote><p>${esc(oath.before)} ${esc(oath.highlight)} ${esc(oath.after)}</p><p>${esc(oath.signature)}</p></blockquote>
<h2>${esc(firstRoom.fullName)}</h2>
<p>The first Creators Hub event. ${esc(firstRoom.direction)} ${esc(firstRoom.intro)}</p>
<p>${esc(when)}. ${esc(venue)}.</p>
<p><a href="/tickets">Register free for ${esc(firstRoom.fullName)}</a> · <a href="/volunteer">Volunteer</a></p>`,
    },
    {
      path: '/the-first-room',
      title: `${firstRoom.fullName} · Sat 19 Dec 2026, Lagos & online`,
      description: `${firstRoom.fullName}: ${firstRoom.dateLabel}, ${firstRoom.timeRange}, in ${firstRoom.city}, ${firstRoom.country} and online. ${firstRoom.direction} Free registration.`,
      body: `<h1>${esc(firstRoom.fullName)}</h1>
<p>The inaugural Creators Hub event. ${esc(firstRoom.direction)} ${esc(firstRoom.intro)}</p>
<dl><dt>Date</dt><dd>${esc(firstRoom.dateLabel)}</dd><dt>Time</dt><dd>${esc(firstRoom.timeRange)}</dd><dt>Where</dt><dd>${esc(firstRoom.city)}, ${esc(firstRoom.country)}, and online from anywhere</dd><dt>Venue</dt><dd>${esc(firstRoom.venue ?? 'To be announced')}</dd><dt>Entry</dt><dd>Free, one registration per person</dd></dl>
<h2>The four arms</h2>${arms}
<p><a href="/tickets">Register free for ${esc(firstRoom.fullName)}</a></p>`,
    },
    {
      path: '/tickets',
      title: `Free registration · ${firstRoom.fullName}`,
      description: `Register free for ${firstRoom.fullName}, ${firstRoom.dateLabel}, ${firstRoom.timeRange}. Join in ${firstRoom.city} or online. One registration per person.`,
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
      for (const page of staticPages()) {
        // the-first-room.html, not the-first-room/index.html: Netlify serves it at /the-first-room with no redirect.
        const file = page.path === '/' ? indexFile : path.join(outDir, `${page.path.slice(1)}.html`)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, renderPage(template, page, site))
      }
    },
  }
}
