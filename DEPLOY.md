# Deploying

Status: the site is ready to deploy, but **no preview has been deployed yet**. The build
environment used to create it could not reach Vercel (network policy) and has no Vercel
credentials, so step 1 has to be run by you. It takes about ten minutes.

Production, the domain and DNS are deliberately **not** touched until you say go (step 6).

## 1. Create the Vercel project (preview only)

1. Push this repo to GitHub (it already is: `kghaffari26/kgsolves`).
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: **Next.js**. Root
   directory: repository root. Build command and output: defaults. Node.js: 22.x.
3. Before the first deploy, set the environment variables in step 2 (all optional; the site
   runs on its JSON fallback without them).
4. Every push to a non-production branch now gets a preview URL, e.g. the branch
   `claude/jm-kelley-website-rebuild-5douon`. Previews are `noindex` (robots.txt disallows
   all when `VERCEL_ENV` isn't `production`).

From PowerShell instead of the dashboard:

```powershell
npm i -g vercel
vercel login
vercel link          # create/link the project
vercel               # preview deploy (never use --prod until step 6)
```

## 2. Environment variables

Set in **Vercel → Project → Settings → Environment Variables**. "Preview" and "Production"
can differ (e.g. send preview leads to yourself).

| Variable                        | Needed for                  | Where it comes from                                                                             |
| ------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | canonical URLs, sitemap, OG | `https://jmkelleyinc.com` in Production; leave unset in Preview (falls back to the preview URL) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | CMS                         | sanity.io/manage → project                                                                      |
| `NEXT_PUBLIC_SANITY_DATASET`    | CMS                         | `production`                                                                                    |
| `SANITY_API_READ_TOKEN`         | CMS (private datasets)      | sanity.io/manage → API → Tokens → _Viewer_                                                      |
| `SANITY_REVALIDATE_SECRET`      | webhook                     | any long random string (same value in the Sanity webhook)                                       |
| `RESEND_API_KEY`                | lead emails                 | resend.com → API Keys                                                                           |
| `LEAD_TO_EMAIL`                 | lead emails                 | the inbox that should receive leads                                                             |
| `LEAD_FROM_EMAIL`               | lead emails                 | e.g. `JM Kelley Inc. <leads@send.jmkelleyinc.com>` (a verified Resend domain)                   |
| `LEAD_PROVIDER`                 | optional                    | `resend` (default when the key is set), `hubspot`, or `console`                                 |
| `HUBSPOT_WEBHOOK_URL`           | only for `hubspot`          | HubSpot workflow webhook URL                                                                    |
| `BLOB_READ_WRITE_TOKEN`         | plan uploads                | added automatically when you connect a Blob store (step 4)                                      |
| `NEXT_PUBLIC_HIDE_TODOS`        | launch                      | `true` once `CONTENT_TODO.md` is cleared                                                        |

`SANITY_API_WRITE_TOKEN` is only for running `npm run seed:sanity` locally; don't add it to Vercel.

## 3. Sanity

1. Create a project at sanity.io/manage (free tier is fine), dataset `production`.
2. **API → CORS origins → Add**, each with **Allow credentials** ticked (needed for `/studio`):
   - `http://localhost:3000`
   - `https://*.vercel.app` (or your project's exact preview domain pattern)
   - `https://jmkelleyinc.com`
   - `https://www.jmkelleyinc.com`
3. Seed it from your machine (PowerShell), after the legacy photos are applied:
   ```powershell
   npm run scrape
   npm run legacy:apply
   npm run seed:sanity
   ```
4. **API → Webhooks → Create webhook**:
   - URL: `https://jmkelleyinc.com/api/revalidate` (use the preview URL while testing)
   - Dataset: `production`; Trigger on: Create, Update, Delete
   - Filter: `_type in ["project","service","testimonial","teamMember","post","siteSettings"]`
   - Projection: `{_type, "slug": slug.current}`
   - HTTP method: POST; API version: `v2025-10-01`
   - Secret: the same value as `SANITY_REVALIDATE_SECRET`
     Publishing in the Studio now refreshes the site within seconds (otherwise hourly).

## 4. Leads and uploads

- **Resend:** add a sending domain (a subdomain such as `send.jmkelleyinc.com` keeps it apart
  from your normal email), add the DNS records Resend lists at GoDaddy, wait for "Verified",
  then set `LEAD_FROM_EMAIL` on that domain. Each lead sends one notification to
  `LEAD_TO_EMAIL` and one auto-reply to the visitor.
- **Vercel Blob:** Project → Storage → Create → Blob → connect to the project. This adds
  `BLOB_READ_WRITE_TOKEN`. Uploaded plans live at unguessable public URLs, which are what the
  lead email links to. Without Blob the form still works and lists file names only.
- **HubSpot later:** set `LEAD_PROVIDER=hubspot` and `HUBSPOT_WEBHOOK_URL`; the forms don't change.

Both Resend and Vercel Blob have free tiers that cover a site this size; check current pricing
before enabling anything paid.

## 5. Check the preview

- `/`, `/work`, a case study, `/contact`, `/for-builders` and `/studio` load.
- Submit both forms; you should get the notification and the visitor auto-reply.
- Old URLs redirect: `/portfolio`, `/contact-us`, `/4-fairway-point`, `/2000-east`, …
- Optional: `npm run test:e2e` locally, and `npm run build` then `npm run lhci`.

## 6. Domain cutover from GoDaddy (only when you approve launch)

1. Vercel → Project → **Settings → Domains → Add** `jmkelleyinc.com` and `www.jmkelleyinc.com`
   (redirect `www` → apex, or the other way round; pick one).
2. Vercel shows the exact records to create. At the time of writing they are:

   | Type  | Name  | Value                  |
   | ----- | ----- | ---------------------- |
   | A     | `@`   | `76.76.21.21`          |
   | CNAME | `www` | `cname.vercel-dns.com` |

   Always use the values Vercel displays for your project if they differ.

3. In **GoDaddy → My Products → DNS** for jmkelleyinc.com:
   - Remove the existing `@` A record(s) and the `www` CNAME that point at the GoDaddy Website
     Builder, and add the records above.
   - **Do not touch MX, TXT (SPF/DKIM/DMARC) or other records**: they run your email.
   - If GoDaddy shows "Website Builder is connected to this domain", disconnect the domain from
     the Website Builder first, or it will re-create its records.
4. Lower the TTL (e.g. 600 s) a day before if you want a fast switch. Propagation is usually
   minutes, occasionally a few hours. Vercel issues the SSL certificate automatically.
5. Set `NEXT_PUBLIC_SITE_URL=https://jmkelleyinc.com` for Production and redeploy.
6. Keep the GoDaddy Website Builder plan for a couple of weeks after launch as a fallback, then cancel it.
7. In Google Search Console, add the domain property and submit `https://jmkelleyinc.com/sitemap.xml`.
   The 301s carry the old URLs' search equity to the new pages.
