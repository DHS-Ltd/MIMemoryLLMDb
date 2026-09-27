---
name: project-doctor-reports-live
description: "Doctor Reports (Phase 10) — real prescribing feature, designed via grill-with-docs, implemented, and deployed LIVE to production 2026-07-12"
metadata: 
  node_type: memory
  type: project
  originSessionId: d7ac5143-dca4-4bdc-958f-0dff1b91acfd
  modified: 2026-09-05T12:52:19.957Z
---

The Doctor Report feature (this repo's previously-planned "Radiology Reports" section in CLAUDE.md) is now built and **live in production** as of 2026-07-12, not just planned. A doctor can author, sign, and correct a real clinical prescription (chief complaint, history, examination, diagnosis, investigations, medications, advice, follow-up date) on a Study, inline in `PatientDetailPage.tsx` next to `StudyReportList`.

**Why:** User ported this from a working "Online Prescription" architecture in another of their projects (BDC HMS). The design was resolved through an extensive `/grill-with-docs` session — key decisions: entity stays named "Doctor Report" (not "Prescription", to avoid clashing with the existing "Study Report" term); anchored to a Study (`study_id NOT NULL`, no freestanding encounters — ADR-0014 in the central repo); investigations use a real growable Test Catalog that doctors can add to live with no moderation (ADR-0015); PDF generated server-side via `pdfkit` (matching the central repo's existing Patient Access Sheet pattern), not client-side `html2canvas`.

**Deployed pieces (all live):**
- Central DB migration `2026-07_p10_doctor_reports.sql` — `doctor_reports`, `test_categories` (seeded), `test_catalog`, plus `doctor_users.specialty`/`bmdc_reg_no`.
- Central backend: `routes/doctor-reports.js`, `routes/doctor-test-catalog.js`, study-scoped routes added to `routes/doctor-studies.js`, `lib/generateDoctorReportPdf.js`, `routes/admin-doctor-users.js` extended for specialty/BMDC.
- This repo: `api/doctorReports.ts`, `api/testCatalog.ts`, `components/DoctorReportSection.tsx`, wired into `PatientDetailPage.tsx`.
- Central admin-ui: `DoctorUserCreatePage.tsx` and `DoctorUserDetailPage.tsx` got Specialty/BMDC Reg. No fields (create-time + editable "Doctor Report Letterhead" section).

**How to apply:** Full detail (API contract, field list, lifecycle, permissions) lives in this repo's `CLAUDE.md` § "Doctor Reports (implemented, Phase 10)" — read that first for anything touching this feature. Central-repo specifics (schema, ADRs) are cross-referenced there too. **Flagged, not yet done:** Patient Portal (a separate, unexamined app) does not yet surface a doctor's signed report to the patient — that integration was explicitly deferred to a future session.

**Deploy note:** shipped via scoped manual file-level `scp` + targeted `docker compose build/up`, NOT a git-based CI/CD pipeline (this repo doesn't have one — see [[project_git_remote_live]]) — see [[feedback-production-deploy-verification]] for why manual was chosen that session.

**Update 2026-07-12 (later session):** the commit-strategy debt this created is resolved — this feature (plus the frictionless patient list, see [[project_frictionless_patient_list_live]]) was committed and pushed once a GitHub remote was created for this repo.

**⚠ Discrepancy found 2026-09-05, root cause identified:** while deploying [[project_dhpacs_doctor_desk]]'s D0 prerequisite, a direct check of the production VM (`/srv/pacs/backend/src/routes/`) found **`doctor-reports.js` and `doctor-test-catalog.js` do not exist there**, and `index.js` has no wiring for them — only `app.doctor_reports` (the DB table/migration) is actually live. Doctors could not create or sign a Doctor Report in production, despite this memory's "LIVE" status.

**✅ FIXED and verified end-to-end 2026-09-05 (same day, later session).** Root cause: `2c4d250` (the doctor-reports commit) lived on `feat/patient-pdf-redesign-settings`, and while the *file* `index.js` on that branch had the correct router wiring, the VM's actual `index.js` had been hand-patched directly (for an unrelated feature, Doctor Desk's `doctor-sync`) rather than ever deployed from git — so no git ref anywhere matched what was running. Fix: diffed every uncommitted-locally-modified file against the live VM byte-for-byte to separate "already deployed by hand, just never committed" (`index.js`'s doctor-sync half, `admin-doctor-users.js`, 4 admin-ui DoctorUser pages — all matched the VM exactly) from genuine unrelated WIP (`orthanc.js`, `legacy.js`, `mt-studies.js`, `patient-portal.js`, `patients.js`, `doctor-patients.js` — left untouched). Committed only the reconciled `index.js` + the already-live files, pushed, and deployed through the **existing, previously-bypassed** official CI/CD pipeline (`gh workflow run deploy.yml -f ref=feat/patient-pdf-redesign-settings`) — see [[project_central_repo_deploy_pipeline_bypassed]] for the pipeline-bypass root cause and the fix (central ADR-0022).

**Verification:** logged in as a real doctor (test account "Dr. Test"), against a real patient/study, exercised the full API surface directly — list (empty) → create draft → PATCH with test-labeled fields → sign → download PDF (real pdfkit-rendered letterhead, confirmed by reading the file) — then hard-deleted the test `doctor_reports` row from prod Postgres (no DELETE endpoint exists; this required a raw SQL statement, done with explicit user confirmation first). All endpoints returned correct 200/201s; nothing 404'd.

**Minor unrelated bug spotted during verification, not fixed:** the PDF's medication duration renders "1 day **days**" — `generateDoctorReportPdf.js` appears to append a "days" unit suffix even when the doctor's free-text duration field already includes one.

**Still open:** `feat/patient-pdf-redesign-settings` still needs merging into `main` — see [[project_central_repo_deploy_pipeline_bypassed]], this is not a simple fast-forward.
