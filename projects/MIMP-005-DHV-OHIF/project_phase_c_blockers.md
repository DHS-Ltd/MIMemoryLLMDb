---
name: project-phase-c-blockers
description: "Phase C (custom extension features) is blocked by five unresolved policy/source questions — report source of truth, audit logging, patient demographics exposure, i18n scope, offline caching"
metadata: 
  node_type: memory
  type: project
  originSessionId: 166f59ff-4dd5-4370-91b6-893b33f68d3c
---

Five open questions are owed answers before Phase C features can be implemented. Documented in `Docs/OHIF_CUSTOMIZATION_PLAN.md` §9 and `Docs/ImplementationSteps.md` §7:

1. **Report source of truth** — Where do study reports live today? RIS? DICOM SR in Orthanc? Encapsulated PDFs as Orthanc attachments? **Blocks:** the report panel entirely. No backend endpoint can be designed until this is known.
2. **Share-link audit** — Token URLs are bearer-style. Should `/api/links/resolve/:token` write `action='link_shared'` to `app.audit_log` when a share is initiated? **Affects:** share-button implementation.
3. **Patient info exposure policy** — MRN, name, DOB are already in the token-resolved response. Is referring physician safe? Insurance? **Affects:** the patient-info panel scope.
4. **i18n scope** — English only, or Bangla/English toggle? OHIF supports i18next out of the box. **Affects:** every visible string going forward.
5. **Offline / poor network** — Should the viewer aggressively cache the first series for slow Bangladesh mobile connections? **Affects:** prefetcher config + service worker strategy.

**Why this matters:** Phase C work cannot proceed cleanly without these answers — implementing assumptions will likely require rework when policy lands. The share button (#2) is the least-blocked: it can ship as a simple `whatsapp://send?text=...` / `sms:` / `mailto:` button without the audit endpoint, with audit added later.

**How to apply:** if Phase C work is being planned and the relevant question above is unresolved, surface that blocker explicitly before writing code. Don't assume defaults; the answers will come from stakeholders (clinical, legal, ops) and may surprise. The share button is the safest Phase C feature to start with.
