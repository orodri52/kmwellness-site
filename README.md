# KM Wellness Center — Website (Astro + React)

A **static, SEO-first** rebuild of kmwellnesscenter.com. Astro renders every page to static HTML at
build time; React is wired in for interactive islands (the contact form). Designed to deploy to
**Cloudflare Pages**. This is an **unstyled HTML shell** — all content and SEO plumbing is in place;
visual design is intentionally left for you.

## Quick start

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # static output to ./dist
npm run preview    # serve the built ./dist locally
```

Requires Node 18.20+, 20.3+, or 22+.

## Deploy to Cloudflare Workers

This project deploys via Cloudflare **Workers Builds** (git-connected CI/CD), not the classic Pages
product — the live URL is a `*.workers.dev` domain.

1. Push this folder to a Git repo (GitHub/GitLab).
2. Cloudflare dashboard → **Workers & Pages → Create → Connect to Git**.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Environment variables — Workers splits these into two separate panels, both under **Settings**:
   - **Settings → Build → Build variables and secrets:** used only during `npm run build`. Anything
     referenced via `import.meta.env.PUBLIC_*` (e.g. `PUBLIC_SITE_URL`, `PUBLIC_TURNSTILE_SITE_KEY`)
     must go here, since Astro/Vite inlines these into the static bundle at build time.
   - **Settings → Variables and secrets:** used only at runtime by the Pages Function
     (`functions/api/lead.ts`), e.g. `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`.
   - (Optional) Set `PUBLIC_SITE_URL` to your `*.workers.dev` URL while testing. Non-production hosts
     are automatically `noindex`ed (see below), so test deploys won't get indexed. Remove it (or set
     the real domain) for production.
5. Deploy. `_redirects` and `_headers` in `public/` are picked up by Cloudflare automatically.

No adapter is needed — this is a pure static build.

## SEO — what's built in

- **Per-page meta** (`src/components/SEO.astro`): unique title + description, canonical URL,
  Open Graph, Twitter card, geo tags. Canonicals are derived from `site` so they're correct in every
  environment.
- **Auto-noindex for non-production hosts.** If the deploy host isn't `kmwellnesscenter.com`, pages
  emit `<meta name="robots" content="noindex, nofollow">`. `/thank-you/` is always noindex.
- **JSON-LD structured data** (`src/components/Schema.astro`): MedicalBusiness/LocalBusiness with NAP,
  hours, geo, and social `sameAs`, plus WebSite. Per-page **FAQPage** schema on the nutritionist and
  metabolic-assessment pages; **Article** schema on the blog post; **BreadcrumbList** on inner pages.
- **Sitemap** via `@astrojs/sitemap` → `/sitemap-index.xml` (excludes `/thank-you/`).
- **robots.txt** (`public/robots.txt`) points to the correct sitemap domain — fixing the live site's
  bug where it pointed at `kmc-wellness.com`.
- **Trailing-slash URLs preserved** (`/about-us/`, etc.) to keep parity with the current site and
  protect existing rankings.
- **301 redirects** (`public/_redirects`): the three duplicate nutrition pages consolidate to
  `/services/nutritionist-el-paso/`; legacy `/about/`, `/contact/`, `/sample-page/` are redirected.

## Project structure

```
public/
  robots.txt          # correct sitemap domain
  _redirects          # Cloudflare 301s (duplicate-page consolidation + legacy URLs)
  _headers            # security + cache headers
  favicon.svg
  images/             # add og-default.jpg, logo.png, contact-og.jpg (see images/README.md)
src/
  config/site.ts      # single source of truth: NAP, nav, brand, geo, socials
  components/
    SEO.astro         # per-page meta + canonical + noindex logic
    Schema.astro      # site-wide LocalBusiness + WebSite JSON-LD
    FaqSchema.astro   # FAQPage JSON-LD helper
    Breadcrumbs.astro # visible breadcrumb + BreadcrumbList JSON-LD
    Header.astro / Footer.astro
    ContactForm.tsx   # React island (client:load) — wire `action` to a handler
  layouts/BaseLayout.astro   # the HTML shell
  pages/              # 20 routes (see below)
```

## Pages (20 routes)

Home, About, Services (hub) + 7 service pages, Personal Training, Metabolic Assessment, Success
Stories, As Featured In, Insurances, Blog post, Privacy Policy, Terms, Thank-you. The two duplicate
nutrition URLs are **redirects**, not pages (by design).

## Before launch — checklist

- [ ] Add real images to `public/images/` (`og-default.jpg`, `logo.png`, `contact-og.jpg`) — see that folder's README.
- [ ] Wire the contact form: set the `action` prop in `src/pages/contact-us.astro` to a Formspree
      endpoint or a Cloudflare Pages Function (`functions/contact.ts`).
- [x] Re-add analytics/pixels through the existing GTM container (`GTM-5ZSWHWBG`). `BaseLayout.astro`
      loads GTM on the production host only, and form/phone/email interactions push conversion
      events into `dataLayer` for GA4/GTM.
- [ ] Confirm the canonical brand name (KM Wellness Center vs Kingsway) in `src/config/site.ts`.
- [ ] Verify the business `geo` coordinates in `src/config/site.ts`.
- [ ] Point the production domain at Cloudflare and confirm `PUBLIC_SITE_URL` is unset/correct so
      pages are indexable.
- [ ] Add a Google Maps embed on Contact (and the real testimonial gallery on Success Stories).

Content for every page came from the audit archive in `../Website-Backup/`.
