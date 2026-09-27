---
name: project-security-api-exposure-remediation
description: "Critical unauthenticated-API exposure found 2026-09-27 (dental review) — Phase 1 deployed live 2026-09-28, Phase 2 PR open, Phase 3/4 pending"
metadata:
  node_type: memory
  type: project
  originSessionId: d06b5724-4ad2-45a7-84b0-94cfc0a2baf2
  modified: 2026-09-27T18:53:28.630Z
---

**Design doc:** `docs/Security/API_Exposed_Fixation.md` (findings S1–S9, severity critical, found during the Ibn Sina dental design session 2026-09-27 while reviewing this repo for a second deployment). Same findings drove dental decisions in `D:\dh-pacs-dental\docs\SECURITY_REGISTER.md` and `CENTRAL_CHANGES_SPEC.md` — don't let this repo's fix diverge from what the dental Dedicated Instance needs (CC-02 to CC-06).

**Why:** `GET /api/v1/studies` (500 most recent studies + working Link tokens), `POST /api/studies/received`, one-segment `/api/links/:token`, all of DICOMweb (`/dicom-web/`), and the entire backend via `api.dhsolutions.com.bd` needed no login and were confirmed live (200) on production. `requireMt`/`requirePatient`/`requireDoctor` also only checked JWT signature validity, never which role a token was issued for, so any of those three cookies was interchangeable.

**Status by phase:**
- **Phase 1 (S7/S8/S9/API-host) — DEPLOYED LIVE 2026-09-28.** PR [#7](https://github.com/DHS-Ltd/dh-pacs-central/pull/7), commit `e71f688`. Closed the three route shapes at nginx + fully closed `api.dhsolutions.com.bd` (no legitimate caller found anywhere — checked all 4 reachable repos + 5 months of VM nginx logs). Verified post-deploy: those routes 404, `/api/links/resolve/:token` (QR codes) and everything else still 200.
- **Phase 2 (S2 role-bound tokens + MT search scoping) — PR OPEN, NOT YET DEPLOYED.** PR [#8](https://github.com/DHS-Ltd/dh-pacs-central/pull/8), branch `feat/role-bound-tokens`. Code ships with `ROLE_BOUND_TOKENS` env var **off** (no-op for live sessions) — safe to deploy any time. **Must wait 24h after that deploy** (not the design doc's assumed 8h — `patient_jwt` actually lives 24h, only `mt_jwt`/`doctor_jwt` are 8h) before a second deploy flips it to `on`. `requireAdmin` deliberately left untouched — it already re-checks the JWT's email against `app.admin_users` in the DB every request, so it isn't vulnerable to this specific cross-role bypass the way the other three were.
- **Phase 3 (S1 — DICOMweb has no auth at all) — NOT STARTED.** The big one: new `auth_request` nginx endpoint, ~2 days to build, 7 days shadow mode, 1 day to enforce. Also what the dental Dedicated Instance needs from day one (dental ADR 0016 = same design). Scope against `D:\dh-pacs-dental\docs\build\CENTRAL_CHANGES_SPEC.md` before starting.
- **Phase 4 (S3/S4/S6/Orthanc open AE)** — explicitly not urgent, scheduled with the user separately.
- **Open, non-blocking decision:** whether any hospital needs notifying of possible past exposure (Phase 0.4 in the doc). No confirmed evidence of external exploitation found in 5 months of VM nginx logs, but see [[feedback_nginx_real_client_ip_blindspot]] — that "no evidence" is weaker than it looks. This is the user's call, not a technical blocker.

**How to apply:** Before touching any of S1/S2/S8/S9 code paths again, read this file's phase status first — don't re-diagnose from scratch. `main` on GitHub is stale vs. production (see [[feedback_deploy_pipeline_and_pr_base_gotchas]]); always check the VM's actual running image tag before branching for a follow-up phase.
