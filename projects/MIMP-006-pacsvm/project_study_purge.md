---
name: project_study_purge
description: "Study purge (reclaim Orthanc disk) feature — implemented AND deployed to VM 2026-06-07"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5e66b66b-5a69-4a0c-a6fd-fd063f958c8f
---

**Study Purge** — reclaim Orthanc disk by deleting a study's DICOM pixels while keeping the `app.studies` metadata stub. Implemented on branch `feat/safety-mt-gated` and **deployed live to the VM 2026-06-07** (migration applied to live DB; backend/admin-ui/patient-ui rebuilt + restarted; nginx reloaded to re-resolve the recreated backend IP — see [[feedback_ohif_orthanc_cloudflare_gotchas]]). Files were scp'd (no git on VM); all matched HEAD before overwrite (no drift). Still uncommitted in the local repo.

Design was grilled via /grill-with-docs. Decisions captured in [docs/adr/0002-purge-pixels-keep-metadata-stub.md] and the **Purge** term in [CONTEXT.md]. Key points:
- "Save space" = Orthanc blobs, not the KB-sized `app` rows. Purge deletes pixels, keeps the record (audit/forensics/telemetry/patient_pdfs survive).
- Manual admin-only, study-level + per-patient bulk. Orthanc-first then stamp `studies.purged_at`/`purged_by`; 404 = success; idempotent.
- Hard-block only `claim_status='under_review'` (open complaint = evidence). Single study = plain confirm; bulk = type `PURGE`.
- Purged Link resolves to `410 {reason:'study_purged'}`; link-gen on a purged study rejected `409`.
- **v1 punt:** re-arrival not handled — a re-pushed purged StudyInstanceUID leaves dead disk + 410 until re-purged.

Backend: new `src/purge.js` (`purgeStudyByUid`), `orthanc.deleteStudy`, `POST /api/admin/studies/:uid/purge`, `POST /api/admin/patients/:id/purge-studies`, guards in legacy/admin-links/patient-portal. UI: admin `PurgeControls.tsx`; patient-ui dashboard "No Longer Available" bucket.

**To deploy:** apply `migrations/2026-06_p4_study_purge.sql` to the live DB, then `docker compose build backend admin-ui patient-ui && up -d`. Central-only — no workstation/`dh-pacs-workstation` contract change.
