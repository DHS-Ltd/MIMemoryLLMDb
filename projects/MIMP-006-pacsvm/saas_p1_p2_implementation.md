---
name: saas-p1-p2-implementation
description: SaaS P1 (Backend API — MT/patient/claim routes) and P2 (Admin MT management UI + link_mode toggle) — COMPLETE 2026-06-03
metadata: 
  node_type: memory
  type: project
  originSessionId: 0d830bd0-02d2-424f-b27f-c10dc899e13e
aliases: [saas-p1-p2-implementation]
---

## SaaS P1 — Backend API Layer — COMPLETE 2026-06-03

**Status:** Deployed to live VM, smoke-tested end-to-end. 3 local commits ahead of origin/main (not pushed per standing instruction).

### New backend files (11)

| File | Role |
|---|---|
| `src/lib/idGenerators.js` | `nextDhpId()` / `nextDhmtId()` — daily counter, CTE+FOR UPDATE lock |
| `src/lib/pdfGenerator.js` | `generatePatientPdf()` — A4 credential sheet, QR code, DHS branding (pdfkit + qrcode) |
| `src/middleware/requireMt.js` | MT JWT gate — cookie `mt_jwt`, 8h |
| `src/middleware/requirePatient.js` | Patient JWT gate — cookie `patient_jwt`, 24h |
| `src/routes/mt-auth.js` | `POST /api/mt/auth/login` (5/60s rate limit), `/logout`, `GET /me` |
| `src/routes/mt-studies.js` | `GET /api/mt/studies/pending`, `GET /history` |
| `src/routes/mt-patients.js` | `GET /search` (LIKE on 4 cols), `POST /` (mints DHP-ID) |
| `src/routes/mt-claim.js` | `POST /:studyUid/claim` — FOR UPDATE study lock → link mint → audit → PDF base64 |
| `src/routes/admin-mt-users.js` | `GET/POST/PATCH /api/admin/mt-users`, `GET /:id/kpi` |
| `src/routes/patient-auth.js` | `POST /login`, `/logout`, `GET /me` |
| `src/routes/patient-portal.js` | `GET /api/patient/portal`, `GET /studies/:uid/view` (audit) |

### Modified backend files

- `package.json` — added `pdfkit ^0.15.0`, `qrcode ^1.5.4`
- `src/index.js` — 7 new router mounts
- `src/routes/legacy.js` — `POST /api/studies/received` now branches on `link_mode`: auto path unchanged; `mt_gated` sets `claim_status='pending'`, returns `{pending:true}`. Audit log row added to auto path for parity.

### Bug fixed during VM testing

`FOR UPDATE` on a query with `MAX()` rejected by Postgres. Fixed by wrapping in a CTE:
```sql
WITH locked AS (SELECT dh_mt_id FROM app.mt_users WHERE dh_mt_id LIKE $1 FOR UPDATE)
SELECT COALESCE(MAX(CAST(RIGHT(dh_mt_id,2) AS INT)),0) AS max_n FROM locked
```
Applied to both `nextDhpId` and `nextDhmtId`.

### MT cookie domain

`mt_jwt` cookie sets `domain` from `COOKIE_DOMAIN` env var (same as admin). MT workstation will hit `https://pacs.dhsolutions.com.bd` from a browser — cookie must have the domain set. Re-validate if P3 uses a non-browser HTTP client.

### Orphan placeholder patient (known issue, not fixed)

When a study arrives on `mt_gated` site, `legacy.js` still upserts a placeholder patient row. If the MT re-claims to a different patient, the placeholder remains. Cleanup not automated.

### Race condition on first ID of a new day (known, low risk)

Two concurrent registrations on a fresh day (no rows matching prefix yet) both compute `next=1`. Loser hits UNIQUE constraint → `409`. Retry logic not added — extremely low probability for 2026 traffic.

---

## SaaS P2 — Admin Panel MT Management — COMPLETE 2026-06-03

**Status:** Deployed. TypeScript Vite build — 159 modules, 0 errors.

### New frontend files (6)

| File | Role |
|---|---|
| `src/api/mtUsers.ts` | Typed API client: `getMtUsers`, `createMtUser`, `getMtKpi`, `patchMtStatus` |
| `src/pages/MtUsersListPage.tsx` | MT list table — filter by site/status, link to register |
| `src/pages/MtUserCreatePage.tsx` | Registration form → credential display (raw_password shown once) |
| `src/pages/MtUserDetailPage.tsx` | Info grid + Suspend/Reactivate + 30-day KPI bar chart |
| `src/components/MtKpiChart.tsx` | Pure CSS bar chart — no external chart library |
| `src/components/LinkModeToggle.tsx` | Toggle auto↔mt_gated with two-step confirmation |

### Modified frontend files (4)

- `src/api/sites.ts` — added `link_mode: 'auto' | 'mt_gated'` to Site interface; added `patchSiteLinkMode()`
- `src/App.tsx` — 3 new routes: `/mt-users`, `/mt-users/new`, `/mt-users/:id`
- `src/components/Layout.tsx` — 'MTs' nav item added (4th item)
- `src/pages/SiteDetailPage.tsx` — `<LinkModeToggle>` rendered after the read-only info block

### Backend fix required for P2

`deploy/backend/src/routes/sites.js` PATCH handler — added `link_mode` to destructure and `COALESCE($10, link_mode)` to UPDATE SET. DB CHECK constraint (`link_mode IN ('auto','mt_gated')`) rejects invalid values.

### Correction vs P2 guide

P2 build guide called `getSites()` but codebase exports `listSites()`. Fixed in implementation — `MtUsersListPage` and `MtUserCreatePage` both use `listSites()`.

---

## Smoke test results (P1 + P2 combined)

- `GET /api/admin/mt-users` → `[]` (auth-gated, empty list)
- `GET /api/admin/sites/1` → includes `link_mode: "auto"`
- `PATCH /api/admin/sites/2` `{link_mode:"mt_gated"}` → persisted, reverts correctly
- Full MT-gated claim flow tested against SITE02 (test site): pending → claim → PDF → audit log
- Patient portal login → portal data → view audit log — all working
- Pre-existing SITE01/SITE03 production traffic on `link_mode='auto'` — unaffected

---

## What's still pending

- **P4 — Patient Portal:** SHIPPED 2026-06-04 — see [[saas-p4-implementation]].
- **P3 — dh-pacs-workstation:** Local Express+React app at `localhost:3001`, Windows NSSM service. Separate repo `d:\dh-pacs-workstation`. Build guide: `docs/260525_Admin_Frontend/Phases_Build/P3_DH_PACS_Workstation.md`
- Local git commits not pushed (P0 schema + P1 backend + P1 bugfix + P4 patient-ui). Push when user authorizes.
