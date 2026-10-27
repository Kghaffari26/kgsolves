# JM Kelley Inc. — website

Marketing site for JM Kelley Inc., a Newport Beach general contractor that self-performs its
structural concrete and framing. Replaces the GoDaddy Website Builder site at jmkelleyinc.com.

- **Stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS v4, Sanity (embedded Studio at
  `/studio`), GSAP (ScrollTrigger, SplitText, Flip, DrawSVG, CustomEase), Lenis, React `<ViewTransition>`, React Hook Form + Zod, Resend, Vercel Blob.
- **Content still needed from the client:** [`CONTENT_TODO.md`](CONTENT_TODO.md)
- **Deploying (Vercel, Sanity, Resend, DNS cutover):** [`DEPLOY.md`](DEPLOY.md)

## Local setup

Requirements: Node.js 20.9+ (22 LTS recommended, see `.nvmrc`) and npm. Every command below
works in PowerShell.

```powershell
npm install
npm run dev        # http://localhost:3000
```

No environment variables are required. Without them the site reads
`src/content/fallback/*.json`, the Studio shows a "not configured" note, and form submissions
are printed in the terminal instead of emailed.

To connect services, copy `.env.example` to `.env.local` and fill in what you need.

| Variable                                                      | Purpose                                                |
| ------------------------------------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Turn on Sanity (content + `/studio`)                   |
| `SANITY_API_READ_TOKEN`                                       | Read token (private datasets)                          |
| `SANITY_API_WRITE_TOKEN`                                      | Only for `npm run seed:sanity`                         |
| `SANITY_REVALIDATE_SECRET`                                    | Secret for the `/api/revalidate` webhook               |
| `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`          | Lead emails + auto-reply                               |
| `LEAD_PROVIDER`, `HUBSPOT_WEBHOOK_URL`                        | `resend` / `hubspot` / `console`                       |
| `BLOB_READ_WRITE_TOKEN`                                       | Plan uploads to Vercel Blob                            |
| `NEXT_PUBLIC_SITE_URL`                                        | Canonical URL (defaults to localhost / the Vercel URL) |
| `NEXT_PUBLIC_HIDE_TODOS`                                      | `true` hides the visible `TODO(client)` markers        |

## Scripts

| Script                            | What it does                                                      |
| --------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                     | Dev server                                                        |
| `npm run build` / `npm start`     | Production build / serve it                                       |
| `npm run lint`                    | ESLint                                                            |
| `npm run typecheck`               | Generate route types, then `tsc --noEmit`                         |
| `npm run format` / `format:check` | Prettier (with Tailwind class sorting)                            |
| `npm run check`                   | lint + typecheck + build                                          |
| `npm run test:e2e`                | Playwright smoke tests (builds and starts the app itself)         |
| `npm run qa:screenshots`          | Full-page screenshots at 375/768/1280/1920 into `qa/screenshots/` |
| `npm run lhci`                    | Lighthouse CI against a running build (run `npm run build` first) |
| `npm run scrape`                  | Download photos and text from the current jmkelleyinc.com         |
| `npm run legacy:apply`            | Put the scraped photos into the project pages                     |
| `npm run placeholders`            | Regenerate "Photo pending" placeholder images                     |
| `npm run video:hero`              | Rebuild the hero loop with ffmpeg                                 |
| `npm run seed:sanity`             | Import the fallback content and images into Sanity                |

First run of the tests: `npx playwright install chromium`.

## Project structure

```
src/
  app/(site)/        public pages (home, work, services, for-builders, process, about,
                     contact, areas, journal, privacy, styleguide)
  app/studio/        embedded Sanity Studio
  app/api/           og (Open Graph images), revalidate (Sanity webhook), blob/upload
  components/        ui (primitives), layout, motion, sections, media, forms, work, seo
  content/fallback/  local JSON content used when Sanity isn't configured
  lib/sanity/        GROQ queries, client, mappers, data API with JSON fallback
  lib/forms/         Zod schemas, server actions, lead providers, rate limit
  lib/seo/           metadata helper, JSON-LD builders
  lib/motion/        reduced-motion hooks, reveal, GSAP and Lenis loaders
  sanity/            schemas and Studio structure
scripts/             scrape, legacy apply, placeholders, hero video, Sanity seed
tests/e2e/           Playwright
```

`/styleguide` shows every design token and primitive (not indexed).

## Adding a project in Sanity

1. Open `/studio` (sign in with the Sanity account that owns the project) → **Projects** → **+**.
2. Fill in **Main**: title, slug (click _Generate_), location label, city, type (tick _Type
   confirmed_), summary, specs, year, role, scope, architect. Tick **Featured** to show it on the
   homepage. **Order** sets its position (lower first).
