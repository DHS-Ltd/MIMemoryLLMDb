# MED I Thailand — Website Rebuild

Project instructions for Claude. Read `CONTEXT.md` (glossary) and `docs/adr/` (decisions)
before acting. This file is the working brief; those are the source of truth.

## What this is

Rebuild of **medi-thailand.com** — a B2B radiopharmaceutical / theranostics company
(importer & project-solutions provider across ASEAN, expanding into Bangladesh). Moving OFF
a compromised WordPress site ONTO a modern static stack. The owner directs the work and is
non-technical; give recommendations, not open-ended menus.

## Authoritative docs (read these first)

- `CONTEXT.md` — glossary + the full list of locked decisions.
- `docs/adr/0001-platform-stack.md` — why Astro + Cloudflare Pages + Sveltia CMS.
- `docs/adr/0002-one-domain-two-sections-and-bangladesh.md` — site architecture + BD angle.
- `docs/adr/0003-cutover-and-dns.md` — DNS/email-safe cutover sequencing.
- `docs/adr/0003-bold-biotech-visual-direction.md` — visual identity direction.
- `docs/adr/0004-content-collections-and-routing.md` — content model + URL routing rules.
- `docs/adr/0005-red-is-scientific-notation-not-interface.md` — palette relock; amends 0003.
- `docs/adr/0006-reusing-media-from-the-compromised-site.md` — which old-site assets may be reused.
- `docs/content-systems-plan.md` — concrete content/build plan derived from the ADRs.
- `docs/content-build-plan.md` — page-by-page content spec (what goes on each page).
- `docs/design/visual-design-system.md` — full design spec (colors, type, layout, motion).
- `docs/Cyclotron_Isotope_Research/CONTEXT.md` — theranostics research corpus (BD lead-magnet source).
- `docs/Med_I_Historic_data/` — all historic source material (see map below).

## Locked decisions (summary — CONTEXT.md is canonical)

- **Stack:** Astro + Cloudflare Pages + GitHub + Sveltia (git-based) CMS. $0 hosting, no lock-in.
- **Architecture:** one domain, two sections — B2B now, consumer shop later. Build shop-ready, don't build it.
- **New angle:** B2B **Bangladesh expansion** → dedicated `/bangladesh` section under the MED I brand; feasibility brief as gated lead-magnet.
- **Language:** English-first, Thai-ready (Astro i18n scaffolding from day one).
- **SEO:** preserve every existing URL 1:1. Step 0 = crawl/inventory the live site.
- **Forms/leads:** Cloudflare Pages Functions → owner email + free newsletter tool (Brevo/MailerLite).
- **Video:** keep Google Drive embeds behind click-to-play covers (facade-first). Revisit → YouTube if Drive quota errors appear.
- **Products:** structured CMS catalog, no cart (name, category, brand, specs, images, brochure, request-info CTA), grouped by Solution. Seeds the future shop model.
- **Design:** evolve the identity (keep logo + blue palette; **Michroma** for kicker labels only). **Blue is the whole interface; red is scientific notation only** — the logo mark and the hot isotope node, never anything clickable (ADR 0005). No third-party partner marks anywhere. No separate mockup stage: build in Astro, review on the live preview URL.
- **Cutover:** staged, preserve email/MX. Rollback = the self-captured static snapshot
  (`docs/site-snapshot/`), not live WordPress — the WP host is uncontrolled and could vanish
  at any time (see ADR 0003).
- **v1 scope:** full parity + modernized; drop injected casino-spam ("Events/Sponsor") and thin pages.

## Build phases

0. **Inventory & access** — crawl live URLs (lock the 1:1 map); confirm registrar/host/where email(MX) lives; gather brand assets + Drive video links; confirm Cloudflare + GitHub access.
1. **Foundation** — Astro repo → Cloudflare Pages preview; i18n scaffold; content collections (`solutions`, `products`, `team`, `events`, `blog`, `bangladesh`); Sveltia CMS wired.
2. **Content build** — rebuild all real pages at identical URLs; populate product catalog; build Bangladesh section + lead-magnet.
3. **Dynamic + measurement** — forms + newsletter; GA4 + Search Console + sitemap + robots + PDPA consent notice.
4. ~~Design session — mockups + owner approval~~ — **superseded 2026-09-17**: no separate
   design phase happens. Design was built directly into Phase 2/3 pages (site chrome, home
   redesign, detail templates) and the owner reviews/redirects it live on the preview URL as
   it ships, per the no-separate-mockup-stage decision above.
5. **Staged cutover** — DNS/email move to Cloudflare happens **early, decoupled from web
   cutover** (not deferred to last) since the WP host is uncontrolled and could vanish —
   see ADR 0003. Web cutover (flip origin to Cloudflare Pages) still comes last, after
   forms/measurement are live.

**Deferred past v1:** Thai translations · consumer SELMAX/lozenges shop · richer product filtering.

## Historic data map (`docs/Med_I_Historic_data/`)

- `Notes_Maidul_MED_I_Thailand_Website_contents/` — all page copy, product/video link tables, SEO reports, blog list.
- `Website_Screenshot/` — screenshots of every live page (the parity reference).
- `Image_&_Video/` — logo (`MED_I_Logo/`, font Michroma), team photos, product images, event photos, interview videos.
- `materials/` — brochures/spec PDFs, company profile, facility-design docs, site-structure PPTX.
- `ExpertsCV/` — specialist CVs (for team bios).
- `Features/Blog_writting/` — drafted blog content + article images.
- `Features/e-commercePlanned/` — the FUTURE consumer-shop marketing plan (not v1).
- `Seo/` — SEO plans/reports. `Product List MED_I_Thailand.xlsx` — product data.

## Working style

- The site is LIVE and RANKING — never break URLs or ship a thin replacement. Old WP stays up until verified cutover.
- Rebuild content clean; never copy wholesale from the compromised site.
- Recommend a default and proceed; only ask when the answer changes what gets built.

## Development

Astro project at the repo root (`astro.config.mjs`, `src/`, `public/`). Standard commands:
`npm run dev`, `npm run build`, `npm run preview`. When starting the dev server in an agent
session, use `astro dev --background` (manage with `astro dev stop` / `status` / `logs`) so it
doesn't block the session.

Cloudflare work (Pages project, DNS) is **guided manual steps for the owner**, not direct API
automation — the same Cloudflare account also runs an unrelated PACS project on a different
domain that must never be touched.
