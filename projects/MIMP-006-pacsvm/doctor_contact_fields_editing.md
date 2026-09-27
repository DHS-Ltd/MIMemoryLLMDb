---
name: doctor-contact-fields-editing
description: "Doctor name/email/mobile/specialty/BMDC admin-editable — regressed out of prod after 2026-08-22, properly redeployed 2026-09-05 via a clean branch + official deploy.yml"
metadata: 
  node_type: memory
  type: project
  originSessionId: a3ecd915-15a4-4a43-a91e-9b6d511bde75
  modified: 2026-09-05T00:00:00.000Z
---

> **CORRECTION (2026-09-05):** the "LIVE on VM 2026-08-22" claim below was true only for that one manual deploy. This feature was **never committed to git** — it lived only as an uncommitted local patch on `feat/patient-pdf-redesign-settings`. A later official `deploy.yml` run (2026-08-30, unrelated Business Admin fix, `ref=main`) rebuilt the backend/admin-ui from `main`, which never had this code — silently erasing it from production with no error anywhere. Discovered 2026-09-05 by `docker exec`-ing into `pacs-backend`/`pacs-admin-ui` and diffing against the working tree (same technique [[feedback-db-migration-ahead-of-code-deploy]] recommends). Re-shipped properly this time: new branch `fix/doctor-registration-required-mobile` off latest `origin/main`, committed (SHA `1458ae2`), pushed, deployed via `gh workflow run deploy.yml -f ref=<branch>` — durable against the next unrelated CI deploy. Also added in that same commit: `mobile` is now **required** when an Admin registers a new Doctor, and `DoctorUsersListPage` flags legacy accounts with none (feeds [[project-doctor-support]]'s Callback Number).
>
> **Lesson:** on this project, a feature only "counts" as shipped once it's an actual commit reachable from a ref that `deploy.yml` can target — never leave working, verified functionality sitting uncommitted, even after confirming it works in the browser. The DB migration can be safely applied by hand ahead of the code (that's the normal pattern here), but the *code* itself must be committed or it will eventually be silently overwritten by someone else's unrelated deploy.

# Doctor Contact Fields Editing — LIVE 2026-08-22

Builds on [[saas_p8_doctor_portal]] and [[saas_p10_doctor_reports]]. User asked to make a doctor's email/phone editable (previously only Assigned Sites was editable post-registration) and to add a primary mobile number field "per the recent plan for doctor support features" — that plan is `CONTEXT.md` § Doctor support (Support Request / Callback Number), still design-phase, not built. Resolved via `/grill-with-docs`.

## Decisions from the grill session

- **Column name `mobile`, not `phone`.** `CONTEXT.md`'s Callback Number entry had already committed to `doctor_users.phone`, but every other identity table (`patients.mobile`, `mt_users.mobile`) uses `mobile`. Fixed the doc to match the codebase convention rather than the other way around — both the Callback Number entry and the Doctor glossary entry now say `mobile`.
- **Nullable, no UNIQUE.** Unlike `mt_users.mobile` (login key, `NOT NULL UNIQUE`) or `patients.mobile` (`UNIQUE`, used in claim-safety matching), a doctor's mobile is just a contact field — nothing depends on it being present or distinct. A shared front-desk number across doctors at one site is plausible and shouldn't 409.
- **Edit scope widened to name+email+mobile**, not just email+mobile as originally asked — user chose to also open up Name editing in the same pass rather than re-visit this later.
- **New "Contact Info" section** on `DoctorUserDetailPage.tsx`, separate from "Doctor Report Letterhead" (specialty/BMDC) and "Assigned Sites" — kept login identity/contact distinct from report-signing credentials.
- Doctor's live session (`doctor_jwt`) bakes name/email into the JWT payload at login and never re-reads the DB (`requireDoctor.js`'s documented sliding-session trade-off) — so a doctor with an open session won't see an admin's edit until they re-login or the 8h token lapses. Not changed; matches an already-accepted trade-off.

## What shipped

**Migration:** `2026-08_p12_doctor_contact_fields.sql` (+ rollback) — `ALTER TABLE app.doctor_users ADD COLUMN mobile VARCHAR(20)`. Applied live via `docker exec -i pacs-postgres psql`.

**Backend (`admin-doctor-users.js`):** GET list/detail now return `mobile`. PATCH `/:id` now accepts `name`, `email`, `mobile` (previously only `status`/`specialty`/`bmdc_reg_no`); added the `23505` → 409 duplicate-email catch that POST already had (PATCH would have 500'd on a duplicate before).

**Admin UI:** new "Contact Info" edit-toggle section (Name/Email/Mobile) on `DoctorUserDetailPage.tsx`, same edit-in-place pattern as the existing Letterhead/Sites sections. Top static row is now just Status + Registered (Email moved into the new editable section).

**Docs:** `CONTEXT.md` — Callback Number entry and Doctor glossary entry both corrected to `doctor_users.mobile`.

## Deploy method — scoped manual, same pattern as P10

Same situation as [[saas_p10_doctor_reports]]: branch `feat/patient-pdf-redesign-settings`, many unrelated uncommitted changes in the tree (Phase 11 doctor-device-token routes/migration among them). Deployed via scoped `scp` + `docker compose build <service> && up -d <service>` for `backend` and `admin-ui` only — **not** the full local `admin-doctor-users.js`, which also contains the Phase 11 device-token routes (`app.doctor_device_tokens` table doesn't exist on the VM). Built a stripped copy (everything except the "Doctor DH Viewer device tokens (Phase 11)" block) and pushed that instead.

**Bonus fix, shipped in the same deploy (user's explicit call):** while pulling the VM's live `admin-doctor-users.js` to diff against, discovered the P10 "Doctor Report Letterhead" (specialty/BMDC) admin-edit UI had *never actually been deployed*, despite [[saas_p10_doctor_reports]] recording it as live 2026-07-12 — see that memory's 2026-08-22 correction note. Shipped both features in this one deploy rather than doing a second round-trip.

Pre-deploy versions of the three touched files backed up to `/srv/pacs/backups/2026-08-22_doctor-contact-fields/` on the VM.

## Verification
- Migration applied cleanly, `\d app.doctor_users` confirmed `mobile` column present.
- Both `pacs-backend` and `pacs-admin-ui` rebuilt clean (TS compiled with no errors) and started with no errors in logs.
- `curl /api/admin/doctor-users` → `401` (route mounted, auth-gated) — could not do a full authenticated smoke test myself (no admin password).
- **User confirmed in-browser 2026-08-22: editing a doctor's Contact Info works correctly in production.**
