---
name: dh-pacs-website-build
description: "DH PACS marketing website build progress — tech stack, repo location, what is done, and what remains for Phase 1"
metadata: 
  node_type: memory
  type: project
  originSessionId: d8460f58-4103-477c-afa8-336658927641
---

## Build Status: Phase 1 In Progress (Groups A–C complete, D–G remaining)

**Why:** Marketing website for DH PACS at pacs.dhsolutions.com.bd. Lead generation and sales intelligence platform — no direct sales, only CTAs. Full architecture doc at E:\DHS-PACS\docs\Architecture\DH_PACS_WEBSITE_ARCHITECTURE.md.

---

## Key Locations

| What | Where |
|---|---|
| Website source code | `E:\DHS-PACS\dh-pacs-website\` |
| GitHub repo | `https://github.com/DHS-Ltd/DH-PACs-Solutions.git` (private) |
| Architecture doc | `E:\DHS-PACS\docs\Architecture\DH_PACS_WEBSITE_ARCHITECTURE.md` |
| Supabase project URL | `https://tdvixhpnnljrhvhxsvzw.supabase.co` |
| Supabase region | Singapore (ap-southeast-1) |

---

## Tech Stack Decisions (all confirmed)

- **Framework:** Next.js 16.2.6 (App Router, SSG)
- **Hosting:** Cloudflare Pages (domain already on Cloudflare)
- **Cloudflare adapter:** `@opennextjs/cloudflare` v1.19.11 (NOT `@cloudflare/next-on-pages` — Next.js 16 compatibility)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix component library, Nova preset)
- **Database:** Supabase Cloud Free tier (PostgreSQL)
- **Domain:** `pacs.dhsolutions.com.bd` (already on Cloudflare — 2-click connection)
- **Site structure:** Hybrid — long scroll homepage + separate pages for `/case-study`, `/contact`, `/privacy-policy`, `/demo`

---

## Environment Variables (.env.local — never committed)

```
NEXT_PUBLIC_SUPABASE_URL=https://tdvixhpnnljrhvhxsvzw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[in .env.local]
SUPABASE_SERVICE_ROLE_KEY=[in .env.local — server only]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GTM_ID=[empty — GTM to be set up later]
```

For Cloudflare Pages deployment, these same variables must be added in the Cloudflare Pages dashboard under Settings → Environment Variables.

---

## Supabase Database

**Table: `leads`** — created and live.
- Stores all contact form submissions with full UTM attribution
- RLS policies applied: anon can INSERT only, authenticated can SELECT and UPDATE
- Funnel stages: `form_submitted` (auto) → `contacted` → `it_validated` → `management_meeting` → `clinical_demo` → `proposal_sent` → `won`/`lost` (manual)

**Supabase free tier pause risk:** Pauses after 1 week of inactivity. Fix: add GitHub Actions ping job (not yet done — add at start of next session).

---

## Project Folder Structure

```
src/
├── app/
│   ├── layout.tsx, page.tsx, globals.css (scaffold)
│   ├── case-study/page.tsx     (placeholder)
│   ├── contact/page.tsx        (placeholder)
│   ├── privacy-policy/page.tsx (placeholder)
│   └── demo/page.tsx           (placeholder)
├── components/
│   ├── ui/button.tsx           (shadcn)
│   ├── layout/Header.tsx       (placeholder)
│   ├── layout/Footer.tsx       (placeholder)
│   ├── sections/Hero.tsx       (placeholder)
│   ├── sections/HowItWorks.tsx (placeholder)
│   ├── sections/IbnSinaTeaser.tsx (placeholder)
│   ├── sections/FeaturesOverview.tsx (placeholder)
│   ├── sections/CtaSection.tsx (placeholder)
│   └── forms/ContactForm.tsx   (placeholder)
├── lib/
│   ├── utils.ts                (shadcn)
│   ├── supabase.ts             (browser anon client)
│   └── supabase-admin.ts       (server-only service role client)
└── types/index.ts              (Lead interface defined)
```

---

## Remaining Work (Phase 1)

### First thing next session
- Add GitHub Actions ping job to keep Supabase free tier alive (`.github/workflows/supabase-ping.yml`)

### Group D — Website Build (main work)
All components are placeholders. Build in this order:
1. `src/app/layout.tsx` — root layout wiring Header + Footer
2. `src/components/layout/Header.tsx` — nav with logo, links, WhatsApp CTA button
3. `src/components/layout/Footer.tsx` — links, contact, privacy policy
4. Homepage sections in order: Hero → HowItWorks → IbnSinaTeaser → FeaturesOverview → CtaSection
5. `src/app/page.tsx` — assembles all sections
6. `src/app/contact/page.tsx` + `ContactForm.tsx` — WhatsApp CTA + Supabase form
7. `src/app/case-study/page.tsx` — full Ibn Sina story
8. `src/app/privacy-policy/page.tsx`
9. `src/app/demo/page.tsx` — placeholder for demo portal

### Group E — Tracking
- GTM script in layout.tsx (once GTM account created)
- UTM middleware (`src/middleware.ts`) — captures utm_* params on first visit, stores in cookie
- Client-side behavioral events (section_view, cta_click via GA4)

### Group F — SEO
- Metadata (title, description, Open Graph) per page
- Schema.org on homepage (MedicalOrganization + SoftwareApplication)
- `sitemap.xml` + `robots.txt`

### Group G — Deployment
- Create Cloudflare Pages project → connect GitHub repo
- Add environment variables in Cloudflare Pages dashboard
- Connect domain `pacs.dhsolutions.com.bd`
- Deploy and verify

---

## Content Source

All website copy comes from:
- `E:\DHS-PACS\docs\DH_PACS_WEBSITE_CONTENT_BLUEPRINT.md` (apply 8 agreed changes — see [[dh-pacs-website-decisions]])
- `E:\DHS-PACS\docs\DH_PACS_CUSTOMER_CONNECTION_GUIDE.md` (marketing angles and messaging)

Design direction: dark navy/teal palette, tagline "From Scan to Screen — Instantly."

**How to apply:** At the start of the next session read the blueprint and the 8 agreed changes before writing any page content.
