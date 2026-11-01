# Creators Hub

Website for **Creators Hub**, a multidisciplinary creative organisation and community, and its inaugural event, **Creators Hub 001: The First Room** (19 December 2026, Lagos, Nigeria).

Built with React, TypeScript, Vite, Tailwind CSS v4, Motion for React, GSAP + ScrollTrigger, Lucide and React Router. Deployed on Netlify.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run lint
npm test           # payment logic tests
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

## Ticket payments (Flutterwave)

Regular and Premium tickets for The First Room are sold on `/the-first-room#tickets` and paid through **Flutterwave's hosted checkout** (card, bank transfer, USSD). Card details never touch this site.

### How it works

1. The buyer picks a tier and quantity and enters their name and email.
2. `netlify/functions/checkout.ts` validates the request, **sets the price on the server** from `src/content/tickets.ts`, saves a pending order, and asks Flutterwave for a checkout link.
3. The buyer pays on Flutterwave and is sent back to `/tickets/confirmation`.
4. `netlify/functions/verify-payment.ts` checks the transaction with Flutterwave. The ticket is confirmed only if the status is successful **and** the reference, currency and amount match the order.
5. `netlify/functions/flutterwave-webhook.ts` receives Flutterwave's webhook, so payments are recorded even if the buyer closes the tab. Each webhook is authenticated with the secret hash and re-verified with Flutterwave.

6. Once a payment is confirmed, the buyer is emailed a **branded ticket with a QR code** (see below).

Orders are stored in **Netlify Blobs** (store `ticket-orders`, keyed by the payment reference such as `CH001-…`). Browse them in Netlify under **Blobs**; every payment also appears in the Flutterwave dashboard.

### Setting prices and perks

Edit `src/content/tickets.ts`. Set `price` in whole naira and replace `perks: null` with the confirmed list. While `price` is `null`, the tier shows "Price to be announced" and **cannot be bought**: the button is disabled and the server refuses the order.

### Setup

1. Create or sign in to a Flutterwave business account. Use **test mode** until launch.
2. In Netlify, go to **Site configuration → Environment variables** and add:
   - `FLW_SECRET_KEY`: your Flutterwave secret key (**Settings → API keys**).
   - `FLW_SECRET_HASH`: a long random string you choose.
3. In Flutterwave, go to **Settings → Webhooks**, set the URL to `https://<your-site>/.netlify/functions/flutterwave-webhook`, and enter the same secret hash.
4. Redeploy, then buy a ticket using Flutterwave's test cards.
5. To go live, complete Flutterwave's business verification, swap in the **live** secret key, update the webhook in live mode, and redeploy.

### Digital tickets

Every paid order produces **one ticket per attendee**. Buyers choose a design for each ticket (Fashion, Arts & Design, Technology, Film & Storytelling) and enter each attendee's name at checkout.

**Ticket record** (Netlify Blobs store `tickets`, created only after Flutterwave confirms payment):
ticket ID (`CH001-F-0001`; the letter is the design: F, A, T, S), attendee name, buyer email, category (Regular/Premium), design, order reference, payment status, ticket status (valid, checked in or void), a random 128-bit QR token, purchase time, issue time, and the check-in time once used.

**Design.** `src/components/tickets/TicketDesign.tsx` recreates the approved reference as one SVG in the reference's own 264 × 455 coordinate space, so proportions hold on every screen. Each arm supplies its photograph (`src/assets/tickets/`, text removed so it can be set live), its title and its rule colour (`src/content/ticketDesigns.ts`). Type is EB Garamond (titles, names) and Montserrat (labels), matched to the reference. `TicketAttendeeSection.tsx` is the cream stub; `QRCode.tsx` draws the QR as vector. Long attendee names shrink to fit, then wrap onto two lines.

**Safe against duplicates.** The payment return page and the webhook may both confirm a payment, even at the same moment. Issuing is idempotent: each attendee slot and each ticket number is claimed with a create-only-if-new write, confirmed by reading it back, so a repeated or simultaneous callback can never create a second ticket or reuse a number. Tickets are emailed once per order.

**QR codes and check-in.**
- The QR encodes `/v/<token>`. The token is random and stored with the ticket, so a code can't be guessed or forged, and a screenshot of a ticket is only as good as its live record.
- Scanning opens the verification page, which asks the server for the ticket's current state: **Valid**, **Already checked in at …**, **Invalid** (unknown, forged or void) or **Awaiting payment confirmation**.
- Staff sign in with `CHECKIN_PIN` (at `/tickets/check-in`, or "Staff check-in" on any ticket page). Signed in, a scan shows a large verdict and an **Admit** button. Each ticket can be admitted once: the first scan creates its check-in record, and every later or simultaneous scan sees "Already checked in". Staff can also type a ticket ID when a code won't scan.
- Repeated wrong PINs lock that device out for 15 minutes.

**Delivery and access.**
- The confirmation page shows the designed tickets once payment is verified.
- **Download** produces a 1320 × 2275 px PNG rendered from the SVG with fonts and photo embedded, so text and QR stay sharp; it isn't a screenshot.
- **Print** prints one ticket per page.
- **Show QR for scanning** enlarges the code on a phone.
- The email (Resend) carries every ticket in an email-safe version of the design, with its own QR code, plus a private link (`/tickets/order?ref=…&k=…`) back to all of the order's tickets.
- Lost the email? `/tickets/find` re-sends the tickets to the address on the order, given the email and order reference. The reply is the same either way, so it can't be used to look people up.

#### Setting up email and check-in

1. Create a free account at https://resend.com.
2. Go to **Domains → Add domain** and add the domain you'll send from (for example `creatorshub.com`). Add the DNS records Resend shows at your domain registrar, then wait until it says **Verified**.
3. Go to **API keys → Create API key** with **Sending access**.
4. In Netlify, add these environment variables:
   - `RESEND_API_KEY`: the key from step 3.
   - `TICKET_EMAIL_FROM`: for example `Creators Hub <tickets@creatorshub.com>`, using the verified domain.
   - `CHECKIN_PIN`: the passcode door staff will use. Make it long, e.g. 8+ characters.
5. Redeploy.

Without Resend configured, payments and tickets still work and buyers see and download their tickets on the confirmation page; only the email is skipped.

### Testing

`npm test` runs the payment and ticketing tests: price tampering, mismatched amounts and currencies, failed payments, forged webhooks, duplicate and simultaneous payment callbacks, unique sequential ticket IDs, simultaneous scans, PIN lockout, email rendering and escaping.

To run the functions locally, install the Netlify CLI, copy `.env.example` to `.env` with test keys, and run `netlify dev`.

## Deployment (Netlify)

`netlify.toml` configures the build (`npm run build` → `dist`), Node 22, SPA redirects, long-term caching for hashed assets and security headers.

Forms use **Netlify Forms**: `volunteer`, `partnership` and `contact`. Static copies in `index.html` let Netlify detect them at deploy time. Keep their field names in sync with the React forms. After the first deploy, enable form notifications under **Site configuration → Forms**.

To connect: in Netlify, choose **Add new site → Import an existing project**, pick this repository, and keep the defaults from `netlify.toml`.