3. **Media**: hero image, gallery, and optionally _Before / after pairs_ (framing photo + finished
   photo), a hero video loop, a card hover preview and a walkthrough video (Mux or Vimeo ID).
   **Every image needs alt text**: Sanity won't publish without it. Describe what the photo shows.
4. **Story**: _The brief_, _The build_, _The result_. Blank sections show a TODO marker.
5. **Publish.** With the webhook set up the site updates within seconds; otherwise within an hour.

Testimonials, team members, journal posts and site settings (phone, hours, license, stats) work
the same way. Homepage stats only appear once **Verified** is ticked. Journal posts only appear
once they have a publish date in the past.

## Legacy photos

The current site's images are hosted on GoDaddy (`img1.wsimg.com`).

```powershell
npm run scrape        # → assets/legacy/<page>/, <page>.txt, manifest.json
# review assets/legacy/manifest.json: each image is "finished" or "jobsite"; fix any wrong
# ones and set "reviewed": true
npm run legacy:apply  # → public/images/projects/<slug>/ and src/content/fallback/projects.json
npm run seed:sanity   # optional: push them to Sanity
```

The scraper strips GoDaddy's `/:/...` resize suffix to get original files and stops after one
failed connection attempt rather than retrying.

## Hero video

`public/video/hero-placeholder.mp4` / `.webm` is a slow Ken Burns pan across the project hero
images, built with:

```powershell
npm run video:hero                         # default: four project hero images
npm run video:hero -- a.jpg b.jpg c.jpg    # or your own photos
```

which runs ffmpeg with, per shot, `scale=3840:2160 → crop → zoompan (5 s, 30 fps, 1920×1080)`,
1-second crossfades, and encodes:

```
ffmpeg -i shot1.jpg -i shot2.jpg … -filter_complex "<zoompan + xfade chain>" -an ^
  -c:v libx264 -preset veryfast -crf 26 -pix_fmt yuv420p -movflags +faststart hero-placeholder.mp4
ffmpeg … -an -c:v libvpx-vp9 -crf 40 -b:v 0 hero-placeholder.webm
```

Budget: 4 MB or less per file (the placeholder is about 0.6 MB). Install ffmpeg on Windows
with `winget install Gyan.FFmpeg`. For real footage, trim to a 10–20 s loop and encode with the
same two codec lines.

## Design and motion notes

- **Look:** follows the Armstrong Cal Builders redesign's styling: Instrument Serif display over
  DM Sans body, near-black `#171917` on warm off-white `#FAF9F6`, stone greys, one muted taupe
  accent `#756452`, small letter-spaced labels, hairline rules and **square corners everywhere**
  (buttons are either solid or a 1px outline).
- **Tokens:** CSS variables in `src/app/globals.css`, exposed to Tailwind through `@theme`
  (Tailwind v4 has no `tailwind.config.js`). Sections switch palette with `.theme-dark` /
  `.theme-stone`.
- **Reduced motion:** honoured everywhere. Lenis, the hero video, parallax, the cursor and
  scroll choreography switch off; Foundation Up becomes a static four-panel grid (pure CSS
  switch, no flash).
- **Unknown facts:** never invented. Fact fields are `null` until confirmed and render a
  `TODO(client)` marker, hidden in production with `NEXT_PUBLIC_HIDE_TODOS=true`.

## Motion system

One vocabulary, taken from building: things are **uncovered, drawn and placed**, never bounced
or thrown. No glows, gradient blobs, springs or fade-up-everything.

| Effect            | Where                                                                 | How                                                                                  |
| ----------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Line masks        | Page titles (CSS, on first paint); section headings (`data-split`)    | `RevealText`; GSAP SplitText via `MotionDirector`                                    |
| Curtain reveal    | Project cards, gallery, service images, before/after (`data-curtain`) | clip-path wipe upward + image settling from 1.18×                                    |
| Hairlines         | Dividers (`data-rule`)                                                | scaleX from the left                                                                 |
| Foundation Up     | Homepage                                                              | pinned scrub; DrawSVG draws slab → frame → envelope, then the photo is uncovered     |
| Featured work     | Homepage                                                              | pinned horizontal travel; photos drift inside their frames; progress hairline        |
| Filter            | `/work`                                                               | GSAP Flip: cards glide to new cells                                                  |
| Card → case study | Navigation                                                            | React `<ViewTransition>` shared-element morph; pages cross-fade; header stays pinned |
| Footer            | Every page                                                            | content rises from beneath the page (`data-uncover`); headline line masks            |
| Hover             | Nav links, buttons                                                    | text roll; fill wipe from the bottom edge                                            |

Eases live in `src/lib/motion/gsap.ts` (`jmk.out`, `jmk.inOut`, `jmk.draw`) and match the CSS
variables `--ease-out` / `--ease-in-out`. Every effect is built lazily when its section is about a
screen away (keeps main-thread tasks short) and never runs under `prefers-reduced-motion`.
