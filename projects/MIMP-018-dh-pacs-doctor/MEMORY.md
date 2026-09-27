# Memory Index

## Project
- [Doctor Reports — LIVE 2026-07-12](project_doctor_reports_live.md) — real prescribing feature (Phase 10). Found missing from prod 2026-09-05 (routes never deployed), **FIXED + verified end-to-end same day** via the official deploy pipeline. Minor unrelated PDF bug found ("1 day days").
- [Central repo deploy pipeline was being bypassed](project_central_repo_deploy_pipeline_bypassed.md) — root cause of the Doctor Reports gap: real CI/CD exists but was hand-patched around for months, causing prod to match no git ref. Fixed via central ADR-0022. Open: merging feat/patient-pdf-redesign-settings into main needs its own session (two independent Business Admin Role implementations will conflict).
- [Frictionless Patient List — LIVE 2026-07-12](project_frictionless_patient_list_live.md) — expandable accordion rows replace click-through detail page, grilled via /grill-with-docs, Doctor Report editor moved to a Modal with unsaved-changes guard.
- [Large-study load time](project_large_study_load_time.md) — ~80-min CT load fixed. Phase 1 OHIF wadouri FAILED & retired (broke MPR); Phase 2 JPEG-LS ingest compression SHIPPED to prod 2026-07-14 (3.3-3.6x smaller, 25-40x faster, MPR intact).
- [Doctor Support](project_doctor_support.md) — designed 2026-08-22; Phase A (`doctor_users.mobile` required at registration) **LIVE 2026-09-05**, restored from a prior silent regression. Phases B-F unbuilt. Share button dropped.
- [Doctor DH Viewer](project_doctor_dh_viewer.md) — design 2026-07-13, build plan 2026-07-15. **M1 central sync contract BUILT 2026-07-15, DEPLOYED TO PROD 2026-09-05; M0/M2–M5 unbuilt.** `/dicom-web` closing DESCOPED (platform-wide, not doctor-scoped) — ADR 0017 amended, separate follow-up. Distinct from [DHPacs Doctor Desk](project_dhpacs_doctor_desk.md), which ships this design's M1 but carries no local cache.
- [DHPacs Doctor Mobile](project_dhpacs_doctor_mobile.md) — Android sibling to the Desk. Designed 2026-09-05 (Capacitor shell, sideloaded APK, biometric gate, contentless FCM push), **parked mid-session, nothing built**.
- [DHPacs Doctor Desk](project_dhpacs_doctor_desk.md) — designed + **BUILT + DEPLOYED + WORKING 2026-09-05** as v1.0.4. Electron shell around the *hosted* portal; sign-out/multi-doctor-switching confirmed correct on one test machine. Auto-update infra live but never confirmed to actually fire. Nothing committed to git yet.

## Feedback
- [Production deploy & verification approach](feedback_production_deploy_verification.md) — grill thoroughly before building; verify with real executable tests even without local infra; deploy scoped fixes through the official pipeline against a scoped branch/ref, never by hand-patching the VM.

## Reference
- [Git remote live](project_git_remote_live.md) — GitHub remote DHS-Ltd/dh-pacs-doctor (main) added 2026-07-12; still no CI/CD, commit/push and deploy remain separate manual steps.

