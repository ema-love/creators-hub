# Creators Hub

Website for **Creators Hub**, a multidisciplinary creative organisation and community, and its inaugural event, **Creators Hub 001: The First Room** (19 December 2026, Lagos, Nigeria).

Built with React, TypeScript, Vite, Tailwind CSS v4, Motion for React, GSAP + ScrollTrigger, Lucide and React Router. Deployed on Netlify.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run lint
npm test           # registration and ticketing tests
```

Add `?intro` to any URL to force the opening sequence (it otherwise plays once per browser session, on the homepage only).

---

## Brand assets: what is still missing

The repository started empty. **No brand assets were supplied**, so the site uses clearly marked stand-ins. Nothing below is invented as final.

| Asset | Current state | Where to swap it in |
| --- | --- | --- |
| Official logo / wordmark | Organisation name set in Space Grotesk (not a logo) | `src/components/brand/Wordmark.tsx` (header, intro reveal and footer all render through it) |
| Favicon / app icon | Green "spark" dot | `public/favicon.svg` |
| Brand colours | Working references from the brief | `src/styles/index.css` `@theme` block (single source) |
| Typography | Space Grotesk (display) + Inter (body), self-hosted | `src/styles/index.css` + `package.json` fontsource packages |
| Discipline imagery | Photos cut from the supplied moodboards (see below) | `src/assets/crops/` + `src/content/disciplineStories.ts` |
| Intro sound | Synthesised with Web Audio (no files), off by default | `src/components/intro/introSound.ts` |
| Social share image (`og:image`) | Not set | `index.html` |
| Contact email, social handles | Rendered as `TBC` placeholders | `src/content/site.ts` → `contact` |
| Event venue, time, speakers, programme, tickets, partners | Rendered as `TBC` placeholders | `src/content/event.ts` |
| Organisational tagline | None assigned. Hero headline and other copy are working copy | `src/content/site.ts` |

Unconfirmed values are `null` or empty arrays in the content files. Components render `<Placeholder>` (a dashed `TBC` label) for them automatically. Filling in a value replaces the placeholder everywhere.

---

## Project structure

```
src/
  App.tsx                 Router, layout shell, intro overlay
  main.tsx
  styles/index.css        Tailwind v4 theme: colour, type scale, motion tokens
  content/                ALL copy and data (no copy hard-coded in components)
    site.ts               nav, hero, manifesto, sections, contact
    event.ts              The First Room (confirmed vs. unconfirmed fields)
    disciplineStories.ts  per-discipline photos, taglines, focus areas, alt text
    forms.ts              Netlify form names
  lib/
    motion.ts             easing/duration tokens: the motion language
    gsap.ts               GSAP + ScrollTrigger registration
    calendar.ts, date.ts, cn.ts
  hooks/                  media queries, GSAP context, header surface, Netlify forms
  components/
    brand/Wordmark.tsx    logo swap point
    intro/                cinematic opening (see below)
    layout/               Header, MobileMenu, Footer, Section, ScrollManager
    ui/                   ArrowLink, Reveal, MaskText, MediaFrame, Placeholder, Marquee, Eyebrow
    forms/Fields.tsx      editorial form fields
  sections/               one file per homepage section
  pages/                  HomePage, FirstRoomPage (/the-first-room), NotFoundPage
