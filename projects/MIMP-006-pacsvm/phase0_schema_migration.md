---
name: phase0-schema-migration
description: "SaaS Phase 0 DB migration applied to live VM 2026-06-03. Adds patient identity fields, mt_users, link_mode, claim tracking. Unblocks P1 Backend API."
metadata: 
  node_type: memory
  type: project
  originSessionId: cde41700-1ca7-4c95-af38-802a60e18884
---

Phase 0 schema migration for the SaaS Admin Frontend build was applied to the live VM (`pacs-postgres` container) on 2026-06-03. Spec: [docs/260525_Admin_Frontend/Phases_Build/P0_DB_Schema_Migration.md]. All changes are additive and idempotent; no backend, Lua, or frontend code was touched.

**Why:** Phase 1 (Backend API) immediately depends on `dh_patient_id`, `mt_users`, `link_mode`, and `claim_status`. Without Phase 0 in place, P1 cannot build ID generators, MT/patient auth, the pending-queue endpoint, or the `link_mode` branch in `POST /api/studies/received`. SITE01 (Ibn Sina) and SITE03 (Cumilla) must keep auto-linking — handled via `link_mode DEFAULT 'auto'`.

**How to apply:** Subsequent phase work (P1+) may now query/insert against:
- `app.patients`: `dh_patient_id` (UNIQUE, format `DHP-yymmdd{nn}`), `name`, `mobile` (UNIQUE, portal login), `portal_password_hash`, `dob`, `gender` (CHECK M/F/O), `nid`
- `app.mt_users` (new table): `dh_mt_id` (UNIQUE, format `DHMT-yymmdd{nn}`), `site_pk` → sites, `mobile` (UNIQUE, workstation login), `password_hash`, `status`, `created_by`
- `app.sites.link_mode` ∈ {`auto`, `mt_gated`} — branch in `POST /api/studies/received`
- `app.studies.claim_status` ∈ {`pending`, `linked`} (default `linked`), `claimed_by_mt` → mt_users, `claimed_at`

**Verified state at apply time:**
- Baseline & post counts identical: patients=4, studies=7, sites=4, links=8
- All 4 sites (SITE01_ORTHANC, SITE02_ORTHANC, SITE03_ORTHANC, `unknown` placeholder) have `link_mode='auto'`
- All 7 existing studies have `claim_status='linked'`
- Gold-path token `7729128b-…f81` (AYESHA AKTER) still resolves 200 post-migration
- Admin panel + backend healthy; no route or query referenced the new columns

**Backup taken before migration:**
- VM: `/tmp/pacs_pre_p0_20260602_175706.dump` (117K, pg_dump custom format)
- Local copy: `D:\Pacs_Viewer_Storage_Project\backups\pacs_pre_p0_20260602_175706.dump`
- Rollback SQL: P0 doc lines 315–337

**Persisted to source:** combined migration block appended to [deploy/config/postgres/init.sql] for future fresh deploys. Committed locally as `4c56c4a` (`schema(p0): patients identity, mt_users, link_mode, study claim tracking`); not pushed to origin/main — user to push after review.

**Constraints kept:** `autolink.lua`, all backend routes, `db.js` untouched. SITE01 + SITE03 still on auto. No live behavior change.

Related: [[saas-architecture-decisions]], [[reference-postgres-credentials]], [[project-completion-status]].
