# DH PACS — Project Brief

## What This Is

**DH Solutions Ltd.** (company) builds **DH PACS** (product) — Bangladesh's cloud DICOM imaging platform, and the company's prime product. DHS operates four **Business Pillars**: **Build** (software — prime), **Service** (installation/maintenance/training), **Supply** (equipment), **Facility** (internal only, never named in content).

**What it does:** DICOM studies reach the cloud from the hospital — via an on-prem DHV Workstation (Enterprise) or by the hospital's existing PACS adding one outbound destination (Standard). The written radiology report is collected at the same time. Both are merged into one complete patient record. That record is then **post-processed for the surgeon's specific finding** and delivered two ways: to the surgeon's Doctor Dashboard, and to the patient as a unique secure link — viewable on any device, no app, no account.

**Current traction:** 7 DHV Workstations across 5 Ibn Sina centers (Enterprise); 5 centers in Cumilla (Standard).

---

## This Repo Is the Commercial Content Hub — Read Before Creating Marketing/Positioning Content

DH Solutions Ltd sells three products: **DH PACS** (this repo's home product), **DHV** (viewer — OHIF web + Weasis desktop, engineering repo `E:\DHV-Weasis`), and **DHDicomAnalyzerPro** (Slicer-based analysis tool, engineering repo `E:\DH-Advanced-Viewer`).

**Commercial Content** — marketing plans, positioning, pricing, official channel posts, pitch decks, customer proposals — for **any** of the three products belongs here, never in a product's own engineering repo. The test is content type, not audience: even an internal GTM/positioning note that only shapes an engineering decision still counts. Engineering/technical docs (architecture, build plans, technical ADRs) are NOT Commercial Content and stay in the product's own repo.

- DH PACS's own commercial content: top-level `docs/MarketingStrategy/`, `docs/DH_PACS_BRAND_VOICE.md`, `docs/research/`
- DHV commercial content: `docs/DHV/`
- DHDicomAnalyzerPro commercial content: `docs/DHDicomAnalyzerPro/`

Personal-brand content (Maidul's LinkedIn educator identity, CV) is the opposite direction — it belongs in `E:\Self_project\Personal_Branding`, not here. See `CONTEXT-MAP.md` and [ADR-0001](docs/adr/0001-dhs-pacs-as-commercial-content-hub.md) for the full reasoning.

---

## Critical Positioning — Read Before Writing Any Copy

> **Governing document:** `docs/MarketingStrategy/DHS_BRAND_STRATEGY.md` (2026-08-03). Read it before any positioning, persona, campaign, or proposal work. Pivotal decision: [ADR-0002](docs/adr/0002-serve-the-surgeon-not-the-radiologist.md). Vocabulary: `CONTEXT-MAP.md`.

- **We serve the SURGEON, not the radiologist.** The radiologist writes the report but does not treat the patient. The surgeon treats, and needs the study post-processed for his specific finding — which he cannot produce himself. The ~30 Bangladeshi reporting/teleradiology companies all serve the radiologist and compete on cost. The radiologist is a **deliberate non-persona**: their workflow is untouched, but they are not the customer and not the audience.
- **The category is the Advanced Connected Imaging Network.** *Advanced* = advanced post-processing (segmentation, 3D, vascular analysis, biomodeling). *Connected* = the bridge from study to surgeon to patient. *Network* = it compounds by catchment.
- **Patient ownership is the MECHANISM, not the claim.** It remains true, delivered, and stated in every piece — but it is no longer the headline. (This supersedes the former "new market category: the patient as complete owner of their imaging record.")
- **The chain:** CT/MRI patient → Advanced Post-Processing → DH PACS → Surgeon → Patient.
- **Brand the capability, not the engine.** Market "DH Advanced Post-Processing." The underlying engine (Inobitec now → DHDicomAnalyzerPro later) is a swappable implementation detail. Never claim to have built it; never conceal that a specialist engine is involved.
- DH PACS is **NOT** teleradiology or remote reporting. It does not read scans and does not report.
- The hospital's existing radiologist and PACS continue unchanged. DH PACS works alongside everything.
- Always emphasise: complete patient record = **DICOM images + written report, together**.
- HIPAA: phrase as **"built to HIPAA standards"** — accurate for the open-source stack. Do NOT say "HIPAA certified" (company certification is a roadmap item).
- Do NOT mention BDC diagnostic center or the fitness tracker project anywhere.
- The ৳14.6 billion film market figure comes from NBR import data (HS code 3701.10) — source it if used.
- **Credential discipline:** founder/engineering claims must trace to `E:\Self_project\Personal_Branding\Maidul_CV\CV_FACT_SHEET.md` — approx. **70 CT / 50 MRI / 20+ CathLab**. The LinkedIn figures (170 CT / 119 MRI) and the title "Regional Head Service Manager" are **NOT confirmed and must not be used**.

---

## Commercial Model

**Two tiers — describing deployment shape, not customer size.** A 24-centre chain may take Standard; an independent centre may take Enterprise.

| | **Standard** | **Enterprise** |
|---|---|---|
| Deployment | No hardware — existing PACS adds one outbound destination | Licensed on-prem DHV Workstation / Site Server |
| Installation | Free (labour) | Charged |
| Branding | DH PACS | Hospital-branded |
| Data | DH-operated cloud | On-prem, hospital-controlled |
| **Proof point** | **Cumilla** | **Ibn Sina** |

**Tier-matched proof — hard rule.** A proof point may only be cited for the tier it actually bought. **Never cross them.** Citing Ibn Sina to support free installation is false — Ibn Sina purchased workstation software *licences* (~300k BDT/unit). This supersedes the former "Ibn Sina in every first conversation" rule.

**Two revenue lines:**
- **Line 1 — per-patient link enrolment:** patient opts in, hospital bills it, hospital pays DHS per enrolled patient and keeps the spread. Low value, high volume.
- **Line 2 — Advanced Post-Processing licence:** sold to the hospital as a software licence (not per study). High value, lower volume. This is a **new billable clinical service** for the hospital.
- **The surgeon pays nothing.** The Doctor Dashboard is free by design — his role is to drive volume, not to be billed.
- Exact numbers live in the user's physical notebook — **never guess, never quote**.
- "Free installation" means free install *labour*. Because Line 2 is a licence, free installation can no longer carry the headline alone — **lead with the surgeon volume the licence unlocks**, and state free installation before any fee.
- **Patient data agreement:** Standard tier only. Hospital grants DHS data access, enabling future patient data restoration and a B2C channel. (Enterprise deals may forgo this — see ADR-0005.)

---

## Project Structure

```
E:\DHS-PACS\
├── dh-pacs-website/        ← Next.js 16 marketing website (see below)
└── docs/
    ├── Architecture/
    │   ├── DH_PACS_WEBSITE_CONTENT_SPEC.md   ← definitive design + copy reference
    │   └── DH_PACS_WEBSITE_ARCHITECTURE.md   ← technical infrastructure reference
    └── CRM/                ← CRM doctrine (schema, stages, build plan) — code lives outside this repo, see below
```

---

## Website — `dh-pacs-website/`

**Stack:** Next.js 16.2.6 · Tailwind CSS v4 · shadcn/ui · Supabase (PostgreSQL) · Cloudflare Workers (via `@opennextjs/cloudflare`)

**Key commands:**
```bash
npm run dev          # local dev server
npm run build        # production build (use to verify before committing)
npm run build:cf     # Cloudflare Workers build (opennextjs-cloudflare build)
npm run deploy:cf     # build + wrangler deploy (manual deploy; normally Workers Builds does this on push)
```

**Deployment:** This website deploys independently to **Cloudflare Workers** via **Workers Builds** (Cloudflare's native GitHub integration — auto-deploys on push to `main`, no GitHub Actions file needed). It is a separate system from "the Server" (the DICOM/patient-link platform — DHV Workstations + cloud ingest), which owns the `pacs.dhsolutions.com.bd` domain and has its own independent CI/CD. See `dh-pacs-website/CONTEXT.md` and `dh-pacs-website/docs/adr/0001-deploy-via-cloudflare-workers-not-pages-or-vm.md` for why classic Cloudflare Pages and the old VM/Docker deploy (formerly `DEPLOY.md`) were both rejected.

**Important Next.js 16 gotchas (read `node_modules/next/dist/docs/` for any unfamiliar API):**
- `src/middleware.ts` is intentionally **kept** (not renamed to `proxy.ts`) and pinned to `runtime: "experimental-edge"`. Next 16's `proxy.ts` is hard-locked to the `nodejs` runtime with no opt-out, but the Cloudflare Workers adapter (`@opennextjs/cloudflare`) refuses to build Node.js middleware — only Edge middleware is supported today. Do not "fix" this by renaming to `proxy.ts`.
- Server Actions use `"use server"` directive; forms call them via `useTransition`
- `cookies()` from `next/headers` must be awaited in Next.js 16

**Database:** Supabase at `https://tdvixhpnnljrhvhxsvzw.supabase.co` (Singapore). `leads` table stores contact form submissions with UTM attribution. Free tier — kept alive by `.github/workflows/supabase-ping.yml` (runs every 6h; requires `SUPABASE_URL` + `SUPABASE_ANON_KEY` as GitHub repo secrets).

**Environment variables:** Defined locally in `dh-pacs-website/.env.local` (gitignored). For Workers Builds, the same vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`) must be re-entered as environment variables/secrets in the Cloudflare dashboard for the Worker — they are not shared with local `.env.local` automatically. `NEXT_PUBLIC_SITE_URL` is a placeholder until a real domain is mapped (see pending item 6 below).

**Design system:** All brand tokens in `src/app/globals.css`. Palette is always dark — `#0F172A` page, `#1E293B` cards, `#0DA98A` teal accent. Shared classes: `.btn-primary`, `.btn-secondary`, `.eyebrow`, `.tag-badge`, `.form-input`, `.animate-in`.

**Content spec:** `docs/Architecture/DH_PACS_WEBSITE_CONTENT_SPEC.md` is the single source of truth for all copy, colors, layout, and animations. Read it before editing any section component.

**Pending before go-live:**
1. Replace `WHATSAPP_NUMBER = "8801XXXXXXXXX"` in `CtaSection.tsx`, `contact/page.tsx`, `product-demo/page.tsx`
2. Replace Hero phone mockup — find `// TODO: replace with real OHIF screenshot` in `Hero.tsx`
3. Add `public/og-image.jpg` (1200×630px) for WhatsApp link previews
4. Add GitHub secrets for Supabase ping workflow
5. In the Cloudflare dashboard: connect this GitHub repo via Workers Builds, add env vars (see below), confirm first deploy on the free `*.workers.dev` URL
6. Decide and map a real domain/subdomain for this website (NOT `pacs.dhsolutions.com.bd` — that belongs to the Server) once ready

---

## CRM — `E:\DHS-CRM\` (separate repo, doctrine lives here)

Tracks Accounts (centres — the only object with a deal stage) and Contacts (people — role P1–P6, never a stage) for real commercial relationships, plus a daily "Going Cold" nag so follow-ups don't silently die. **LIVE as of 2026-08-06.**

- **Doctrine** (glossary, stage sets, seeding rules, the reasoning): `docs/CRM/CONTEXT.md` and `docs/CRM/BUILD_PLAN.md`, this repo, per [ADR-0003](docs/adr/0003-crm-lives-in-three-layers.md) — a CRM is live operational data, not Commercial Content, so it gets its own category rather than living fully inside the Hub.
- **Running code**: `E:\DHS-CRM\` — see that repo's own `CLAUDE.md` for commands, deployment, and gotchas.
- **Records**: Notion only, never as files in either repo. Case evidence is de-identified at the door — case shape, never case identity — per [ADR-0004](docs/adr/0004-crm-holds-case-shape-not-case-identity.md).

**Phase gate: no capture bot until the nag has survived 3 weeks of real use (~27 Aug 2026).** Don't build Phase 2 before then — see the build plan for why.

**Known cleanup item:** `Marketing/Popular_Diagnostic/` (this repo) currently violates ADR-0004 — two PDFs carry a patient name in their filename and the proposal body carries a bill number. Not in git, not urgent, but fix before that folder is shared or reused as a template.

---

## Sales Context (for copy and strategy work)

**The door opener is the surgeon network**, not film replacement. Film cost is a supporting argument only. Full reasoning in `DHS_BRAND_STRATEGY.md` §6.

**Personas — priority order reflects the chain, not the invoice.** Full detail in `DHS_BRAND_STRATEGY.md` §10.

| | Persona | Role | Buys? |
|---|---|---|---|
| **P2** ⭐ | **Surgeon** | The engine — needs the post-processed study, cannot produce it, redirects patient flow | No (free dashboard) |
| **P6** ⭐ | **Medical Technologist** | Production capacity + co-development partner. DHS trains them; they become a switching cost | No |
| **P1** | **Centre Owner / MD** | The signature. 200–400 addressable independent centres | **Yes** |
| **P3** | **Chain Management** | Enterprise signature; produces reference names | **Yes** |
| **P4** | **Hospital IT / Biomedical** | Gatekeeper — satisfy, never sell to. If the answer is "DHS handles that, not you," say exactly that | No (can veto) |
| **P5** | **Counter / Billing Staff** | Executes Line 1. The silent failure point — needs a script card, not a brochure | No |

**Sales chain differs by tier.** The three-layer chain applies to **Enterprise only**:
1. **IT** → validates Tailscale VPN, confirms PACS is untouched
2. **Management** → business case, tier-matched proof, cost comparison
3. **Surgeons** → live demo on a real case, post-processed study in their hands

**Standard chain is shorter:** Owner → light IT touch (one outbound PACS destination) → counter staff. The surgeon relationship runs in **parallel** and is independent of the centre sale.

**Never conflate radiologists and surgeons.** They have opposite roles here: the radiologist is a deliberate non-persona; the surgeon is the primary target.

**GTM motion: centre-first sales, catchment compounding.** Sell only to centres, but cluster geographically — win one centre in a catchment, onboard its surgeons (dashboards populate on day one, no cold start), then approach competing centres in the same catchment whose referrers already expect prepared studies.

**Open risks (see `DHS_BRAND_STRATEGY.md` §12):** surgeon adoption is unproven (~1.4 doctors/centre at Cumilla — do not use the network claim in external copy until a proof pilot clears a target); two irreconcilable Cumilla numbers are live in customer documents; the "Advanced" capability currently rests on a reseller agreement.
