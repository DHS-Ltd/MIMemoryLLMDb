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
- `docs/adr/0008-keep-list-replaces-url-parity.md` — old URLs kept by evidence (Keep List); amends 0004 and the 1:1 rule.
- `docs/adr/0009-measurement-and-consent.md` — opt-in GA4, consent bar, `generate_lead`, noindex on pages.dev, retention.
- `PROGRESS.md` — current state, harness order, Stuck Note. Read first.
- `docs/content-systems-plan.md` — concrete content/build plan derived from the ADRs.
- `docs/content-build-plan.md` — page-by-page content spec (what goes on each page).
- `docs/design/visual-design-system.md` — full design spec (colors, type, layout, motion).
- `docs/design/product-page-information-design.md` — how product pages serve visitors from social media.
- `docs/product-build-guide.md` — how to add or update a product (read before building one).
- `docs/page-reports.md` — Reviewer "Page reports" (GitHub Issues): how to work them, owner setup, limits.
- `docs/Cyclotron_Isotope_Research/CONTEXT.md` — theranostics research corpus (BD lead-magnet source).
- `docs/Med_I_Historic_data/` — all historic source material (see map below).

## Locked decisions (summary — CONTEXT.md is canonical)

- **Stack:** Astro + Cloudflare Pages + GitHub + Sveltia (git-based) CMS. $0 hosting, no lock-in.
- **Architecture:** one domain, two sections — B2B now, consumer shop later. Build shop-ready, don't build it.
- **New angle:** B2B **Bangladesh expansion** → dedicated `/bangladesh` section under the MED I brand; feasibility brief as gated lead-magnet.
- **Language:** English-first, Thai-ready (Astro i18n scaffolding from day one).
- **SEO:** launch does not wait for the Keep List (ADR 0008 amendment 2026-10-23). The cutover
  gate is `npm run check:urls`: every URL in the old crawl is built, 301s or 410s on purpose.
  After launch, the Search Console export cuts the **Keep List** (old URLs that earned clicks)
  and **Drop List**; any dropped URL that earned clicks gets a 301. Do not rename or retire a
  route that is built and linked.
- **Forms/leads:** Cloudflare Pages Functions → owner email + free newsletter tool (Brevo/MailerLite).
- **Video:** keep Google Drive embeds behind click-to-play covers (facade-first). Revisit → YouTube if Drive quota errors appear.
- **Products:** structured CMS catalog, no cart (name, category, brand, specs, images, brochure, request-info CTA), grouped by Solution. Seeds the future shop model.
- **Design:** evolve the identity (keep logo + blue palette; **Michroma** for kicker labels only). **Blue is the whole interface; red is scientific notation only** — the logo mark and the hot isotope node, never anything clickable (ADR 0005). No third-party partner marks anywhere. No separate mockup stage: build in Astro, review on the live preview URL.
- **Cutover:** staged, preserve email/MX. Rollback = the self-captured static snapshot
  (`docs/site-snapshot/`), not live WordPress — the WP host is uncontrolled and could vanish
  at any time (see ADR 0003).
- **v1 scope:** modernized; drop injected casino-spam ("Events/Sponsor") and thin pages.

## Build phases

0. **Inventory & access** — crawl live URLs (the full old-URL inventory; the Keep List is cut from it, ADR 0008); confirm registrar/host/where email(MX) lives; gather brand assets + Drive video links; confirm Cloudflare + GitHub access.
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
- Every product and where its brochure/photo lives: `docs/baseline/2026-10-product-inventory.md`.

## Working style

- The site is LIVE and RANKING — never break a Keep List URL or ship a thin replacement. Old WP stays up until verified cutover.
- **Done means:** a task is done only when `npm test` passes and `PROGRESS.md` says so (update it in the same change). Use three words and no others: **built** (code committed), **tested** (`npm test` passed), **verified** (a real run on the preview or live URL, with a proof line in `PROGRESS.md` saying what was done and what showed up). Never write "verified" without the proof line; the user judges the proof. A screenshot, a file, or the user's own typed confirmation in chat all count as proof (record the date and what they said they saw); never record a confirmation the user did not type. Read `PROGRESS.md` first each session; it holds the state and any Stuck Note. Lead form: `docs/lead-form-setup.md`.
- **Write it down once:** after an expensive lookup in `docs/Med_I_Historic_data/` (or any large source), save the answer as a short note in `docs/baseline/` (like `2025-04-baseline.md`) and add one line for it to the Historic data map above. Check that map and `docs/baseline/` before searching the raw files again. Do not pre-index files nobody has asked about.
- Rebuild content clean; never copy wholesale from the compromised site.
- Recommend a default and proceed; only ask when the answer changes what gets built.
- **Features: Opus plans, Sonnet builds, Opus verifies** (owner decision 2026-10-23, after the Page
  reports build). For a new feature that visitors or Reviewers touch: plan and decide with Opus; a
  Sonnet agent builds it on a branch and never pushes; a separate Opus pass reads every changed file,
  re-runs `npm test`, the build and `npm run check:urls`, and runs it in a phone-sized touch browser,
  looking at the screens and pictures it produces; then the owner checks the preview URL before
  anything reaches `main`. Small content or text edits (e.g. working Page reports) stay with one
  agent. Why: on the Page reports build the builder's own checks passed while 7 bugs remained, 4 of
  them visible only on a phone or in a picture.

## Development

Astro project at the repo root (`astro.config.mjs`, `src/`, `public/`). Standard commands:
`npm run dev`, `npm run build`, `npm run preview`. When starting the dev server in an agent
session, use `astro dev --background` (manage with `astro dev stop` / `status` / `logs`) so it
doesn't block the session.

Cloudflare work (Pages project, DNS) is **guided manual steps for the owner**, not direct API
automation — the same Cloudflare account also runs an unrelated PACS project on a different
domain that must never be touched.
