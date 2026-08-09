---
name: dh-pacs-website-build
description: "DH PACS marketing website build progress — tech stack, repo location, what is done, and what remains"
metadata: 
  node_type: memory
  type: project
  originSessionId: d8460f58-4103-477c-afa8-336658927641
aliases: [dh-pacs-website-build]
---

> ## ⚠ SUPERSEDED — do not use for customer-facing work
>
> **Build status may be current; the content spec it targets is not.** `DH_PACS_WEBSITE_CONTENT_SPEC.md` still reflects the superseded category and a DHV-Workstation-only deployment model. Website revision is deferred by decision.
>
> **Authority:** `E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-03). Current position: `org/north-star.md`.
> Retained rather than deleted so stale copies elsewhere stay traceable (ADR-0006).

---

## Build Status: Phase 1 COMPLETE — pre-launch tasks remain

**Why:** Marketing website for DH PACS at pacs.dhsolutions.com.bd. Lead generation and sales intelligence platform — no direct sales, only CTAs. Full architecture doc at E:\DHS-PACS\docs\Architecture\DH_PACS_WEBSITE_ARCHITECTURE.md. Definitive content/design spec: E:\DHS-PACS\docs\Architecture\DH_PACS_WEBSITE_CONTENT_SPEC.md.

---

## Key Locations

| What | Where |
|---|---|
| Website source code | `E:\DHS-PACS\dh-pacs-website\` |
| GitHub repo | `https://github.com/DHS-Ltd/DH-PACs-Solutions.git` (private) |
| Architecture doc | `E:\DHS-PACS\docs\Architecture\DH_PACS_WEBSITE_ARCHITECTURE.md` |
| Content/design spec | `E:\DHS-PACS\docs\Architecture\DH_PACS_WEBSITE_CONTENT_SPEC.md` |
| Supabase project URL | `https://tdvixhpnnljrhvhxsvzw.supabase.co` |
| Supabase region | Singapore (ap-southeast-1) |

---

## Tech Stack Decisions (all confirmed)

- **Framework:** Next.js 16.2.6 (App Router, SSG)
- **Hosting:** Cloudflare Pages (domain already on Cloudflare)
- **Cloudflare adapter:** `@opennextjs/cloudflare` v1.19.11
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase Cloud Free tier (PostgreSQL)
- **Domain:** `pacs.dhsolutions.com.bd`
- **Site structure:** Long-scroll homepage + separate pages for `/case-study`, `/contact`, `/privacy-policy`, `/demo`

---

## What Was Built (2026-05-30 → 2026-05-31 session)

All components are now fully built — nothing is a placeholder anymore. Build is green (`npm run build` passes, zero TypeScript errors).

### Files built or rewritten

| File | Status |
|---|---|
| `.github/workflows/supabase-ping.yml` | NEW — pings Supabase every 6h to prevent free-tier pause |
| `src/app/globals.css` | REWRITTEN — full DH PACS brand token system, shadcn overrides, shared component classes (.btn-primary, .btn-secondary, .eyebrow, .tag-badge, .form-input, .content-card), scroll animation utilities (.animate-in / .visible) |
| `src/app/layout.tsx` | REWRITTEN — Inter + Plus Jakarta Sans via next/font, full SEO metadata + Open Graph |
| `src/app/page.tsx` | REWRITTEN — assembles all 8 homepage sections |
| `src/components/layout/Header.tsx` | BUILT — sticky, transparent→frosted glass at 60px, IntersectionObserver active-link tracking, mobile hamburger overlay |
| `src/components/layout/Footer.tsx` | BUILT — 3-column, bottom bar |
| `src/components/sections/Hero.tsx` | BUILT — 2-col, H1, DICOM phone mockup (placeholder visual), floating notification card, entrance animations |
| `src/components/sections/ProblemSection.tsx` | NEW — amber/teal contrast table (7 rows each), React.Fragment key fix applied |
| `src/components/sections/HowItWorks.tsx` | BUILT — 3-step cards, dashed connector, desktop horizontal / mobile vertical |
| `src/components/sections/WhoItsFor.tsx` | NEW — 3 audience cards (hospitals, radiologists, surgeons) |
| `src/components/sections/FeaturesOverview.tsx` | BUILT — 9-tile 3×3 grid, stagger animation |
| `src/components/sections/IbnSinaTeaser.tsx` | BUILT — featured card with border-l-4 teal accent, useCountUp counter animation (0→7, 0→5, 0→1) |
| `src/components/sections/MarketVision.tsx` | NEW — leapfrog narrative, vision gradient, ghost ৳14.6B background |
| `src/components/sections/CtaSection.tsx` | BUILT — 2-col (form 60% / direct contact 40%), reassurance block |
| `src/components/forms/ContactForm.tsx` | BUILT — 5-field form, useTransition, success/error states, calls Server Action |
| `src/app/actions/submitLead.ts` | NEW — Server Action: validates → reads UTM cookies → inserts to Supabase leads table |
| `src/lib/hooks/useCountUp.ts` | NEW — IntersectionObserver + requestAnimationFrame easeOut counter |
| `src/middleware.ts` | BUILT — UTM param capture (utm_source/medium/campaign/content/term → 30-day httpOnly cookies) |
| `src/app/case-study/page.tsx` | BUILT — full Ibn Sina story with challenge/solution/outcome sections |
| `src/app/contact/page.tsx` | BUILT — standalone contact page with form + direct contact |
| `src/app/privacy-policy/page.tsx` | BUILT — GDPR/PDPA-compliant policy |
| `src/app/demo/page.tsx` | BUILT — "coming soon" placeholder with WhatsApp CTA |
| `public/robots.txt` | NEW |
| `public/sitemap.xml` | NEW — 4 URLs |
| `src/types/index.ts` | UPDATED — `role` made optional, `interest` field added |

