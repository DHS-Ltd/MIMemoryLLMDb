---
name: saas_patient_list_telemetry
description: Admin patient list Tier-1 enrichment + Tier-A upload telemetry — shipped live 2026-06-06
metadata: 
  node_type: memory
  type: project
  originSessionId: 7067f1aa-04e0-43bb-8561-5fe375d0199e
---

Admin **patient list/detail Tier-1 + §10 telemetry (Tier A)** built and **deployed live 2026-06-06**. Implements `docs/260525_Admin_Frontend/CENTRAL_PATIENT_LIST_DATA_REFERENCE.md` (§7 prerequisite + Tier-1 + §10 Tier A).

**What shipped:**
- New migration `2026-06_p2_telemetry.sql` (+rollback, +init.sql append): `app.studies` gains `size_bytes, uncompressed_bytes, series_count, instance_count, push_started_at, upload_ms`. Applied to live DB.
- `autolink.lua` `OnStableStudy` now `RestApiGet /studies/{id}/statistics` → adds `diskSize/uncompressedSize/countSeries/countInstances` to the `/studies/received` payload.
- `legacy.js` persists size/counts in the study upsert (covers the match-then-push reconcile branch via `ON CONFLICT DO UPDATE`) and sets `push_started_at = claimed_at` on reconcile.
- `patients.js` list query rewritten (§3): name/mobile/DHP-ID, origin (MT vs DICOM), modalities, last_activity, total_size, total_views, flagged/pending rollup; search on 4 fields; filters = origin + claim_status; sort last_activity. Name falls back to latest `dicom_patient_name` (marked `name_unverified`). Detail adds per-study claim/MT/size/counts + `avail_latency_sec`.
- admin-ui: `api/patients.ts` types + `formatBytes/throughputMbps/formatDuration` helpers; `PatientsListPage` new columns + filters; `PatientDetailPage` demographics + per-study telemetry (NID masked).

**Key decisions (grilled):** Tier-A only (central repo, no workstation change); `upload_ms` reserved NULL for future Tier B; throughput/SLA = `pixels_received_at − claimed_at − 30s StableAge`, **mt_gated-only** (auto sites SITE01/SITE02 get size/counts only). Recorded in `docs/adr/0001-telemetry-tier-a-central-derived.md` (this repo's first ADR). Glossary in new root `CONTEXT.md`.

**Gotcha corrected:** repo `init.sql` was NOT drifted — it already had the full Phase-0/0.5/1 blocks (an earlier `awk` truncated at the first `);` and misled). Live sites: **SITE03 + SITE04 are mt_gated**, SITE01/SITE02 auto (memory `site03_cumilla_status` said "all auto" — wrong).

**Deferred:** Tier-2 generic DICOM tags (accession/description/body-part), Tier-3 admin override/revert UI, standalone §10.7 performance dashboard, Tier-B sender-measured `upload_ms`. Existing 14 studies backfilled 2026-06-06 from Orthanc `/statistics` via `deploy/scripts/backfill_study_telemetry.js` (run inside pacs-backend, idempotent on `size_bytes IS NULL`). Study 17/IFTEKHAR verified = 559.7 MB, 87/122, 457s, 1.31 MB/s — matches doc §10.3 exactly. See [[saas_p1_p2_implementation]], [[phase0_schema_migration]].