```

### Homepage sections

1. **Hero**: brand statement, pointer-following ambient light, link to the event, replay intro
2. **Manifesto**: words brighten as you read (GSAP scrub)
3. **What Creators Hub represents**: numbered editorial list with a sticky title
4. **Disciplines & ecosystem**: the four disciplines; choosing one brings its illustrated studio into view, with a small map showing its connections to the others
5. **The First Room 001**: pinned scroll sequence where a doorway opens into the event (own rust-and-ink treatment)
6. **Community & opportunities**: stated as intentions, not confirmed programmes
7. **Volunteer**: interest form
8. **Partnership**: partnership types + enquiry form
9. **Contact** + footer

---

## Motion strategy

The motion language is **Spark → Flow → Converge**: things begin small and precise, move with continuous spatial flow, and resolve into one composition. Shared curves live in `src/lib/motion.ts` and as CSS variables.

| Tool | Used for |
| --- | --- |
| **GSAP timeline** | The intro: one timeline, five labelled scenes, so timing reads and tunes in one place |
| **GSAP ScrollTrigger** | Only two scroll stories: the manifesto word reveal and The First Room doorway pin |
| **Motion for React** | Interface transitions: header hide/show, mobile menu, masked headlines, in-view reveals, ecosystem map, form states |
| **CSS** | Hover micro-interactions, link underlines, marquee |

GSAP owns every transform it animates. Initial states are set with `gsap.set`, not Tailwind utilities, because Tailwind v4's `translate`/`scale` properties would stack with GSAP's `transform`.

### The cinematic intro (`src/components/intro/`)

| Time | Scene | What happens |
| --- | --- | --- |
| 0–2s | Spark | A pulsing point of electric green; ambient light and depth particles (canvas) |
| 2–4s | Possibility | Light becomes drawn ribbons and dimensional planes; "Imagine. Make. Share." |
| 4–7s | The Creators | A four-photo spread per discipline, with its name and tagline, cut in with clip-paths |
| 7–9s | Convergence | Frames gather into a grid, then collapse into the light as particles converge |
| 9–12s | Reveal | Wordmark letters rise from a mask, rule draws, hand-off to the homepage |

- The site is rendered underneath the whole time (`inert` while the intro plays). It is never a gate.
- **Skip intro** is focused on load. **Escape** also skips. **Replay intro** is in the hero and the footer.
- Plays once per session, homepage only.
- **Mobile**: fewer particles, ~7s.
- **Reduced motion**: never autoplays. Replay runs a ~5s cross-fade-only version with static particles.
- **Sound**: off by default, starts only from the toggle.
- A safety timeout ends the intro if anything stalls.

---

## Accessibility & performance

- Skip-to-content link, visible focus rings, keyboard-operable menu (focus trap, Escape, focus return) and ecosystem map.
- `prefers-reduced-motion` is respected by GSAP (`matchMedia`), Motion (`MotionConfig reducedMotion="user"`) and CSS.
- Text colours meet WCAG AA on their surfaces. Rust is used only for large display text, accents, or with ink text.
- Fonts are self-hosted with unicode-range subsets. No external requests.
- Routes are code-split. GSAP, Motion and React ship as separately cached chunks.
- Media reserves its aspect ratio (no layout shift) and lazy-loads below the fold. There are no autoplay video backgrounds.
- Animations use transforms and opacity. The canvas caps device pixel ratio at 2.

### Disciplines and photography

Creators Hub presents four disciplines: **Fashion**, **Technology**, **Film & Storytelling** and **Arts & Design** (defined in `src/content/site.ts`).

The photographs were cut from the Creators Hub moodboards and recomposed in the site's own layouts, so they share its type, colour and shapes:

- **Disciplines section**: a mosaic per discipline (`src/components/ui/DisciplineMosaic.tsx`) with five photos and a text tile, beside the discipline's tagline and focus areas.
- **Intro montage**: a four-photo spread per discipline with its name and tagline.

Photos, taglines, focus areas, the text-tile line and alt text all live in `src/content/disciplineStories.ts`. The image files are in `src/assets/crops/` (named like `fashion-portrait.webp`).

To swap a photo, replace its file with a WebP of similar shape (keep the name), or point the entry at a new file and update its alt text. `position` sets which part of the photo stays in frame when it is cropped.

---

## Free registration and tickets

Tickets for The First Room are **free**. Registration is on `/tickets`. There is no payment step and no payment provider.

### Rules
- **One ticket per person.** The form has no quantity: each registration is one person and one ticket.
- **One registration per email.** Addresses that reach the same inbox count as the same: capitals, `+tags`, and dots in Gmail addresses (`a.b+x@gmail.com` = `ab@googlemail.com`). This holds even if the same email is submitted many times at once. Only the first request can claim the email's create-only-if-new record.
- **Capacity is configurable** with `EVENT_CAPACITY` in Netlify: a number such as `300`, empty for no limit, or `0` to close registration. Each registration claims a numbered place the same way, so the limit holds even when many people register at the same moment. When it's full, the page says so, and the server refuses new registrations. Raising the number reopens registration.
- Basic protection: a hidden field that bots fill in, and at most 40 registrations per network per hour.

### How it works
1. The attendee enters their name and email and picks their creative arm. The ticket preview appears only once the arm is chosen.
2. `netlify/functions/register.ts` validates the details, claims the email (and a place, if capacity is set), saves the registration and issues one ticket.
3. The attendee lands on their private ticket page (`/tickets/order?ref=…&k=…`), with the QR ticket ready to download or print.
4. At the same time the confirmation email is sent (Resend) and the row is added to the Google Sheet. Neither can undo a registration. A row the sheet misses is queued and retried every hour by `netlify/functions/sync-sheet.ts`.
5. Registering again with the same email is refused with "already registered", and the ticket is re-sent to that email (at most once an hour).

Registrations are stored in **Netlify Blobs** (store `registrations`, keyed by a reference such as `CH001-3F9A…`), and tickets and claims in the store `tickets`.

### Digital tickets

**Ticket record:** ticket ID (`CH001-F-0001`; the letter is the creative arm: F, A, T, S), attendee name, email, creative arm, registration reference, status (valid, checked in or void), a random 128-bit QR token, issue time, and the check-in time once used. Tickets are labelled **ADMIT ONE**.

**Design.** `src/components/tickets/TicketDesign.tsx` recreates the approved reference as one SVG in the reference's own 264 × 455 coordinate space, so proportions hold on every screen. Each arm supplies its photograph (`src/assets/tickets/`, text removed so it can be set live), its title and its rule colour (`src/content/ticketDesigns.ts`). Type is EB Garamond (titles, names) and Montserrat (labels), matched to the reference. `TicketAttendeeSection.tsx` is the cream stub; `QRCode.tsx` draws the QR as vector. Long attendee names shrink to fit, then wrap onto two lines.

**Unique IDs.** Each ticket number is claimed with a create-only-if-new write, confirmed by reading it back, so simultaneous registrations never share a number.

**QR codes and check-in.**
- The QR encodes `/v/<token>`. The token is random and stored with the ticket, so a code can't be guessed or forged, and a screenshot of a ticket is only as good as its live record.
- Scanning opens the verification page, which asks the server for the ticket's current state: **Valid**, **Already checked in at …** or **Invalid** (unknown, forged or void).
- Each ticket can be admitted once: the first scan creates its check-in record, and every later or simultaneous scan sees "Already checked in".
- Repeated wrong PINs lock that device out for 15 minutes.

### Staff area (`/staff`)

Door staff sign in once per device with `CHECKIN_PIN` (linked as "Staff" in the footer; `/tickets/check-in` also leads here). Three tools:

- **Scan**: the phone's camera opens inside the page and reads ticket QR codes continuously (jsQR, so it works on iPhone and Android). Each scan shows a large verdict (Valid, Already checked in, Invalid) with the attendee's name and arm, an **Admit** button and **Scan next ticket**. Optional "Admit automatically on scan" for fast queues. The phone vibrates on each result where supported. Camera access needs HTTPS, which Netlify provides.
- **Look up**: type a ticket ID (e.g. `CH001-F-0001`) when a code is damaged or a phone is dead.
- **Overview**: checked in vs registered, places left against capacity, by creative arm, plus the latest arrivals. Refreshes every 20 seconds (`netlify/functions/staff-summary.ts`, staff PIN required).

Scanning a ticket with an ordinary camera app still works too: it opens the ticket's page, which shows staff an **Admit** button once they're signed in on that phone.

**Delivery and access.**
- **Download** produces a 1320 × 2275 px PNG rendered from the SVG with fonts and photo embedded, so text and QR stay sharp; it isn't a screenshot.
- **Print** prints one ticket per page. **Show QR for scanning** enlarges the code on a phone.
- The confirmation email (Resend) carries the ticket in an email-safe version of the design, with its QR code, plus the private link back to it.
- Lost the email? `/tickets/find` re-sends the ticket to a registered email (the reply is the same for unregistered emails, so it can't be used to look people up). Without email set up, the email plus the registration reference opens the ticket directly.

#### Setting up email and check-in

Confirmation emails need a domain you own: Resend only sends to attendees from a verified domain.

1. Create a free account at https://resend.com.
2. Go to **Domains → Add domain** and add the domain you'll send from (for example `creatorshub.com`). Add the DNS records Resend shows at your domain registrar, then wait until it says **Verified**.
3. Go to **API keys → Create API key** with **Sending access**.
4. In Netlify, add these environment variables:
   - `RESEND_API_KEY`: the key from step 3.
   - `TICKET_EMAIL_FROM`: for example `Creators Hub <tickets@creatorshub.com>`, using the verified domain.
   - `CHECKIN_PIN`: the passcode door staff will use. Make it long, e.g. 8+ characters.
   - `EVENT_CAPACITY` (optional): total places, e.g. `300`.
5. Redeploy.

Without Resend configured, registration and tickets still work: attendees see and download their ticket straight away, and the page doesn't promise an email.

### Testing

`npm test` runs the registration and ticketing tests: one ticket per inbox (including Gmail dot and `+tag` variants), simultaneous submissions of one email, capacity under simultaneous registrations, closing with capacity 0, reopening when capacity is raised, recovery from a request that died midway, unique sequential ticket IDs, simultaneous scans, PIN rules, confirmation email content and escaping, sheet delivery, and retrying rows the sheet missed.

## Google Sheet: registrations and volunteers

One Google Sheet receives both ticket registrations (Registrations tab) and volunteer applications (Applications tab, each also emailed to the sheet's owner). Volunteer applications post to Netlify Forms (`volunteer`), and `netlify/functions/submission-created.ts` passes each genuine one to the sheet. Setup takes about 10 minutes: see [`integrations/google-sheets/README.md`](integrations/google-sheets/README.md). It needs `GOOGLE_SHEET_URL` and `GOOGLE_SHEET_KEY` in Netlify (the older `VOLUNTEER_SHEET_*` names also work). Without them, registrations are queued until the sheet is connected, and applications are kept in Netlify → Forms.

## Search engines (Google Search Console)

`seo.config.ts` runs at build time. It produces:
- `robots.txt` and `sitemap.xml`, covering the public pages: home, The First Room, Tickets and Volunteer;
- structured data (schema.org `Event`) for The First Room, with the confirmed date, time and city, marked as free to attend;
- the Search Console verification tag, when `GOOGLE_SITE_VERIFICATION` is set in Netlify. Paste either the code or the whole `<meta>` tag, then redeploy.

The site address comes from Netlify's `URL`, so adding a custom domain later updates the sitemap on the next deploy. Staff, order and personal ticket pages are excluded and sent with `noindex`.

## Deployment (Netlify)

`netlify.toml` configures the build (`npm run build` → `dist`), Node 22, SPA redirects, long-term caching for hashed assets and security headers.

Forms use **Netlify Forms**: `volunteer`, `partnership` and `contact`. Static copies in `index.html` let Netlify detect them at deploy time. Keep their field names in sync with the React forms. After the first deploy, enable form notifications under **Site configuration → Forms**.

To connect: in Netlify, choose **Add new site → Import an existing project**, pick this repository, and keep the defaults from `netlify.toml`.
