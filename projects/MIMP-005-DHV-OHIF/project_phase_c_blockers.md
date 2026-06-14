---
name: project-phase-c-blockers
description: "Phase C (custom extension features) is blocked by five unresolved policy/source questions — report source of truth, audit logging, patient demographics exposure, i18n scope, offline caching"
metadata: 
  node_type: memory
  type: project
  originSessionId: 166f59ff-4dd5-4370-91b6-893b33f68d3c
---

Open questions before Phase C custom extension features can proceed. Documented in `Docs/OHIF_CUSTOMIZATION_PLAN.md` §9 and `Docs/ImplementationSteps.md` §7.

## ✅ Resolved

1. **Report source of truth** — **RESOLVED 2026-06-14.** Reports are files (PDF/JPEG/PNG) uploaded by MTs via the admin UI and served via `/api/studies/:uid/reports`. Not DICOM SR, not RIS. See [[project-report-feature]].
2. **Share-link audit** — **RESOLVED 2026-06-14 (decision: no audit for now).** Share links are created with `created_by='patient_share'`. No `app.audit_log` write on share creation; acceptable for current scale. See [[project-share-feature]].

## ⏳ Still open

3. **Patient info exposure policy** — MRN, name, DOB are already in the token-resolved response. Is referring physician safe? Insurance? **Affects:** the patient-info panel scope (Phase C).
4. **i18n scope** — English only, or Bangla/English toggle? OHIF supports i18next out of the box. **Affects:** every visible string going forward.
5. **Offline / poor network** — Should the viewer aggressively cache the first series for slow Bangladesh mobile connections? **Affects:** prefetcher config + service worker strategy.

**How to apply:** if Phase C work is being planned and questions 3–5 above are unresolved, surface the blocker before writing code. Don't assume defaults.
