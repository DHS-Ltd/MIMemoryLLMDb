---
name: admin-frontend-build-status
description: "Admin frontend + site registry — ALL 4 PHASES COMPLETE as of 2026-05-25"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0d830bd0-02d2-424f-b27f-c10dc899e13e
---

## Current Status (2026-05-25) — ALL PHASES COMPLETE ✅

**Phase 1 — Registry plumbing:** COMPLETE ✅
- `app.sites` table, `site_pk` FK on patients, nullable audit_log.link_token + user_email column
- Backend `POST /api/studies/received` upserts sites, flips pending→active on first DICOM
- Monotonic AET allocator: SITE01_ORTHANC, SITE02_ORTHANC, … (never reuse)

**Phase 2 — Admin shell + auth:** COMPLETE ✅
- JWT auth: httpOnly `admin_jwt` cookie, 8h, bcrypt password, rate-limited login
- React admin-ui (Vite + TS + @tanstack/react-query v5): Login, Dashboard, SitesList, SiteDetail
- pacs-admin-ui container → nginx /admin/ → browser

**Phase 3 — Onboarding UX:** COMPLETE ✅
- SiteCreatePage → POST /api/admin/sites → auto-assigned AET → navigates to instructions
- SiteInstructionsPage — 8-section printable guide; substitutes {{AET}}, {{CENTRAL_AET}}, {{CENTRAL_TAILSCALE_IP}}
- Vendor markdown in deploy/backend/src/templates/vendor/{agfa,ge,siemens,philips,other}.md
- `GET /api/admin/sites/:id/instructions` returns structured JSON rendered by frontend

**Phase 4 — Patients + links:** COMPLETE ✅
- `GET /api/admin/patients` — paginated list with search (MRN/site) — 3 patients verified
- `GET /api/admin/patients/:id` — detail with full study list including link tokens
- `GET /api/admin/studies/:uid/series` — live from Orthanc (29 series verified for AYESHA AKTER)
- `GET /api/admin/studies/:uid/open` — logs admin_view (user_email tagged), returns viewerUrl
- `POST /api/admin/links` — generate share link (admin-attributed)
- `DELETE /api/admin/links/:token` — revoke
- `GET /api/admin/links/:token/audit` — access log
- PatientsListPage, PatientDetailPage, SeriesList (expandable), LinkManager (copy/revoke/audit), AdminOpenButton
- admin_view audit verified: action='admin_view', user_email='directhospitalsolutionsltd@gmail.com' in DB

## Key gotchas found during build
- react-query v5: no `keepPreviousData` option (v4 API); `as Parameters<typeof useQuery>[0]` cast breaks type inference
- Backend rebuild required (not just restart) — source baked into image, not bind-mounted
- Cookie domain `pacs.dhsolutions.com.bd` → curl localhost tests fail silently; use raw Set-Cookie header extraction for VM-side testing
- SSH key must be in authorized_keys on VM; pacsvm_ed25519 key fingerprint: ED25519 SHA256:Dwc+4sKCty0jl3f0BvDL8XoeMlNe18wDiEWt6ndcLEZiR0

## Key Config Values (on VM at /srv/pacs/compose/.env)
- ADMIN_EMAIL=directhospitalsolutionsltd@gmail.com
- ADMIN_PASSWORD=dhsadmin (plaintext — hash stored as ADMIN_PASSWORD_HASH in .env)
- JWT_SECRET=a163268673dee56e82ceb67961e5c09a71e4276884b38512c67eaba3d7f75cff
- POSTGRES_PASSWORD=dhmiPost (manually set via ALTER USER; .env was stale with old value)
- DATABASE_URL=postgresql://pacs:dhmiPost@postgres:5432/pacs (added to .env explicitly)

## Architecture on VM
- /srv/pacs/backend/ — Node.js Express API (refactored into routes/)
- /srv/pacs/admin-ui/ — React SPA (Vite build, served by nginx:alpine container)
- /srv/pacs/compose/docker-compose.yml — 8 services including new pacs-admin-ui
- /srv/pacs/config/nginx/nginx.conf — has /admin/ location block + resolver 127.0.0.11

**Why:** Operators had no UI for daily work — couldn't register sites, see patients, or manage links without SSH+SQL.
**How to apply:** When working on admin routes or pages, phases 3 and 4 are the remaining work. Phase 3 is next.
