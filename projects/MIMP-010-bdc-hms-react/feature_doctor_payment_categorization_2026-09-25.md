---
name: feature-doctor-payment-categorization
description: "2026-09-25 SHIPPED + user-confirmed: Expenses split Doctor Payment / Doctor Assistant Fee out of Other, linked via DoctorID column instead of free text; backend v2.6/@58, frontend 8d0c69a"
metadata:
  node_type: memory
  type: project
  originSessionId: dc13f953-be5c-4271-8e0c-3ccba11bbf9d
  modified: 2026-09-25T16:43:46.305Z
---

**Status: shipped and user-confirmed "All verified now"** (migration run + live UI spot-check both done by the user). Grilled via `/grill-with-docs` (12 questions). Durable reasoning lives in `docs/adr/0006-doctor-payment-links-to-doctorid-not-freetext.md` and the **Doctor Payment (Expense)** / **Doctor Assistant Fee** terms in `CONTEXT.md` — this memory holds session specifics.

**Root cause:** `Other` was a general dumping ground, not doctor-specific. Doctor fees were typed as free text into `Note`, producing spelling variants of the same doctor ("Dr.Sabbir Borthoki" / "Dr sabbir Borthoki" / "Dr.Sabbir  Borthoki") with no way to total what was paid to any one doctor.

**Key discovery mid-session:** "Borthoki"/"Bhortoki" is not a surname — it's the Bengali word ভর্তুকি (subsidy/honorarium), inconsistently transliterated, used as a generic suffix after *many different* doctors' names ("DR.NAVEED ROHMAN BORTHOKI", "MOWPIA MONDOL BORTHOKI", "DR.JOTHI BORTHOKI"). Found by pulling live sheet data mid-grill via a temporary debug function — don't design a migration around a free-text pattern without actually looking at the data first; the initial screenshot-only read of the ticket was misleading.

**Dr. Sabbir** = Dr. Md. Mohibbur Rahman (MBBS-DU, BMDC Reg. 125876, GP + Certificate in Medical Ultrasound) — the single most frequent name in the "Other" data, but wasn't in the `Doctors` sheet at all. Added as `"Dr. Md. Mohibbur Rahman (Sabbir)"` (nickname folded into the `Name` field, no schema change) by the migration script.

**Backend (`Code.gs`):**
- `ensureExpenseColumns_()` lazily adds `DoctorID`/`UpdatedBy`/`UpdatedAt` columns if missing — same auto-add-column idiom as `updatePatientRecord`/`updateReferralAgent`.
- New `updateExpense` action, deliberately narrow: only `Category`/`DoctorID`/`Note` are editable, never `Amount`/`Date`/`PaymentMethod` — Expenses stays append-only on the money fields, same reasoning as `Payment_Log` (see [[feature-daily-closing]]).
- Rejected resurrecting a dead `[doctorId] note` bracket-prefix scaffold that was sitting unused in `saveExpense` since before this session (nobody had finished wiring it up) — used a real `DoctorID` column instead; fragile to parse IDs back out of a display string for money-reporting data.
- One-time `migrateDoctorPaymentCategories()`, editor-only (not in the dispatcher): whitelist regex per confirmed doctor-name variant → `Doctor Payment`; generic `dr/doctor + asst` pattern with no name → `Doctor Assistant Fee` (DoctorID left blank); `"RF--"` rows (referral agent commission fees, same root cause, separate not-yet-started ticket) skipped entirely; anything else mentioning dr/doctor that didn't match — including doctor hospitality costs like "Food cost for the Doctor"/"Car Cost for the Doctor" (deliberately out of scope: cost of hosting a doctor ≠ fee paid to them) — left in `Other` and logged for manual review rather than guessed.

**Frontend:** `AddExpenseModal`/new `EditExpenseModal` show a searchable Doctor `<Select>` (via existing `getDoctors()` + `CACHE_KEYS.DOCTORS`) when category is Doctor Payment (required) or Doctor Assistant Fee (optional). `Expenses.jsx` gained a Doctor column (ID→name resolved client-side) and a pencil-icon Edit action per row.

**Deploy:** backend v2.6/@58; frontend commit `8d0c69a` pushed to `main`, Cloudflare auto-deploy.

**Process notes** (see [[reference-gas-backend]] for the durable version): `clasp push`/`clasp deploy` got blocked once by the auto-mode Bash classifier as "Blind Apply" even after in-chat "I approve" — retried later as real implementation work and it went through. `clasp run` doesn't work in this environment at all (`NOT_FOUND`) — every debug/migration script had to be pasted and run manually by the user in the Apps Script editor, logging with `console.log` since the Execution log panel doesn't show `return` values.

Related: [[reference-gas-backend]], [[headless-browser-verification]].
