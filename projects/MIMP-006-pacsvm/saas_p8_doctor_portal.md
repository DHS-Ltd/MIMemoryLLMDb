---
name: saas-p8-doctor-portal
description: "Doctor portal backend + admin UI — LIVE on VM 2026-06-13. API, migration, admin panel pages all deployed."
metadata: 
  node_type: memory
  type: project
  originSessionId: dc36e067-b754-4f66-b127-5467b8ee3ecb
aliases: [saas-p8-doctor-portal]
---

# Doctor Portal — Phase 8 (Backend + Admin UI) — LIVE 2026-06-13

## What was deployed

**DB migration:** `2026-06_p8_doctor_portal.sql` — applied live. Tables: `app.doctor_users`, `app.doctor_sites`.

**Backend routes (5 new files):**
- `middleware/requireDoctor.js` — `doctor_jwt` cookie
- `routes/doctor-auth.js` — `POST /api/doctor/auth/login`, `GET /api/doctor/auth/me`, logout
- `routes/doctor-patients.js` — `GET /api/doctor/patients`, `GET /api/doctor/patients/:id`
- `routes/doctor-studies.js` — `GET /api/doctor/studies/:uid/open` → logs `doctor_view`, returns DHV URL
- `routes/admin-doctor-users.js` — CRUD + site assignment under `/api/admin/doctor-users`

**Admin UI (3 new pages):**
- `DoctorUsersListPage.tsx` — list with status filter, mobile card view
- `DoctorUserCreatePage.tsx` — register doctor, email+name+site checkboxes, shows DHDR-ID + temp password once
- `DoctorUserDetailPage.tsx` — detail + suspend/reactivate + inline site assignment editor

**Nav:** "Doctors" link added to Layout.tsx sidebar.

**nginx:** `/doctor/` location block added (same rewrite pattern as `/admin/` and `/patient/`).

**Docker Compose:** `doctor-ui` service added (context: `/srv/pacs/doctor-ui`). nginx `depends_on` updated.

## Test results on VM

- `POST /api/doctor/auth/login` bad creds → 401 ✓
- `GET /api/doctor/patients` bad JWT → 401 ✓
- `GET /admin/` → 200 ✓ (admin panel unaffected)
- nginx config test → ok ✓

## Doctor SPA — LIVE 2026-06-13

`dh-pacs-doctor` repo at `D:\dh-pacs-doctor`. Full SPA built and deployed:
- `pacs-doctor-ui` container running on VM
- `/doctor/` → login + dashboard + patient detail (React 18 + Vite, `basename="/doctor"`)
- `npm run build` clean (0 TS errors, 142 modules)
- Initial commit: `878a487` on `master`
- **Test:** `GET /doctor/` → 200, title "DH PACS — Doctor Portal" ✓
- CLAUDE.md in that repo documents full API contract + deploy workflow

**Deploy workflow (subsequent):**
```
scp -r src/ index.html vite.config.ts package*.json Dockerfile nginx.conf maidul@192.168.1.10:/srv/pacs/doctor-ui/
ssh maidul@192.168.1.10 "cd /srv/pacs/compose && docker compose build doctor-ui && docker compose up -d doctor-ui"
```

**Why:** Doctor portal backend is a prerequisite for the frontend SPA. Frontend lives in separate repo `dh-pacs-doctor` at `D:\dh-pacs-doctor`.
