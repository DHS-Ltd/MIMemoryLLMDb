---
name: project-doctor-dh-viewer
description: "Doctor DH Viewer — desktop pre-fetch cache on doctor laptops. Design settled 2026-07-13; build plan settled 2026-07-15; M1 (central sync contract: device tokens, manifest, bulk-download, kill switch) BUILT 2026-07-15, DEPLOYED TO PRODUCTION 2026-09-05 (as [[project-dhpacs-doctor-desk]]'s D0 prerequisite). M0/M2–M5 unbuilt."
metadata: 
  node_type: memory
  type: project
  originSessionId: ecc463f5-1862-4468-a1c5-1dbb82c5b2d1
  modified: 2026-09-05T11:03:50.644Z
---

**Doctor DH Viewer** — a Windows desktop app on a Doctor's laptop that runs a **background sync agent**:
pre-fetches newly-arrived Studies from the Doctor's assigned Sites into a **bounded, encrypted, rolling local
cache** and serves them to a **bundled local DHV (OHIF) at `localhost`**, so big studies open **instantly**
instead of streaming over the WAN. Reuses DHV; not a new viewer. Design settled via `/grill-with-docs`
2026-07-13; **build plan** (milestones + implementation-level forks) settled via a second `/grill-with-docs`
session 2026-07-15, triggered by [[project-large-study-load-time]]'s Phase 2 (JPEG-LS compression) shipping to
production 2026-07-14. **Still not built** — this second session was planning-only, no code written.

**Design-phase decisions (2026-07-13, unchanged):** Workstation-shaped architecture (Branded Orthanc + Node
service + local web + Inno Setup/NSSM), download-fed not modality-fed; progressive-enhancement launch via
portal→localhost probe; central↔app contract (device token, manifest, authenticated pixel pull); PHI-at-rest
encryption + teardown propagation + TTL + kill switch; lives in a new folder inside `dh-pacs-doctor`, no new
repo.

**Build-plan decisions (2026-07-15, new):**
- **Build order:** central contract first (fully curl-testable before any desktop code), with the local
  encryption spike running in parallel (no dependency on central).
- **Folder layout:** split components Workstation-style — `doctor-dh-viewer/orthanc/` +
  `doctor-dh-viewer/agent/` (sync agent + local DHV + tray).
- **Status UI:** a real native tray icon (not a bookmarked localhost page like Workstation's MT Portal has) —
  via a Node library with a bundled helper binary (e.g. node-systray), keeping everything in one toolchain.
- **Encryption mechanism:** spike-first — check whether the branded Orthanc's already-bundled (currently
  disabled) `orthanc-advanced-storage` plugin's `StorageEncryption` (confirmed to exist for S3/Azure) also
  works against a **local filesystem** backend. Adopt if yes; fall back to a custom encrypted container
  (mount-on-login) only if not.
- **New endpoints (central):** `POST /api/doctor/device/login` (dedicated, JSON-body token, not a cookie);
  `GET /api/doctor/sync/manifest` (**full authoritative state every poll**, not an incremental delta — a
  missed delta cursor could silently mean a Purge/Revoke never reaches the laptop, the one failure mode this
  design can least afford); `GET /api/doctor/sync/studies/:uid/download` (dedicated bulk route proxying
  Orthanc's native whole-study ZIP archive, NOT `/dicom-web`).
- **`/dicom-web` closing — DESCOPED from this build.** Discovered mid-session: closing it is a **platform-wide**
  fix, not doctor-scoped — `/dicom-web` is the *only* thing every existing viewer (doctor, patient, admin)
  relies on today, with zero auth carried through their `/open`/`/viewer?StudyInstanceUIDs=` URLs (auth checked
  once at URL-generation time only). A real fix needs a short-lived per-open capability token across all three
  portals + nginx `auth_request` — its own future initiative. Safe to descope here because the new agent's
  bulk-pull uses its own separately-secured route and never touches `/dicom-web`. **Central ADR 0017 amended
  in place 2026-07-15** to reflect this reversal of its original "close /dicom-web" bullet — do not silently
  let this security gap disappear from tracking.
- **Installer:** one combined installer (not Workstation's two-separate-installer precedent) — a doctor is a
  single non-technical end user, unlike a site technician who intentionally updates Orthanc/portal
  independently.

**Milestones (build plan):** M0 encryption spike (parallel) → M1 central contract → M2 local Orthanc + headless
sync agent → M3 tray/login UI → M4 bundled local DHV + portal handoff + validation gates → M5 combined
installer + pilot with one real doctor/site.

**M1 BUILT 2026-07-15** (central repo `d:\Pacs_Viewer_Storage_Project`, code only — **not deployed, migration
not applied to prod**). Migration `2026-07_p11_doctor_device_tokens.sql` (+rollback); middleware
`requireDoctorDevice.js` (opaque bearer token, SHA-256 hash stored, DB re-checked every call → revocation lands
next request; reads live site assignment); routes `doctor-sync.js` (device/login, sync/manifest,
sync/studies/:uid/download); Orthanc `getStudyArchiveStream()` archive proxy; admin kill-switch endpoints on
`admin-doctor-users.js`. Verified by `doctor-sync.test.js` — 12 cases, real routers+middleware, faked
DB/Orthanc (no local infra), full suite 39/39 green. **Key implementation-fork resolved:** the design doc's
per-study manifest status enum (`new/unchanged/purged/revoked/out-of-scope`) was replaced by returning the
**authoritative desired-cache set** with **set-difference eviction** (`new`/`unchanged` are unknowable
server-side; `out-of-scope` is only realizable by agent-side diffing anyway) — strictly stronger, faithful to
the "never silently miss a teardown" priority. Next: M0 spike / M2 local agent, both still unbuilt.

**Docs:** design `dh-pacs-doctor/docs/DoctorDHViewer/Doctor_DH_Viewer_Plan.md`; build plan
`dh-pacs-doctor/docs/DoctorDHViewer/Doctor_DH_Viewer_Build_Plan.md`; ADR central
`docs/adr/0017-doctor-dh-viewer-local-prefetch-cache.md` (amended 2026-07-15).

**Update 2026-09-05: M1 deployed to production.** The [[project-dhpacs-doctor-desk]] build needed the same
Device Token contract, so its D0 milestone finally shipped what this session built four months earlier:
migration `2026-07_p11_doctor_device_tokens.sql` applied, `doctor-sync.js` + `requireDoctorDevice.js` deployed,
plus two NEW routes added for the Desk (`POST /device/session`, `POST /device/logout` — Desk-specific, not
part of this design's original sync-agent contract but sharing its auth transport). Verified live via curl:
`/device/login` correctly 401s bad credentials, kill-switch revocation still confirmed to work. **M2–M5 (local
Orthanc, sync agent, bundled local DHV, installer) remain entirely unbuilt** — only the central contract is
live; there is still no prefetch cache anywhere. See `docs/DoctorDesk/DHPacs_Doctor_Desk_Plan.md` §4 for the
exact deploy record and the surgical `index.js` patch used (the VM's live `index.js` had drifted from this
repo's git history, so a hand-verified patch was used instead of pushing the local file wholesale — do not
assume local git state matches production for this file).
