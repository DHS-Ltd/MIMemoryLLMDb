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

1. ~~MT-gated PUSH design.~~ ✅ Shipped.

**DONE 2026-06-13 — Radiology Report upload feature deployed to Central.** DB migrations p7+p7b applied; `mt-reports.js` + `admin-reports.js` live on VM; Remove (hard-delete, audit-logged) replaces supersession in UI. Full state in [[dh-pacs-program-status]] UPDATE (c). **Portal installer NOT yet rebuilt — do this first next session.**

**IMMEDIATE NEXT (portal installer rebuild):**
```powershell
cd d:\dh-pacs-workstation\portal
npm install
npm run build
cd installer
iscc dh-pacs-portal.iss
```
Then copy `dist\dh-pacs-portal-setup-v0.2.0.exe` to target PC and reinstall. The build bakes in:
- `server.js` — multer proxy routes (field name always `'files'`; image/* binary download)
- `central.ts` — `reportApi` (list/upload/remove/downloadUrl); no explicit Content-Type header
- `ReportPanel.tsx` — badge chip; upload + Remove button

2. **§10 endpoint acceptance tests** (deferred for lack of patient data). When ready: safety-check comparison; hard blocks sex_mismatch / dob_too_far -> 422; soft-block typed_mobile required/mismatch -> 422 (exact string, trim, **NO +88**); undo 15-min same-MT then 403, different-MT/expired 403; admin force-claim/revert; patient report-wrong -> under_review+hidden; flagged-claims report; nightly cross-check alerts; perf <200ms safety-check / <400ms claim. On-box auth: mint JWTs inside `pacs-backend` (has JWT_SECRET) + send as inline cookie (cross-origin cookie jar won't work). Isolated fixtures: site `SITE90_ORTHANC` mt_gated, 2 test MTs, 4 patients engineered vs DICOM `RAHIM UDDIN`/M/1990.

**DONE 2026-06-14 — Combined installer v1.0.0 BUILT.**
`dist\dh-pacs-workstation-setup-v1.0.0.exe` (53.8 MB). Combines Receiver + Portal into a single wizard for new sites. Bundled Node.js 20.19.2. White-label complete (ADR-0007/0008). Branding drop-zone at `branding/`. See [[dh-pacs-program-status]].

**DONE 2026-06-14 — §10 acceptance tests PASSED.**
All site safety acceptance tests (§10 of `docs/SITE_SAFETY_ACCEPTANCE_TEST_GUIDE.md`) confirmed passing.

**DONE 2026-06-14 — BOTH REPOS MERGED TO MAIN. CRON ACTIVE.**
3. ~~Merge `feat/safety-mt-gated` → `main`.~~ ✅ Done.
4. ~~Schedule the nightly cross-check cron.~~ ✅ Done — runs at 02:00 UTC daily, logs to `/var/log/pacs-crosscheck.log` on VM.

**FUTURE SCOPE (not mandatory):**
- Code-sign `dh-pacs-workstation-setup-v1.0.0.exe` — nice-to-have; removes Windows SmartScreen warning for hospital IT. Requires EV certificate (~$300/yr) + Windows SDK signtool.exe. Not blocking shipping.

STILL-OPEN minor: Component A installed to a custom dir **with spaces** may not forward (suspected NSSM arg quoting) — unconfirmed; registry-discovery already fixed the portal side (correctionToBeMade items 7 & 8).

**DONE 2026-06-14 — Radiology Report rename + patient portal display LIVE.**
Filename template, patient portal inline display, portal installer rebuild — all confirmed working end-to-end. See [[dh-pacs-program-status]] UPDATE 2026-06-14.
