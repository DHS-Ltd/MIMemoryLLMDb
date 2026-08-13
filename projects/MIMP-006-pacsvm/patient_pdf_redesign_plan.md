---
name: patient-pdf-redesign-plan
description: Patient Access Sheet redesign + support-phone settings surface + logo-upload bug fix — all LIVE on prod 2026-06-28
metadata: 
  node_type: memory
  type: project
  originSessionId: f9225d2c-2dae-479d-9cd4-82c2ce93cb03
---

Patient Access Sheet = `deploy/backend/src/lib/pdfGenerator.js` (`generatePatientPdf`). Two call sites stay in sync: `lib/archivePatientPdf.js` (archive at pixel arrival) and `routes/mt-studies.js` (on-demand fallback). Glossary terms in `CONTEXT.md`: "Patient Access Sheet", "App Setting", "Support Phone".

**Forward-only** (ADR 0003): PDFs archived write-once in `app.patient_pdfs` at Handoff, so design/data changes affect only studies handed off after deploy. No backfill.

## Redesign — LIVE (deployed earlier 2026-06-28)
Real `DHP_Logo_Wording.png` wordmark; no Patient-Info box (greet by name as hero + modality/site benefit line); hospital logo with name-fallback; credentials card is focal point with the study QR moved inside it; fixed step-4 expiry wording; navy `#0c3f75` + teal `#36918d`. Bangla + DICOM study-description still DEFERRED.

## Support Phone settings surface — BUILT + LIVE 2026-06-28
Admin-editable central help number in the sheet footer. **Folded into the admin Dashboard** (no new nav page), generic KV table.
- migration `2026-06_p9_app_settings.sql`: `app.app_settings(key PK, value, updated_at, updated_by)`. Applied on prod.
- `lib/settings.js` `getSetting(key, fallback)` — DB value (trimmed, non-empty) else fallback; never throws.
- `routes/admin-settings.js` GET/PUT `/api/admin/settings`, `requireAdmin`, key whitelist `['support_phone']`, `updated_by = req.admin.email`, empty clears override. Mounted in `index.js`.
- `pdfGenerator` now takes `supportPhone` as a **param** (6th arg); both call sites resolve `getSetting('support_phone', process.env.SUPPORT_PHONE)`. Precedence **App Setting → SUPPORT_PHONE env → "contact your hospital"**. Env still set on VM, so behaviour unchanged until an admin saves a value (which then overrides env).
- admin-ui: `api/settings.ts` + `SupportSettingsCard` on `DashboardPage.tsx`.

## Logo-upload bug — ROOT-CAUSED + FIXED 2026-06-28
Was NOT "missing UI" (the earlier note/handoff were wrong — the full uploader has existed in `SiteDetailPage.tsx` since commit daa5729, 2026-06-13, and the `POST /api/admin/sites/:id/logo` route was already on the VM). Real cause: **global `express.json()` defaults to a 100 KB body limit**, so any logo whose base64 body exceeded 100 KB got a 413 from body-parser before reaching the route (which allowed 512 KB). That's why the user "couldn't add a logo" for Ibn Sina. Fix (corrected after first attempt failed): a **route-scoped** parser does NOT work — the global `app.use(express.json())` runs first on every request and 413s the body before the router's own parser. **GOTCHA: a route-level `express.json({limit})` can never raise the limit past a smaller global parser registered ahead of it.** Working fix = a path-scoped 8 MB `express.json` registered in `index.js` BEFORE the global parser, gated on `req.method==='POST' && /^\/api\/admin\/sites\/\d+\/logo$/.test(req.path)`; body-parser sets `req._body` so the global parser then skips it. Global stays 100 KB everywhere else. Route handler enforces the 5 MB cap (user wanted ≥5 MB). Dropped `image/webp` from the UI accept list (pdfkit can't decode webp). nginx already `client_max_body_size 0`. Verified live: 400 KB body → logo route 401 (parsed, then auth), control route `POST /sites` → 413. Tradeoff: a large logo embeds into every archived PDF — keep uploads small or add downscaling later.

## Footer multi-page bug + logo placement — FIXED 2026-06-28
First real handoff on the new design (patient Rexona) came out **5 pages**. Root cause: redesign set the PDFDocument **bottom margin to 40**; PDFKit auto-inserts a page when any `text()` would render below `pageHeight − bottomMargin` (801.9pt), and the 3 absolutely-positioned footer lines sit at y≈797/815/827 — each spawned its own page. (The original generator used `bottom:0`, hence never hit this.) **GOTCHA: absolutely-positioned content below the bottom-margin line triggers PDFKit auto-paging even with `lineBreak:false`.** Fix: `doc.page.margins.bottom = 0` set immediately before the footer (keeps a 40pt safety for the flowing steps above). Verified pages=1 for both logo and name-fallback.
Logo placement: far-right co-brand confirmed (DH PACS left, hospital right edge). "REFERRING HOSPITAL" label now shown ONLY for the name fallback; a real logo renders caption-less, `fit:[170,54]`, valign center. pdfkit renders the uploaded PNG fine (colortype-6 RGBA).
**Two-Ibn-Sina-sites gotcha:** the uploaded logo is on **site id 9 "IBN Sina Cancer Diagnostic Center"**, but test patient Rexona (DHP-26062801) is on **site id 7 "IBN Sina Hospital, Dhanmondi" which has NO logo** — that's why the sheet showed the name, not a code bug. To see the logo on a given patient's sheet, the logo must be on THAT patient's site.
**Broken-archive cleanup:** Rexona's already-archived sheet (study_id 57) was the defective 5-page version; per a one-off exception to ADR 0003 (a broken sheet was never "validly handed over") deleted that single `app.patient_pdfs` row so it regenerates fixed on next reprint. The ≤8KB older rows are valid old-design archives, left frozen.

## Deploy facts
`/srv/pacs` is manual-sync (not git). scp'd 7 backend + 3 admin-ui files, applied migration via `docker exec -i pacs-postgres psql -U pacs -d pacs`, `docker compose build backend admin-ui && up -d`. Verified: backend healthy, `/api/admin/settings` → 401 (mounted+gated), deployed limits confirmed.

**COMMITTED 2026-06-28** on branch `feat/patient-pdf-redesign-settings` (commit f560ceb, 16 files) → **PR #2** open against `main`. Unrelated working-tree docs were deliberately left out. CI (`ci.yml`) only runs on push to `main`, so it fires when the PR merges — backend `npm test` (18/18 local) + admin-ui build (clean local). `deploy.yml` is **manual-dispatch only**, so merging does NOT auto-deploy (prod already hand-deployed; no drift). The p9 migration must be applied by hand on any other env (already done on prod).

## Remaining user QA (browser, can't be done from CLI)
Upload the hospital logo to the **same site the test patient belongs to** (logo currently only on site 9 Cancer Diagnostic Center; patients tested were on site 7 Dhanmondi). Then hand off a **fresh** patient on that site → confirm the hospital-logo branch renders on a 1-page sheet. Set Support Phone on Dashboard → confirm it overrides the env value in a newly generated (non-archived) sheet.

## Still deferred
Study description on sheet (#4: autolink.lua + migration + handler + both PDF sites), Bangla bilingual (#5: bundle Noto Sans Bengali TTF). Commit (#6) DONE — PR #2, awaiting merge. See [[decision-branding-logo]].