---

## Visual Quality Improvements (2026-06-16 session)

Working through a visual quality pass one section at a time. Build remains green after each change.

### Completed

**Hero.tsx** — 4 real DHV Workstation screenshots loaded into a crossfade carousel (3500ms interval, opacity-based crossfade). Mobile notification card repositioned with responsive Tailwind classes (`mt-6 lg:mt-0 lg:absolute lg:-top-5 lg:-left-5`) to prevent layout collapse.

**ProblemSection.tsx** — Rewrote animation from "one IntersectionObserver for all rows" to per-row `SpotlightRow` component with `useSpotlight()` hook. Three-state model per row: `unread` (dim, ~20% opacity) → `active` (full color) → `read` (settled at ~55% opacity). Problem cell (amber) activates immediately. Solution cell (teal/white) activates with a 300ms delay — user confirmed after initially choosing simultaneous. Both the solution text and the mobile "WITH DH PACS" label carry the 300ms delay. Observer uses `rootMargin: "-15% 0px -15% 0px"` to create a center spotlight zone.

**HowItWorks.tsx** — Replaced the flat simultaneous 4-card grid with a vertical timeline. Design decisions confirmed via `/grill-with-docs`:
- Left-edge line, all content to the right (B1)
- Static always-visible line at `#334155` — not animated (B1-a)
- Per-step `useEnterOnce()` hook (one-way: visible stays true once set)
- Dot starts `#334155`, transitions to `#0DA98A` with glow ring when step enters viewport
- Card slides in from `translateX(20px), opacity: 0` → `0, 1` with 80ms delay after the dot
- Line drawn as segment between dots per-step (flex column in the left column div) — no absolute positioning
- Decorative watermark step number (01–04) at 6% opacity top-right of each card
- `maxWidth: 760` on the timeline container for comfortable line lengths

**WhoItsFor.tsx** — Redesigned from 2×2 grid + bottom patient block. Design decisions confirmed via `/grill-with-docs`:
- Patient card: static full-width banner at the TOP of the section (not in carousel, not sticky)
- Patient card: teal gradient background, inline "See what they see →" link to live demo
- Four professional cards (Hospitals, Radiologists, Surgeons, Referring Doctors): peek carousel BELOW the patient card
- Carousel: active card at 85% width, next card peeking from the right (~15% visible)
- Auto-play at 4000ms, pauses on mouse hover (setPaused state on mouseEnter/mouseLeave)
- Dot indicators below carousel — active dot widens to 24px (pill shape), inactive dots 8px circles
- Track translation: `translateX(calc(${active} * -87%))` — 87% accounts for the 85% card + 20px gap
- Active card: full opacity, scale 1, teal left border (4px), teal border color
- Inactive cards: 55% opacity, scale 0.97, transparent left border — dimmed but peek is visible
- Clicking an inactive card navigates to it and resets the autoplay timer
- Each card has stat line at the bottom (teal text, separated by border-top from body)

