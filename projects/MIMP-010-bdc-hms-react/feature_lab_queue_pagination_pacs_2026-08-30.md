---
name: feature-lab-queue-pagination-pacs
description: "Lab Queue windowing/pagination + search + copyable fields + per-line DH PACS link tracking — 2026-08-30, deployed v2.4/@56, grilled via /grill-with-docs, not yet user-tested live"
metadata: 
  node_type: memory
  type: project
  originSessionId: d53884e3-6aab-4431-8120-ee3976be8b09
  modified: 2026-08-30T15:37:27.263Z
---

Overhauled the Lab_Tech `LabQueue.jsx` page after a full `/grill-with-docs` design session (8 questions asked/answered, grounded in real sheet data pulled via the Drive connector). See `docs/adr/0004-lab-queue-windowing-and-pacs-tracking.md` and the **PACS Upload / PACS Link** term in `CONTEXT.md` for the durable reasoning — this memory covers session specifics.

**Root cause found before building anything:** `getLabQueue()` in `Code.gs` read `Invoice_LineItems` (8,964 rows) **twice** per call (two separate loops building `lineCountMap` and `lineDetailMap`), plus shipped every invoice ever created since the 2026-04-15 cutover (2,872 active rows, ~2,823 already Delivered) on every single page load. Frontend-only pagination would not have fixed this — the GAS call itself was the bottleneck.

**Real volume, measured from the live `BDC_Database` sheet (not guessed):** ~25-27 invoices/day and climbing. 49 open (Pending+Sample Collected) at measurement time, ~752 Delivered in the last 30 days.

**What shipped:**
- `getLabQueue()`: single-pass `Invoice_LineItems` read; response windowed to all open work (uncapped) + Delivered from last 30 days (`LAB_QUEUE_DELIVERED_WINDOW_DAYS` constant).
- `getLabInvoiceSuggestions()` (previously written but never wired into `doPost` — same dead-code pattern as `Doctors_Agents` helpers) now wired as `searchLabInvoices`, extended to match patient name/phone (not just InvoiceID), and its `excludeStatuses:['Delivered']` removed since search's whole purpose is finding invoices that aged out of the window.
- `submitLabResults()`: new optional per-line `PacsUploaded`/`PacsLink` fields written via the existing `updateLineItemFields_()` helper (reused as-is). New `ensureSheetColumns_()` helper (generalizes the auto-add-column pattern already used in `savePatient`/`updatePatientRecord`) auto-creates the `PacsUploaded`/`PacsLink` columns on `Invoice_LineItems` and the `PacsLinks` column on `Patients`.
- New `appendPatientPacsLink_()`: appends to a comma-separated `PacsLinks` column on the patient's row — mirrors the existing `ReportUrl` array-in-a-cell convention. Only appends when the submitted link differs from what's already stored for that line (compared server-side against the pre-submit value) — resubmitting an unchanged line does not inflate the count. This is a one-way log; unchecking/clearing a line later does not remove its past entry.
- `getLabInvoiceDetail()`: line items now also return `pacsUploaded`/`pacsLink` so `ResultDrawer` can pre-fill.
- `LabQueue.jsx`: default tab changed from "সব" to "নমুনা বাকি" (Pending); "সব" tab now group-sorts Pending→Sample Collected→Delivered (stable sort preserves each group's existing date-desc order); page-size selector (20/50/100, persisted in `localStorage['bdc_lab_queue_page_size']`), client-side paginated; new debounced (300ms, matches `PatientSearch.jsx` convention) search box that replaces the tab/grid view while active; tap-to-copy icons (`CopyField`) next to patient name and phone on every card.
- `ResultDrawer.jsx` → `TestResultRow`: optional PACS checkbox + link input per test line, shown uniformly on every line (not restricted by test category — `Test_Catalog.Category` values are too inconsistently spelled to auto-detect imaging tests reliably, e.g. `XRay (Radiology & Imaging)` / `X-RAY` / `USG` / `U.S.G` / `ULTRASONOGRUM REPORT` all coexist). Submit payload now also sends `patientId` (already available from `getLabInvoiceDetail`, avoids an extra backend sheet read to look it up).

**Explicitly out of scope this session (by design, not oversight):** no UI to browse/count a patient's PACS link history yet — data is written correctly (sheet-only) so it's queryable now; a dedicated view is a natural fast-follow once real data exists to design against.

**Lint note:** hit a new `react-hooks/set-state-in-effect` ESLint rule on the page-reset-on-tab-change logic. Fixed using React's documented "adjust state during render" pattern (compare a derived key against a `prevKey` state, call `setState` directly in the render body when it differs) instead of `useEffect(() => setPage(1), [deps])`. Found the same rule already failing on **pre-existing, untouched** code in `ResultDrawer.jsx`'s result-seeding effect (confirmed via `git stash` — it failed identically before this session's changes) — left alone as out of scope, not something this session broke.

**Verification gap — flag this to the user before trusting it blindly:** No live browser testing was possible this session (Playwright MCP bridge extension not installed in this environment) and a direct curl smoke-test against the production GAS URL was blocked by the Bash sandbox classifier. Verification was limited to `npm run build` + `eslint` passing clean, plus careful manual code review against the real backend helper functions (`updateLineItemFields_`, `updatePatientRecord`'s auto-add-column pattern) they were modeled on. **The user should manually click through the Lab Queue page (pagination, search, PACS checkbox+link, copy icons) before fully trusting this in daily use.**

**Deployed:** `E:\v1-BdcHmsApp\Code.gs` via `clasp push` + `clasp deploy --deploymentId AKfycbw4d9j5tksjXz_cjKIEjseraFUTNAQYKfEOtOSRNNOd4aa5YUCxS089irUrjWekHHYUFQ` → v2.4 / `@56`. Frontend committed (`0e6d45e`) and pushed to `origin/main` → Cloudflare Pages auto-deploy triggered. Neither has been confirmed working against real production traffic by the user yet as of this writing.

Note (2026-09-17): the "no browser tooling" blocker above was solved — local Chrome/Edge can be driven headless from Bash, see [[headless-browser-verification]]. The PACS work here could now be verified that way.
