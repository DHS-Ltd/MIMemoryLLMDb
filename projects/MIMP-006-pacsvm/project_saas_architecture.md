---
name: project-saas-architecture
description: "SaaS architecture decisions (2026-06-03) — MT-gated link flow, patient portal, DH PACS Workstation, ID formats, 4-phase build plan"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0d830bd0-02d2-424f-b27f-c10dc899e13e
aliases: [project-saas-architecture]
---

## SaaS Architecture — Finalized 2026-06-03

**Why:** Moving from passive auto-link generation to a controlled MT-mediated workflow where patient identity is captured before any link is generated. Core SaaS product is the patient dashboard portal (all studies under one login).

**How to apply:** When working on any new feature for patients, MTs, or the workstation, check this doc first. All 4 build guides are in `D:\Pacs_Viewer_Storage_Project\docs\260525_Admin_Frontend\Phases_Build\`.

---

## ID Formats

| Entity | Format | Example | Notes |
|---|---|---|---|
| Patient | `DHP-yymmdd{nn}` | `DHP-26060301` | 2-digit seq, resets daily |
| MT | `DHMT-yymmdd{nn}` | `DHMT-26060301` | same pattern |
| Patient login | mobile = username, DHP-ID = password | | 24h JWT cookie |
| MT login | mobile = username, DHMT-ID = password | | 8h JWT cookie |

---

## New DB entities (Phase 0)

- `app.patients`: +7 columns: `dh_patient_id`, `name`, `mobile`, `portal_password_hash`, `dob`, `gender`, `nid`
- `app.mt_users`: new table with `dh_mt_id`, `site_pk`, `name`, `mobile`, `password_hash`, `status`
- `app.sites`: +`link_mode` column (`'auto'` | `'mt_gated'`)
- `app.studies`: +`claim_status` (`'pending'` | `'linked'`), `claimed_by_mt`, `claimed_at`

---

## link_mode — per-site toggle

- `'auto'`: existing behaviour — autolink.lua triggers link on study arrival (SITE01, SITE03 stay here during transition)
- `'mt_gated'`: study created as `pending`, MT must claim via workstation before link exists
- Controlled via `PATCH /api/admin/sites/:id` + `LinkModeToggle` in admin panel

---

## New products

1. **dh-pacs-workstation** — local Express + React app at `localhost:3001`. MT workflow: pending queue → patient search/create → claim → PDF. Location: `deploy/workstation/`. Installed as NSSM Windows service.

2. **Patient Portal** — React SPA at `/patient/`. New container `pacs-patient-ui`. Patient login → all studies dashboard → OHIF viewer.

3. **Admin MT management** — Extension of existing `/admin/` panel. MT registration, KPI chart, `link_mode` toggle per site.

---

## Build sequence

| Phase | File | Status |
|---|---|---|
| P0 | `P0_DB_Schema_Migration.md` | ✅ DONE 2026-06-03 — see [[phase0-schema-migration]] |
| P1 | `P1_Backend_API_Layer.md` | ✅ DONE 2026-06-03 — see [[saas-p1-p2-implementation]] |
| P2 | `P2_Admin_Panel_MT_Management.md` | ✅ DONE 2026-06-03 — see [[saas-p1-p2-implementation]] |
| P3 | `P3_DH_PACS_Workstation.md` | ⏳ PENDING — separate repo `d:\dh-pacs-workstation` |
| P4 | `P4_Patient_Portal.md` | ✅ DONE 2026-06-04 — see [[saas-p4-implementation]] |

P0→P1 sequential. P2, P3, P4 can start in parallel after P1. Only P3 remains.

---

## Patient portal URL

`pacs.dhsolutions.com.bd/patient/` — same domain, new nginx `location /patient/` block + new `pacs-patient-ui` container. Uses variable `proxy_pass` + `rewrite` (same pattern as `/admin/`).

---

## Migration strategy for live sites

SITE01 and SITE03 stay on `link_mode='auto'` until dh-pacs-workstation is deployed there and MTs are trained. Admin flips `link_mode` per-site via admin panel — no code deploy required to activate.
