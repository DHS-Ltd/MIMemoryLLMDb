---
name: Central Server Phase 1 — COMPLETE (End-to-End Working)
description: Phase 1 closed 2026-05-19. OHIF renders pixel data for patient E1027809 via token link. Full E2E: DICOM ingest → DB → token → viewer → pixels.
type: project
originSessionId: 4b13a283-8d5d-4011-a897-060e85082666
aliases: [Central Server Phase 1 — COMPLETE (End-to-End Working), Central Server Phase 1 — COMPLETE (End_to_End Working), central-server-phase1-complete]
---
**Status (2026-05-19): Phase 1 COMPLETE.** Pixel data rendering confirmed end-to-end in production.

**Working flow proved with patient AYESHA AKTER (MRN E1027809):**
- Patient link: `https://pacs.dhsolutions.com.bd/open?token=7729128b-13f7-4db4-ab4c-c041ce045f81`
- Resolves to StudyInstanceUID `1.3.12.2.1107.5.2.51.184143.30000026050406580017300000015`
- OHIF loads at `pacs.dhsolutions.com.bd/viewer?StudyInstanceUIDs=<uid>`
- MR lumbar spine study (date 2026-05-04), 13+ series with thumbnails (t2_tse_sag_LS, t2_haste_cor_myelo, L_AAspine_scout_*, etc.)
- W:841 L:368 — real DICOM pixel values, not placeholder
- Patient demographics displayed correctly: AYESHA AKTER, F, DOB 04-May-2001

**Phase 1.5 blocker (pixel rendering) — resolved.** The suspected `0.0.0.0` BulkDataURI issue in Orthanc DICOMweb is no longer blocking; verified by full image render in production browser.

**Current data on central server (verified 2026-05-19):** 3 patients, 6 studies:
- TEST_001 — 2 studies (2026-05-10)
- TESTSITE01:TEST001 — 3 studies (2026-05-09, original test set from session memory)
- E1027809 — 1 study (2026-05-04, the verified-rendering case above)

**Known gaps that remain (not blockers, deferred):**
1. nginx `/orthanc/` admin route returns OHIF index.html instead of proxying — fix nginx location block.
2. `app.studies.modality` and `app.patients.site_id` empty for all rows — Lua hook (`deploy/scripts/autolink.lua`) not extracting these tags.
3. Two series thumbnails showed yellow warning triangles in the rendered viewer (possible per-series transcoding edge case) — worth investigating but not blocking.

**Next phase begins.** See project_completion_status.md and Site01Docs/REMAINING_WORK_ROADMAP.md for Phase 2+ scope.
