---
name: project_reception_workflow_corrections
description: "Multi-part reception workflow correction effort (invoice creation, patient list, patient-record editing) being resolved one issue at a time via grill-with-docs"
metadata: 
  node_type: memory
  type: project
  originSessionId: aaac8848-0de4-4306-900a-005c5310f8f5
  modified: 2026-08-20T07:24:51.001Z
---

Started 2026-08-20: user is walking through a set of reception-workflow corrections spanning invoice creation, the patient list, and patient-record editing as **one connected flow**, not independent bugs. Issues are being resolved one at a time — grill the next issue only after the current one is confirmed fixed and shipped.

**Why:** the user explicitly framed this as "finalize the resolution and finalize the problem" per issue, working sequentially rather than batching all fixes into one pass.

**How to apply:** when picking this back up, ask what the next reception-workflow friction is rather than assuming the effort is done — check this memory's "Resolved" list first, then ask.

## Resolved

1. **New-patient modal didn't carry the search query** (fixed & deployed 2026-08-20, commit `1f3c9ea`). In `NewInvoice.jsx`'s patient picker (`PatientSearch.jsx`), clicking "Add new patient" after a no-match search discarded the typed name/phone, forcing reception to retype it. Fixed by threading the query through `onNewPatient(query)` → `NewInvoice.jsx` detects digits-only (→ Phone) vs text (→ Name) via `detectPrefillField()` → passes as a new `prefill` prop on `PatientForm.jsx`, which merges it into the empty-form defaults (add mode only, doesn't affect edit mode). Confirmed working live by user, pushed to `main`.

2. **Patient age couldn't be entered for infants under 1 year** (fixed & deployed 2026-08-20, commit `e344d43`). `PatientForm.jsx` only accepted whole-year integers ≥ 1, so neonatal patients (e.g. 1-month-old) couldn't be registered. Fixed by adding a Years/Months/Days unit picker (`AGE_UNITS` in `src/utils/formatters.js`, bounds: Years 1–120, Months 1–11, Days 1–30 — crossing a bound means switch units) and storing age as a formatted string (e.g. `"6 মাস"`) instead of a bare number. This reused the GAS backend's existing `formData.ageFormatted || formData.age` fallback in `savePatient()` (`E:\v1-BdcHmsApp\Code.gs:2378`) — **no backend redeploy was needed**, it already supported this. Added `formatPatientAge()` for backward-compatible display of legacy bare-number ages (shows as "N বছর") and `parsePatientAge()` to re-edit existing patients correctly. Updated the 3 places that hardcoded a years suffix: `Patients.jsx`, `NewInvoice.jsx` (PatientCard + invoice snapshot), `PatientSearch.jsx`. Confirmed working live by user, pushed to `main`.

Both fixes are frontend-only (no `clasp deploy` needed) — Cloudflare Pages auto-deploys on push to `main`.

## Session closed 2026-08-20

User confirmed both issues resolved and said the next session will be a **different scope** — do not assume reception-workflow corrections continue automatically. The "Eye" icon on `Patients.jsx`'s edit button being visually a view icon (`aria-label="Edit ..."` vs `<Eye>` icon mismatch) was noted during exploration but never raised by the user as a real complaint — it is speculative, not a queued issue. If reception-workflow work resumes later, ask what the next friction is rather than picking this up.