**FeaturesOverview.tsx** — Replaced 10-card uniform grid with tabbed layout. Design decisions confirmed via `/grill-with-docs`:
- Full-width "Core Differentiator" hero block always visible above tabs: "Radiology Reports + DICOM Images — Together in One Link" with two badges ("Core Differentiator" teal tag, "Live at 5 Ibn Sina centers" with green dot)
- Two tabs: "For Clinicians" (4 features: Doctor Portal, Any Device Zero Install, Clinical-Grade Measurements, International Link Sharing) / "For IT & Admin" (5 features: Encrypted Transfer, Revocable Access Control, Full Audit Trail, Built to HIPAA Standards, Multi-Site Management)
- Cards in 2-col grid inside each tab; 5th IT card spans full width (`gridColumn: "1 / -1"`) centered at `maxWidth: 480`
- Tab switch triggers 180ms fade-out → swap content → fade-in (fading state with setTimeout)
- Section bg changed to `#0F172A` (was `#1E293B`) to break background collision with adjacent HowItWorks section
- Build passes cleanly after implementation

**CumillaTeaser.tsx** — New section inserted between FeaturesOverview and IbnSinaTeaser. Short story card format (no stats, no CTA). Leads with the India consultation story. Key decisions:
- Eyebrow: "First Installation" / H2: "The First Link Crossed a Border"
- Pull headline: doctor shared patient link with Indian hospital, got specialist consult same day
- Body: first deployment → 100+ patients inline callout (teal) → India consult incident as the moment that proved the product thesis
- Section bg: `#1E293B` (alternates with FeaturesOverview `#0F172A` above and IbnSinaTeaser `#0F172A` below)
- `CUMILLA_PATIENT_LINK` constant at top of file — placeholder using Ibn Sina demo link; replace when real Cumilla patient link is available
- IbnSinaTeaser eyebrow changed from "First Proof Point" → "Scaling Up"

### Still To Do (visual quality pass)

1. **IbnSinaTeaser pull quote** — Quote has no attribution (no name, no title, no hospital). Add attribution.
2. **Hero H1** — Line breaks feel accidental on some widths; font size could be larger on desktop.

---

## Contact Section Changes (2026-06-16)

- **WhatsApp number:** `8801971311282` (+880 1971 311282) — live in CtaSection.tsx, contact/page.tsx, demo/page.tsx
- **Cumilla in reassurance block:** "Running at Ibn Sina Hospital and Cumilla Medical College" — both CtaSection.tsx and contact/page.tsx
- **FeaturesOverview badge:** "Live at 2 hospital groups" (was "Live at 5 Ibn Sina centers")
- **ContactForm message field:** Free-text textarea added after interest dropdown. Label: "Anything you'd like to ask or tell us?" Optional. Stored in Supabase `message` column combined with interest selection (double newline separator).
- **Form notification:** Not configured — user will set up from Supabase dashboard directly.

---

## Known Issues / Notes

- **`middleware.ts` deprecation warning:** Next.js 16 renamed `middleware.ts` to `proxy.ts`. The warning appears on build but is non-fatal. Fix: `git mv src/middleware.ts src/proxy.ts` and rename the exported function from `middleware` to `proxy`. Cannot do this in-editor (file rename requires git).
- **Phone mockup in Hero:** Uses a styled dark panel representing the OHIF viewer. Replace by searching `// TODO: replace with real OHIF screenshot` in `Hero.tsx`.

---

## Remaining Pre-Launch Tasks

1. Replace Hero phone mockup with real de-identified OHIF screenshot
2. Add GitHub repo secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` for the ping workflow
3. Rename `middleware.ts` → `proxy.ts` via `git mv` to clear build warning
4. Deploy to Cloudflare Pages (Group G from original plan): create CF Pages project → connect GitHub → add env vars → connect domain `pacs.dhsolutions.com.bd`
5. Test contact form end-to-end in production: submit → confirm row appears in Supabase leads table
6. Test Open Graph: paste production URL into WhatsApp, confirm preview card renders
7. Add OG image (`public/og-image.jpg`, 1200×630px) — currently missing, WhatsApp preview will have no image until this is added

---

## Content Source

All website copy comes from `E:\DHS-PACS\docs\Architecture\DH_PACS_WEBSITE_CONTENT_SPEC.md` — this is the single source of truth (the 8 agreed content changes from the 2026-05-29 strategy session are already incorporated in the spec).
