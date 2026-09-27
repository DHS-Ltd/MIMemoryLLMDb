---
name: project-doctor-support
description: "Doctor Support (one-click help + callback) — designed 2026-08-22 via /grill-with-docs; Phase A (doctor mobile required at registration) LIVE 2026-09-05; Phases B-F NOT built"
metadata: 
  node_type: memory
  type: project
  originSessionId: b9dcbd10-7705-4ace-beed-d42b00e206a3
  modified: 2026-09-05T07:46:00.396Z
---

Doctor Support: a Help button on each live study card in the Doctor Portal that captures full context and gets a Support Agent to call the doctor back. **Designed 2026-08-22 via `/grill-with-docs`.** As of 2026-09-05, only Phase A (the `doctor_users.mobile` field) has code written — and it's now actually **live in production**, not just committed.

Plan: `d:\dh-pacs-doctor\docs\DoctorSupport\Doctor_Support_Plan.md` (phases A–F, full DDL, API contracts, Telegram spec, test plan). Terms in central `CONTEXT.md` § Doctor support. ADRs 0018 + 0019 in the central repo.

**Why:** Original ask was vaguer — a floating bar with Share + Report + Help. Grilling reshaped it substantially.

**How to apply:**
- **Phase A blocked everything as of 2026-08-22; that block is now cleared and deployed.** The column is `doctor_users.mobile` (the plan doc originally said `phone` — that was renamed to match `CONTEXT.md`'s resolved terminology; never call it `phone` in code or docs). A migration session before 2026-09-05 added the column and wrote Admin view/edit code (`DoctorUserDetailPage`) — but that code was **never committed to git**, only manually deployed, and got **silently erased from production** by a later unrelated official CI deploy from `main` (2026-08-30, Business Admin fix). A 2026-09-05 `/grill-with-docs` follow-up discovered the regression (`docker exec`-diffing the live containers against the working tree — DB columns were still there, code wasn't), then in the same session: (1) restored the mobile/specialty/BMDC admin CRUD + `DoctorUserDetailPage` Contact Info/Letterhead sections, (2) made `mobile` **required** on new-doctor registration (`POST /api/admin/doctor-users` + `DoctorUserCreatePage.tsx`, presence-only validation — no regex, matching `mt-patients.js`/`admin-mt-users.js` convention), and (3) added a "no mobile" badge to `DoctorUsersListPage.tsx` to flag legacy accounts for backfill. This time shipped properly: a clean branch off latest `origin/main` (isolated from the large, mixed-WIP `feat/patient-pdf-redesign-settings` branch it was drafted on), committed (SHA `1458ae2`), pushed, and deployed via `gh workflow run deploy.yml -f ref=<branch>` — durable against the next unrelated CI deploy, unlike last time. **Confirmed live** via `docker exec` grep on `pacs-backend`. Doctor **self-service** editing (`/auth/me` exposing `mobile`, a Doctor Portal profile field) was explicitly **descoped** — stays Admin-only.
- Phases B–F (schema, Support Agent role, Telegram, Doctor Portal UI, Support Console) remain fully unbuilt — Phase A only unblocks them, it doesn't implement any of them.
- **Share was dropped**, not deferred. The user decided doctors view images and don't redistribute them. Don't reintroduce it — it would require fixing four unbounded `LEFT JOIN app.links … revoked = FALSE` queries (`doctor-patients.js:145`, `patients.js:181`, `mt-studies.js:69`, `patient-portal.js:26`) that duplicate a study row whenever two live Links exist. That defect is real and unfiled as of 2026-08-22; it is **not** part of this work.
- **The user overrode two recommendations**, both toward softer/faster: chose "always accept + honest ETA" over an explicit online/offline shift state, and initially chose full patient PHI in Telegram before accepting the pseudonymous version when shown that Purge cannot reach Telegram. The Purge-can't-reach-it argument is what landed — reuse that framing for any future third-party integration.
- The user wants a chat/socket layer later as the doctor base grows. That's why the model is `support_requests` + `support_messages` (zero rows) and why the Console's transport sits behind a `useSupportFeed()` seam.
- Telegram was chosen because the backend has **no** notification infra at all (no SMTP/SMS/WS/push) and the Bot API needs only `axios`, already a dependency.

Related: [[project-doctor-reports-live]], [[project-frictionless-patient-list-live]], [[feedback-production-deploy-verification]]
