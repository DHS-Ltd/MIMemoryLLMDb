---
name: project_study_purge
description: "Study purge lifecycle — v2 two-stage Schedule→Purge LIVE on VM 2026-06-12. v1 purge (ADR 0002) partially superseded by ADR 0006."
metadata: 
  node_type: memory
  type: project
  originSessionId: 5e66b66b-5a69-4a0c-a6fd-fd063f958c8f
aliases: [project-study-purge]
---

## Status: LIVE on VM — deployed 2026-06-12

Migration applied, backend + admin-ui rebuilt and running. All 6 new API routes confirmed (401-gated). Core logic tested end-to-end inside the container.

---

## v2 Two-Stage Lifecycle (ADR 0006)

### Stage 1 — Schedule
Admin marks a study (per-study) or all studies of a patient (per-patient). Stamps `purge_scheduled_at` + `purge_scheduled_by`. Pixels stay in Orthanc; links keep working. 15-day countdown. Admin sees a "scheduled · Nd left" badge (amber → red at ≤3 days).

During the window:
- **Cancel** (`DELETE /schedule`) — clears scheduled columns, study returns to live
- **Finalize Now** (`POST /finalize`) — executes Stage 2 immediately (skip window)
- Both blocked if `claim_status = 'under_review'`

### Stage 2 — Purge (irreversible)
Triggered by: nightly sweep (backend `setInterval` 24h) after 15 days, or Finalize Now, or Delete Record (v1 stubs).

Execution:
1. Orthanc pixel delete (idempotent, 404 = success). Skipped for v1 stubs.
2. Write terminal `action='patient_deleted'` audit row with full JSONB snapshot (patient name, DHP-ID, ext ID, site AET, hospital name, study UID, modality, study date, size bytes, link tokens, PDF info).
3. DELETE `app.studies` row (cascades to `app.links` + `app.patient_pdfs`).
4. If last study: DELETE `app.patients` too.

### Delete Record (v1 stubs)
Button visible when `purged_at IS NOT NULL AND purge_scheduled_at IS NULL`. Pixels already gone — skips Orthanc step, writes terminal audit snapshot, cascades rows. Cleans up pre-v2 purge stubs on demand.

---

## Audit Log Enrichment
All audit rows now capture denormalized context at write time: `patient_name`, `dhp_id`, `site_aet`, `study_uid_log`. Terminal `patient_deleted` rows store full JSONB in `metadata` column. `study_id` FK already `ON DELETE SET NULL`. Historical rows (pre-v2) have NULL enrichment columns — expected.

## Auto-expiry
`setInterval(sweep, 24h)` in `src/index.js`, plus a run at startup. Queries `purge_scheduled_at <= NOW() - INTERVAL '15 days'`.

## v1 Stub Migration
Existing `purged_at IS NOT NULL` stubs left as-is. `Delete Record` button in patient detail handles them on demand.

---

## Files (all on branch feat/safety-mt-gated, deployed to VM 2026-06-12)

**New:**
- `deploy/backend/src/schedule.js` — core module: scheduleStudy, cancelSchedule, finalizeStudy, deleteRecord, sweepExpiredSchedules
- `deploy/config/postgres/migrations/2026-06_v2_schedule_purge.sql` — applied to live DB

**Modified:**
- `deploy/backend/src/index.js` — startup sweep + 24h setInterval
- `deploy/backend/src/routes/studies.js` — POST /schedule, DELETE /schedule, POST /finalize, POST /delete-record
- `deploy/backend/src/routes/patients.js` — purge_scheduled_at/by in GET detail; POST /:id/schedule-purge
- `deploy/admin-ui/src/api/studies.ts` — scheduleStudy, cancelSchedule, finalizeStudy, deleteRecord
- `deploy/admin-ui/src/api/patients.ts` — Study type: purge_scheduled_at/by; schedulePatientStudies
- `deploy/admin-ui/src/components/PurgeControls.tsx` — ScheduleButton, CancelScheduleButton, FinalizeNowButton, DeleteRecordButton, ScheduledBadge, BulkScheduleButton
- `deploy/admin-ui/src/pages/PatientDetailPage.tsx` — new controls wired; countdown footer; scheduled state UI

**ADR + docs:**
- `docs/adr/0006-two-stage-schedule-purge-with-cascade-delete.md`
- `docs/adr/0002-purge-pixels-keep-metadata-stub.md` — annotated as partially superseded
- `CONTEXT.md` — Schedule, Cancel, Purge (v2), Delete Record terms added

---

## Test Results (2026-06-12, live VM)
- scheduleStudy → `{ok:true, status:'scheduled'}` ✓
- double-schedule guard → `{ok:false, status:'already_scheduled', code:409}` ✓
- cancelSchedule → `{ok:true, status:'cancelled'}` ✓
- cancel-when-not-scheduled guard → `{ok:false, status:'not_scheduled', code:409}` ✓
- deleteRecord on live study guard → `{ok:false, status:'not_purged', code:409}` ✓
- Audit log enrichment: patient_name='Faksar Alam', site_aet='SITE03_ORTHANC', study_uid_log populated ✓
- All 6 new HTTP routes return 401 (auth-gated, registered) ✓
- v1 stub (patient 13, study 11) intact: is_purged=true, purge_scheduled_at=null → Delete Record available ✓

## Known: not yet committed to local repo (same pattern as v1)
