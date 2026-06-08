---
name: dh-pacs-next-session-tests
description: "Next-session plan for DH PACS Workstation — START with the MT-gated push design, then the §10 acceptance tests (deploy + installs + auto-forward all DONE)"
metadata:
  node_type: memory
  type: project
  originSessionId: f86a8065-9995-43fc-9949-75cb8376b295
---

What's left for DH PACS Workstation. **DONE** (through 2026-06-06): central P1.5 deployed; a real site live end-to-end (Component A+B, MT login, auto-forward to central working); all 8 installer/integration bugs fixed and both installers rebuilt to install unattended. See [[dh-pacs-program-status]].

**DONE 2026-06-07 — MT-gated match-then-push is built, deployed, and LIVE** (+ upload-progress UX + Tier-A telemetry). Full state in [[dh-pacs-mt-push-architecture]] and [[dh-pacs-program-status]]. So the item below is complete:

1. ~~MT-gated PUSH design.~~ ✅ Shipped: portal is the sole uploader (Site Mode via box `.env` `LINK_MODE`); match → claim-local mints link → background push → gated handoff with real progress bar + non-blocking queue; central endpoints + migration deployed.

2. **§10 endpoint acceptance tests** (deferred for lack of patient data). When ready: safety-check comparison; hard blocks sex_mismatch / dob_too_far -> 422; soft-block typed_mobile required/mismatch -> 422 (exact string, trim, **NO +88**); undo 15-min same-MT then 403, different-MT/expired 403; admin force-claim/revert; patient report-wrong -> under_review+hidden; flagged-claims report; nightly cross-check alerts; perf <200ms safety-check / <400ms claim. On-box auth: mint JWTs inside `pacs-backend` (has JWT_SECRET) + send as inline cookie (cross-origin cookie jar won't work). Isolated fixtures: site `SITE90_ORTHANC` mt_gated, 2 test MTs, 4 patients engineered vs DICOM `RAHIM UDDIN`/M/1990.

**THEN (release):**
3. Merge `feat/safety-mt-gated` -> `main` after §10 passes.
4. Schedule the nightly cross-check cron (`deploy/backend/scripts/safety-crosscheck.js`) once a site is `mt_gated`.
5. **Code-sign** both `.exe` (still unsigned); optional version bump 0.1.0 -> 0.1.x; expose the `link_mode` toggle in the admin Sites page; tag `v1.0.0`.

STILL-OPEN minor: Component A installed to a custom dir **with spaces** may not forward (suspected NSSM arg quoting) — unconfirmed; registry-discovery already fixed the portal side (correctionToBeMade items 7 & 8).
