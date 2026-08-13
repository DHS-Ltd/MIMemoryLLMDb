---
name: project-multi-repo-architecture
description: "The DHS system spans four repos by audience — ohif-fork (patient viewer), PACS repo (infra), dh-pacs-doctor (doctor workstation), and a future extension repo; know which one owns what before editing"
metadata: 
  node_type: memory
  type: project
  originSessionId: 166f59ff-4dd5-4370-91b6-893b33f68d3c
---

The DHS viewer customization is split across **four repos by audience**:

| Repo | Audience | Owns | Where it lives |
|---|---|---|---|
| `ohif-fork` (this) | **Patients** | OHIF SPA source, brand assets, mobile UX, patient-facing features (share, report view, film view). Builds `pacs-ohif-dhs:vN`. | `d:\ohif-fork` (dev) |
| PACS repo | Ops/Infra | `docker-compose.yml`, `app-config.js`, nginx config, backend API, Orthanc config | `/srv/pacs/` on VM |
| `dh-pacs-doctor` | **Hospital doctors** | Dedicated workstation viewer with full interactive tools — film layout builder (Option B), advanced hanging protocols, measurements, reporting. | `D:\dh-pacs-doctor` (planned, not yet created) |
| `ohif-extension-dhs-patient` | Dev/packaging | Custom extension `@dhsolutions/extension-patient` for Phase C patient panels | Not created yet — Phase C |

**Critical audience split (decided 2026-06-14):**
- `ohif-fork` = **patient viewer only**. All features here are for patients viewing their own scans. No doctor workflow tools here.
- `dh-pacs-doctor` = **doctor/hospital workstation viewer**. The full interactive film layout builder (drag-and-drop cell assignment, grid picker, DICOM print) lives there, not here.
- Film view in `ohif-fork` = **Option A only** — clean lightbox look with auto-populated grid, no manual cell assignment. Patient experience, mobile-first.

**Why the split:** Patient and doctor UX needs are fundamentally different. Patients need a clean, cinematic, non-intimidating view. Doctors need full tool control, measurement tools, print workflow, and multi-monitor support. Keeping them in separate repos prevents doctor-complexity leaking into patient UX and allows independent release cycles.

**How to apply:**
- Before adding a feature to `ohif-fork`, ask: "is this for a patient or a doctor?" If doctor, it belongs in `dh-pacs-doctor`.
- Before editing this fork, ask: "could this go in `app-config.js` instead?" If yes, that change belongs in the PACS repo.
- New patient-facing features (panels, buttons) go in the extension repo, not in `extensions/default`.
- Build sequence: this fork → docker image → consumed by PACS-repo `docker-compose.yml`.

**Correction (2026-06-22):** `dh-pacs-doctor` is a **browse-and-launch portal SPA**
(login, patient list, "Open study"), NOT a viewer. The doctor's actual diagnostic
**viewer** is NOT a separate fork — it's the existing `tmtv` + `longitudinal` OHIF
modes served as a second config off the same `pacs-ohif-dhs` image at `/viewer-doctor`
(demo-viewer nginx pattern). The portal just opens the URL the backend returns. So
"doctor workstation viewer = separate repo with full tools" (above) is superseded for
the read/measure/fusion case. See [[project-doctor-viewer-oncology]] and ohif-fork
`docs/adr/0001`. Truly heavy doctor-only tooling (film layout builder Option B, DICOM
print) may still warrant separate work, but the core viewer does not.
