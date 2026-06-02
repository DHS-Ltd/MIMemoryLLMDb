# CLAUDE.md

Multi-site teleradiology platform: DICOM images received centrally, served to patients via shareable mobile-friendly links (no app). Full docs in [Site01Docs/](Site01Docs/).

---

## Status — 2026-05-29

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Central server + gold-path rendering | ✅ 2026-05-19 |
| Phase A v1/v1.1 | OHIF fork, DHS branding, teal palette | ✅ 2026-05-20 |
| SITE01 | Local site setup + autolink.lua fixes | ✅ 2026-05-25 |
| Admin P1–P4 | Full admin panel (sites, patients, links, audit) | ✅ 2026-05-25/26 |
| GitHub Repo | Source at DHS-Ltd/dh-pacs-central | ✅ 2026-05-26 |
| Issue Tracker | Google Form → GitHub Issues via Apps Script | ✅ 2026-05-26 |
| Website Docs | Content blueprint + demo portal build guide | ✅ 2026-05-29 |

**Admin panel:** `https://pacs.dhsolutions.com.bd/admin` — creds from VM `.env`.
**Gold-path link:** `https://pacs.dhsolutions.com.bd/open?token=7729128b-13f7-4db4-ab4c-c041ce045f81` (AYESHA AKTER, MR lumbar spine, 29 series)

---

## Stack

| Container | Port | Role |
|---|---|---|
| `pacs-postgres` | 5432 int | DB (Orthanc index + app data) |
| `pacs-orthanc` | 8042 int, 4242 DICOM | PACS receive + DICOMweb |
| `pacs-backend` | 3000 | Express API (`src/routes/`) |
| `pacs-ohif` | static | OHIF viewer `pacs-ohif-dhs:v1.1` |
| `pacs-admin-ui` | static | React SPA at `/admin/` |
| `pacs-nginx` | 80 | Reverse proxy |
| `pacs-cloudflared` | tunnel | `pacs.dhsolutions.com.bd` HTTPS |

---

## Project Structure

```
.github/ISSUE_TEMPLATE/       # bug_report.md, feature_request.md, config.yml
deploy/
  backend/src/
    index.js                  # bootstrap + router mounts
    db.js orthanc.js          # pg Pool; axios to Orthanc REST
    middleware/               # auth.js (requireAdmin), rateLimit.js
    routes/                   # legacy, auth, sites, patients, studies, admin-links
    templates/                # instructions.js + vendor/*.md
  admin-ui/src/
    api/                      # client, auth, sites, patients, studies, links, dashboard
    auth/AuthGate.tsx
    components/               # Layout, NavSidebar, SeriesList, LinkManager,
                              # AdminOpenButton, InstructionsRenderer
    pages/                    # Login, Dashboard, SitesList, SiteDetail,
                              # SiteCreate, SiteInstructions, PatientsList, PatientDetail
  compose/                    # docker-compose.yml + .env.example (.env gitignored)
  config/                     # postgres/init.sql, orthanc/orthanc.json, nginx, ohif
  scripts/                    # autolink.lua, test_e2e.py
  cloudflared/                # config.yml
docs/
  DicomViewerCustomization/   # OHIF plan, next-steps, deploy logs
  260525_ServerSiteDocs/      # Admin panel user manual
tools/issue-tracker/          # Code.gs (Apps Script) + SETUP.md
```

**OHIF fork:** `git@github.com:DHS-Ltd/ohif-viewer-dhs.git` (private, branch `dhs-main`).
Windows: `D:\ohif-fork\`. VM: `/srv/pacs/ohif-fork/`. Image: `pacs-ohif-dhs:vN`.

---

## Key Commands

```bash
# SSH into VM
ssh -i C:/Users/Administrator/.ssh/pacsvm_ed25519 maidul@192.168.1.10

# Rebuild after source changes (restart is NOT enough — source baked into image)
cd /srv/pacs/compose
docker compose build backend && docker compose up -d backend
docker compose build admin-ui && docker compose up -d admin-ui

# OHIF rebuild
cd /srv/pacs/ohif-fork && git pull origin dhs-main
cd /srv/pacs/compose && docker compose build ohif && docker compose up -d ohif

