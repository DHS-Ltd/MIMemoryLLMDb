---
name: project-doctor-viewer-oncology
description: Doctor Viewer (Oncology PET-CT) shipped+deployed 2026-06-22 — tmtv + longitudinal modes served at /viewer-doctor off the same pacs-ohif-dhs image; real PET-CT/doctor-login testing still pending
metadata: 
  node_type: memory
  type: project
  originSessionId: 13e784f1-f850-498e-bb12-a302aa670682
---

The **Doctor Viewer** (diagnostic viewer for hospital doctors; first instance is
the **Oncology PET-CT Viewer**) was designed and wired in one session on
2026-06-22. **Deployed live to production the same day**; container-level smoke
tests pass. **Still owed: real testing with an actual PET-CT study + a real
doctor login** (user deferred this).

## Architecture (decided this session)
- It is **not** a new fork or a new build. It reuses OHIF modes already vendored
  in this fork: **`tmtv`** (PET/CT fusion, SUV, threshold tumor-volume) for PET-CT
  studies, and **`longitudinal`** ("DH Dicom Viewer", basic + measurement-tracking
  + seg) as the fallback for everything else.
- Cornerstone3D was **already the rendering core** of the patient viewer — nothing
  to "install". The work was exposing/serving existing capability.
- Served off the **same `pacs-ohif-dhs` image and same `ohif` container** as
  patients, via the **demo-viewer nginx pattern** (config interception +
  `sub_filter`), at **`/viewer-doctor`**. No second container, no second build.
- Full rationale: ohif-fork **`docs/adr/0001-doctor-viewer-as-second-deployment-of-patient-fork.md`**
  and **`CONTEXT.md`** (terms: Patient Viewer, Doctor Viewer, Oncology PET-CT Viewer,
  Doctor Portal). This **overrides** CLAUDE.md's "patient viewer only" rule.

## Where the wiring lives (mostly NOT in this repo)
The viewer is composed from existing modes here; the actual changes are in the
**PACS repo** (`D:\Pacs_Viewer_Storage_Project\deploy`) + **central backend**:
- `config/ohif/doctor-app-config.js` (new) — routerBasename `/viewer-doctor`, same
  Orthanc source, DHS brand, **`showStudyList:false`**.
- `config/nginx/nginx.conf` — `/viewer-doctor/app-config.js` intercept + `/viewer-doctor/`
  proxy with `sub_filter`.
- `compose/docker-compose.yml` — extra nginx volume mount for the doctor config.
- `backend/src/routes/doctor-studies.js` — `/open` probes Orthanc via `listSeries`;
  **PT+CT → `/viewer-doctor/tmtv`, else `/viewer-doctor/viewer`** (safe fallback).
The **`dh-pacs-doctor` portal SPA needs no code change** — its `openStudy()` already
opens whatever `viewerUrl` the backend returns.

## Non-obvious facts that shaped it (verify before relying)
- **`/dicom-web` is ungated at nginx.** Auth is at the portal's `open` endpoint
  (site-scope check), not a DICOMweb token. The URL `viewerToken` only feeds patient
  share/report endpoints, not DICOMweb. → Doctor viewer needs **no viewer token**,
  and **`showStudyList` must stay false** or a doctor could QIDO all studies.
- **routeName mapping**: `basic`→`basic`, `longitudinal`→`viewer` (displayName "DH
  Dicom Viewer"), `tmtv`→`tmtv`. So patient `/viewer` already loads longitudinal.
- **Toolbar patient-trim is mobile-only** (`window.innerWidth < 768` in
  `extensions/default/src/Toolbar/Toolbar.tsx`); desktop shows all tools, which is
  why `longitudinal` works as a doctor reading mode unchanged.

## Doctor session token (also changed this session)
`doctor_jwt` is now a **sliding 8h idle window** (was hard 8h): `requireDoctor.js`
re-issues the cookie+token on every authenticated request; cookie/token helpers
centralized there and imported by `doctor-auth.js`. Trade-off: a doctor deactivated
mid-session keeps access until 8h idle (status only re-checked at login).

**Why:** patient and doctor UX/diagnostic needs differ, but maintaining a second
fork is costly; the modes already existed. **How to apply:** for any doctor 3D/MPR/
fusion need, prefer wiring existing Cornerstone3D modes via config, not new source.
Heavy interactive doctor tooling beyond this still belongs in `dh-pacs-doctor` per
[[project-multi-repo-architecture]]. Related: [[project-film-view-feature]].
