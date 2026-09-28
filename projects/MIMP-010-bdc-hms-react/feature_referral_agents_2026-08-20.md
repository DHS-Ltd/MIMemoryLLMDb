---
name: feature-referral-agents
description: "Referral Agents CRUD system added 2026-08-20 — sheet split, endpoints, list UI, legacy migration, phone leading-zero fix, Reception quick-add gate (which unblocked addDoctor), and what's still open"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9fa35a58-8f0e-4362-a686-53bd029bab76
  modified: 2026-08-20T08:52:36.793Z
---

Built a full Referral Agents management system (list + add/edit/deactivate) for Admin and Reception, at `/admin/referral-agents`. See [[project_gas_lab_invoice_fields]] sibling docs and the app's own `CONTEXT.md` (Doctor / Referral Agent / Doctors_Agents (legacy) terms) and `docs/adr/0002-referral-agent-soft-delete.md` for the durable domain record — this memory is the session narrative, not the source of truth.

**Why:** User wanted the legacy `Doctors_Agents` Google Sheet (external referrers/marketing agents with historical data) surfaced in the app. Grilling revealed three overlapping sheets already existed: `Doctors_Agents` (legacy, archive-only, unreachable from the dispatcher), `Doctors` (new, live but its Add/Edit save is broken — no dispatcher case for `addDoctor`/`updateDoctor`), and `referral_agents` (newest, backend had list+create but zero UI, already silently 90% migrated from `Doctors_Agents` by someone before this session).

**Key decisions:**
- Doctor = practices at BDC (chamber). Referral Agent = refers patients without practicing at BDC, even if their legacy `Role` value says "Doctor". Two sheets, no linking field, even for the same physical person.
- Doctor Management's broken save (`Code.gs` line ~4040 `saveDoctor`, no dispatcher case) was explicitly left untouched — out of scope, deferred to "the doctors section" as its own future session.
- Referral Agent "Remove" = soft delete via a `Status` column (Active/Inactive), not a real row delete — invoices reference agents by name string for commission tracking (`getAgentPerformance`), so a hard delete would silently break historical reports.
- The 11 unmigrated `Doctors_Agents` rows (Role='Doctor', i.e. referring physicians) get imported via an idempotent, Admin-only `migrateLegacyReferralAgents` action, exposed as an "Import Legacy Records" button on the page — not run automatically, since it needed an authenticated Admin session I didn't have.

**Backend** (`E:\v1-BdcHmsApp\Code.gs`, deployed via `clasp deploy --deploymentId AKfycbw4d9j5tksjXz_cjKIEjseraFUTNAQYKfEOtOSRNNOd4aa5YUCxS089irUrjWekHHYUFQ`, now at v3.3 / `@51`): added `updateReferralAgent`, `setReferralAgentStatus`, `migrateLegacyReferralAgents` functions + dispatcher cases `addReferralAgent`/`updateReferralAgent`/`setReferralAgentStatus`/`migrateLegacyReferralAgents`; `getReferralAgentsList` now also returns `status`, `addedBy`, `addedAt`.

**Frontend**: new `src/pages/admin/ReferralAgentManagement.jsx` — filterable `DataTable` list (combined name/phone search, category dropdown, three-way status filter, paginated, default sort newest-first by Added Time), following the `Patients.jsx` list pattern rather than the `DoctorManagement.jsx` card-grid pattern (explicitly rejected as not scaling). `NewInvoice.jsx`'s referral picker (`রেফারেল ও ডেলিভারি`) now merges Doctors + active Referral Agents, since previously it was Doctors-only and Referral Agents had no way to ever get credited on an invoice.

**Follow-up same day — phone leading-zero bug (v3.4, `@52`):** Referral Agent form had no phone validation (unlike Patient's `^01[3-9]\d{8}$`), so numbers missing the leading zero could be saved as typed. Fixed the form validation, and added an idempotent Admin-only `repairReferralAgentPhoneNumbers` action (button: "Repair Phone Numbers") that prepends '0' to any phone matching the exact stripped-mobile signature (`1[3-9]########`) in both `referral_agents` and `Doctors_Agents` — anything more ambiguous is left untouched and reported for manual review, not guessed at. `BD_PHONE` regex now lives in `formatters.js` (was duplicated 2x, now shared 4 ways).

**Follow-up same day — Reception quick-add (v3.5, `@53`):** User asked for a single gated "Add Doctor / Referral Agent" flow for Reception, distinct from the two Admin CRUD pages (which are unchanged). New page `src/pages/reception/AddDoctorOrAgent.jsx` at `/reception/add-doctor-agent` (nav item + dashboard tile), Reception-only via RoleGuard, type-gate then matching form. **This required reversing part of the earlier "leave Doctor Management alone" decision**: wired up `addDoctor` on the backend for the first time (`saveDoctor` role check widened from `['Admin']` to `['Admin','Reception']`, dispatcher case added) — scoped strictly to add-only, `updateDoctor` is still not wired, so Doctor **edit** remains broken on `/admin/doctors` (that's still deferred). Wiring `addDoctor` also exposed and required fixing a second latent bug: `DoctorManagement.jsx`'s form used the key `bmdc`, but the backend reads/returns `bmdcRegNo` — BMDC numbers were always saving and displaying blank. Renamed to match; this was a pure key-name fix, not a scope expansion into edit.

**Still open / flagged, not acted on:**
- A leftover test row (`R2103261`, "Test_Agent", 100% commission) exists in `referral_agents` from someone's earlier manual testing — flagged to the user, not deleted (their data judgment call, deactivatable via the new UI).
- Doctor **edit/update** is still broken (`/admin/doctors` Edit button) — add now works, edit is still next-session scope per the user.