# DB inspection
docker exec -it pacs-postgres psql -U pacs -d pacs

# Admin curl (cookie has domain=pacs.dhsolutions.com.bd — extract raw header)
TOKEN=$(curl -si -XPOST http://localhost/api/admin/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"...","password":"..."}' \
  | grep 'set-cookie' | grep -o 'admin_jwt=[^;]*')
curl -H "Cookie: $TOKEN" http://localhost/api/admin/sites
```

---

## Backend API

All `/api/admin/*` require `requireAdmin` (JWT httpOnly cookie `admin_jwt`, 8h, bcrypt).

| Method | Path | Notes |
|---|---|---|
| POST | `/api/studies/received` | Lua hook — upserts site/patient/study, mints link |
| GET | `/api/links/resolve/:token` | Patient token resolution |
| GET | `/api/v1/studies` | Frontend polling |
| POST | `/api/admin/auth/login` | Sets cookie |
| GET/POST | `/api/admin/sites` | List + create (monotonic AET allocator) |
| GET/PATCH | `/api/admin/sites/:id` | Detail + update/disable |
| GET | `/api/admin/sites/:id/instructions` | Server-rendered onboarding JSON |
| GET | `/api/admin/patients` | Paginated list (search by MRN/site) |
| GET | `/api/admin/patients/:id` | Detail + studies + link tokens |
| GET | `/api/admin/studies/:uid/series` | Live series from Orthanc |
| GET | `/api/admin/studies/:uid/open` | Logs `admin_view` audit → viewer URL |
| POST/DELETE | `/api/admin/links` | Generate / revoke share links |
| GET | `/api/admin/links/:token/audit` | Audit log for token |

**AET allocator:** `SITE01_ORTHANC`, `SITE02_ORTHANC`, … monotonic, never reuse. `SELECT … FOR UPDATE` prevents races.

---

## Database Schema

```sql
app.sites(id, aet UNIQUE, hospital_name, contact_name, contact_email, pacs_vendor,
          status[pending|active|unregistered|disabled], created_at, first_seen_at)
app.patients(id, site_id, site_pk→sites.id, external_patient_id,
             subscription_status, expiry_date)
app.studies(id, study_uid, patient_id, modality, study_date)
app.links(id, uuid_token, study_id, created_by, expires_at, revoked)
app.audit_log(id, link_token nullable, user_email, action, accessed_at)
-- action: view | admin_view | link_generate | link_revoke
```

---

## Nginx Routing

```
/admin/           → pacs-admin-ui   (variable proxy_pass — needs explicit rewrite, see below)
/api/*            → pacs-backend:3000
/dicom-web/*      → pacs-orthanc:8042
/open             → viewer.html
/demo             → demo.html (gateway landing page — planned, not yet deployed)
/demo-viewer/app-config.js → demo-app-config.js (nginx intercept — planned)
/demo-viewer/     → pacs-ohif with CloudFront demo data (planned, not yet deployed)
/                 → pacs-ohif (catch-all)
```

**Critical:** When `proxy_pass` uses a variable (`set $var host; proxy_pass http://$var/`), nginx does NOT strip the location prefix. Always add `rewrite ^/prefix/(.*)$ /$1 break;` above `proxy_pass`. The `/admin/` block in [deploy/config/nginx/nginx.conf](deploy/config/nginx/nginx.conf) does this correctly.

---

## Configuration (VM `/srv/pacs/compose/.env`)

```
POSTGRES_USER=pacs  POSTGRES_DB=pacs  POSTGRES_PASSWORD=dhmiPost
DATABASE_URL=postgresql://pacs:dhmiPost@postgres:5432/pacs
ADMIN_EMAIL=directhospitalsolutionsltd@gmail.com
ADMIN_PASSWORD_HASH=<bcrypt>   JWT_SECRET=<64-char hex>
COOKIE_DOMAIN=pacs.dhsolutions.com.bd
BASE_URL=https://pacs.dhsolutions.com.bd
CENTRAL_AET=PACS_CENTRAL   CENTRAL_TAILSCALE_IP=100.118.47.99
```

> `POSTGRES_USER=maidul` in older docs is wrong — `maidul` is the SSH user, not DB role.

---

## Known Issues

1. `/orthanc/` nginx route broken — falls to OHIF. Workaround: `http://localhost:8042` directly with Orthanc basic auth.
2. `modality`/`site_id` NULL for legacy studies (pre-fix Lua hook). OHIF still shows correct labels via DICOMweb.
3. Two series in E1027809 show yellow warning triangles — transcoding edge case, non-blocking.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `FATAL: role "maidul" does not exist` | Use `-U pacs -d pacs` |
| `psql: password auth failed` | `ALTER USER pacs WITH PASSWORD 'dhmiPost'` |
| Admin panel white page / JS returns HTML | Check nginx `/admin/` rewrite rule |
| Admin cookie ignored by curl | Cookie domain is `pacs.dhsolutions.com.bd`; extract raw `Set-Cookie` header |
| Backend changes not visible | `docker compose build backend` — restart alone is insufficient |
| Orthanc curl returns HTML | `/orthanc/` nginx route broken; hit `:8042` directly |

---

## Design Decisions

- **Two-channel:** Tailscale (DICOM) + Cloudflare Tunnel (patient HTTPS)
- **Monotonic AET:** never reuse slots; unknown AETs auto-create `unregistered` rows (no data dropped)
- **Audit separation:** `admin_view` distinct from patient `view`; does not inflate share-link counts
- **Token access:** UUID, no patient auth, optional expiry
- **Single Postgres:** Orthanc index + app data together
- **Polling not webhooks:** `GET /api/v1/studies?since=<ts>`

---

## Business Context

**Product:** DH PACS — **Company:** DH Solutions (brand names are distinct; use DH PACS in headlines, DH Solutions for legal/company references)

**Key client:** Ibn Sina Hospital — 7 DHV Workstations, 5 centers across Bangladesh. Primary social proof for all marketing. Confirm public naming permission before website launch; fallback: "5 centers of a leading Dhaka-based hospital chain."

**Market:** Bangladesh medical film market ৳14.6 billion/year. Source: `docs/Website/Value_proposition_mRayImaging_BD.pdf`. Use in hero headline and market vision sections.

---

## Docs Reference

| Need | File |
|---|---|
| Admin panel manual | [docs/260525_ServerSiteDocs/ADMIN_PANEL_USER_MANUAL.md](docs/260525_ServerSiteDocs/ADMIN_PANEL_USER_MANUAL.md) |
| OHIF customization | [docs/DicomViewerCustomization/OHIF_CUSTOMIZATION_PLAN.md](docs/DicomViewerCustomization/OHIF_CUSTOMIZATION_PLAN.md) |
| OHIF next steps | [docs/DicomViewerCustomization/NEXT_STEPS.md](docs/DicomViewerCustomization/NEXT_STEPS.md) |
| Hospital PACS config | [Site01Docs/HOSPITAL_IT_PACS_CONFIGURATION.md](Site01Docs/HOSPITAL_IT_PACS_CONFIGURATION.md) |
| Local site setup | [Site01Docs/LOCAL_SITE_BUILD_GUIDE.md](Site01Docs/LOCAL_SITE_BUILD_GUIDE.md) |
| Postgres auth fix | [Site01Docs/TROUBLESHOOTING_POSTGRESQL_AUTH.md](Site01Docs/TROUBLESHOOTING_POSTGRESQL_AUTH.md) |
| Architecture overview | [researchDocs/PROJECT_UNDERSTANDING_AND_ROADMAP.md](researchDocs/PROJECT_UNDERSTANDING_AND_ROADMAP.md) |
| Website content guide | [docs/Website/DH_PACS_WEBSITE_CONTENT_BLUEPRINT.md](docs/Website/DH_PACS_WEBSITE_CONTENT_BLUEPRINT.md) |
| Demo portal build guide | [docs/Website/DH_PACS_DEMO_PORTAL_BUILD_GUIDE.md](docs/Website/DH_PACS_DEMO_PORTAL_BUILD_GUIDE.md) |
