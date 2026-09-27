---
name: business-admin-role-live
description: "Business Admin role (admin_users table, Role+Capability model) — actually deployed and login-tested 2026-08-30, after sitting undeployed since 2026-07-09"
metadata: 
  node_type: memory
  type: project
  originSessionId: 54033d90-dd43-40a3-9da6-63d13e76bea5
  modified: 2026-08-30T12:17:08.735Z
---

## Status (2026-08-30) — LIVE, user-confirmed login works

The Business Admin role (ADR 0013, commit `d6fcec2`, "feat(admin): add Business Admin role via Role + Capability tables") was originally built and committed 2026-07-09, but **was never actually deployed** — it sat on an unmerged feature branch for seven weeks. Discovered 2026-08-30 when the user tried to find the "create Business Admin" UI and it didn't exist in production.

**What was found on investigation:**
- Production `pacs-backend` was still running the old single-operator login: `routes/auth.js` checked `email === process.env.ADMIN_EMAIL` directly, ignoring `app.admin_users` entirely. `middleware/auth.js` only exported `requireAdmin` — no `requireRole`/`requireCapability`.
- The `admin-users.js` route file (create/list/edit admin accounts) did not exist in the deployed container at all.
- Deployed admin-ui bundle had no "Admin Users" nav item, no `/admin-users` pages.
- **But** `app.admin_users` in the production DB already had the full new schema (role, role_capabilities table, password_hash column, CHECK constraints) **and already contained a `business_admin` row** (`mtalmamun82@gmail.com`, created 2026-07-09) with a password hash set — inserted directly, presumably during an earlier build/QA pass, bypassing the (never-deployed) app code. That account could not log in to anything, because the running login route didn't know `app.admin_users` existed.

**Fix applied (2026-08-30):**
1. Cherry-picked `d6fcec2` onto a fresh branch off latest `origin/main` (clean cherry-pick, no conflicts) — deliberately did NOT merge the whole `feat/patient-pdf-redesign-settings` branch, which carries a lot of unrelated in-flight work (doctor-sync P11/P12, JPEG-LS docs, Support Agent design).
2. Opened and merged [PR #6](https://github.com/DHS-Ltd/dh-pacs-central/pull/6) into `main`.
3. Ran the `Deploy` GitHub Actions workflow (`workflow_dispatch`, self-hosted runner, `deploy/scripts/ci_deploy.sh`) against `main` — rebuilt `pacs-backend` + `pacs-admin-ui`, health check passed automatically.
4. Verified inside the running containers: `admin-users.js` present, `auth.js` exports `requireCapability`/`requireRole`, rebuilt admin-ui JS bundle contains `"Admin Users"` and `"business_admin"` literal strings.
5. No DB migration needed — schema was already correct from the earlier manual apply.
6. **User confirmed 2026-08-30: logged in as the existing `mtalmamun82@gmail.com` Business Admin account successfully, tested working.**

**Current accounts in `app.admin_users`:**
| Role | Email | Created |
|---|---|---|
| admin | `directhospitalsolutionsltd@gmail.com` | 2026-07-08 |
| business_admin | `mtalmamun82@gmail.com` | 2026-07-09 |

**How to apply:** Business Admin creation now works end-to-end via the Admin Users page (`/admin-users/new`), visible only when logged in as the `admin`-role account. Business Admin accounts already had (and still have) full access to create MT/Doctor users — that was never gated, only admin-account management itself is Admin-only (ADR 0013). See [[feedback_db_migration_ahead_of_code_deploy]] for the general diagnostic lesson this surfaced. Supersedes the "no admin_users table" description in [[admin_frontend_build_status]] (that memory describes the pre-ADR-0013 env-var-only login, now retired as a live credential check — it's kept only as a bootstrap seed for empty environments).
