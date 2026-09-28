---
name: feature-patient-update-fix
description: "Fixed Reception's patient edit (name/age/etc.) silently duplicating rows instead of updating in place — 2026-08-20, deployed v2.3/@55, tested and confirmed working"
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-20T10:38:46.995Z
  originSessionId: 44653601-3d8e-4ec2-a8ed-8524e3a81fed
---

Fixed a bug where Reception editing a patient's name/age (or any field) via `Patients.jsx` → `PatientForm.jsx` never actually corrected the existing record — see the app's own `CONTEXT.md` ("Patient Record" term) for the durable domain note this session also added.

**Root cause:** In `Code.gs`, the dispatcher routed both `addPatient` and `updatePatient` to the same function, `savePatient()`, which unconditionally called `generatePatientId_()` + `sheet.appendRow(row)`. It never read `formData.patientId` (which the frontend was already sending correctly). Every "edit" silently appended a brand-new duplicate row with a new PatientID; the original stale row was untouched.

**Fix:** Split the two actions apart.
- `savePatient()` is now add-only, unchanged otherwise.
- New `updatePatientRecord(token, formData)` finds the row by `PatientID` and `setValue()`s only the changed cells (Name, Phone, WA_Phone_No, Age, Gender, BloodGroup, Address) — mirrors the existing `updateReferralAgent()` pattern rather than inventing a new one. PatientID itself is immutable, like `TestCode` on Test Catalog items.
- Auto-adds and stamps `UpdatedBy`/`UpdatedAt` columns (same auto-add-column technique `savePatient()` already used for `CreatedBy`/`CreatedAt`).
- Phone/WA_Phone_No cells get `setNumberFormat('@')` before `setValue()` — same leading-zero-stripping guard already needed once before for Referral Agents (`ad16fb6`).
- Deliberately did **not** add phone-uniqueness validation on edit — `addPatient` doesn't have it either, so this isn't a regression; tracked as a known gap, not in scope.
- No frontend changes were needed — `PatientForm.jsx` already sent `patientId` + all fields correctly, and `Patients.jsx` already invalidated cache + refetched on success. The bug was 100% backend.

**Domain note surfaced during grilling:** Unlike Test Catalog `Price` (which snapshots onto invoice line items at add-time), Patient fields are never denormalized — Invoices/Appointments/Prescriptions store only `PatientID` and live-join Name/Age/Phone at read time. So this fix corrects display everywhere immediately, including on invoices/prescriptions created before the fix. See [[project_gas_lab_invoice_fields]] for the contrasting Test Catalog snapshot behavior.

**No ADR created** — evaluated against the 3-part test (hard to reverse / surprising without context / real trade-off) and it fails all three: it's a bug fix restoring intended behavior via an already-established pattern, not a novel design decision.

**Deployed:** `E:\v1-BdcHmsApp\Code.gs`, `clasp push` + `clasp deploy --deploymentId AKfycbw4d9j5tksjXz_cjKIEjseraFUTNAQYKfEOtOSRNNOd4aa5YUCxS089irUrjWekHHYUFQ`, now v2.3 / `@55`. User tested live in Reception UI and confirmed it works.

**Aside — observed but unresolved:** While committing the `CONTEXT.md` doc change from this session, found it had already been committed+pushed to `origin/main` by something other than this session's own git commands — bundled into commit `98a4b8b` ("feat: let Admin and Reception update existing Test Catalog prices") along with older, unrelated pending work (`TestCatalogManagement.jsx`, ADR 0003, etc.) that had been sitting uncommitted in the working tree since before this conversation started. No hook definition was found in this repo's `.claude/settings.json` to explain it — likely a concurrent Claude Code session or the user's own git action swept up this session's edit via `git add -A`. Flagged to the user, not investigated further. **How to apply:** don't assume the "modified files" list shown at a session's start will still be uncommitted later — another concurrent session or process in this repo can commit/push mid-session.
