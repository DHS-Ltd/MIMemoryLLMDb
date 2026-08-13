---
name: reference-companion-repo-map
description: "Full map of every repo in the DH PACS platform family, where each lives on disk, and which feature areas belong to which repo"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4ce62a68-ae42-457c-aebb-e82ab74f4ef9
---

Documented in README.md's "Related Repositories" section (added 2026-07-12) and cross-checked against disk/GitHub that day:

| Repo | Location | Feature area |
|---|---|---|
| `dh-pacs-central` (this repo) | `d:\Pacs_Viewer_Storage_Project`, github.com/DHS-Ltd/dh-pacs-central | Central API, admin/patient/doctor UI shells, DB schema, links, audit, nginx |
| `dh-pacs-workstation` | `D:\dh-pacs-workstation` — **no GitHub remote at all, confirmed intentional** (distributed as built installers, not source) | On-prem installer: Component A (Orthanc receiver) + Component B (MT operator portal) |
| `dh-pacs-doctor` | `D:\dh-pacs-doctor`, github.com/DHS-Ltd/dh-pacs-doctor | Doctor portal SPA — login, patient list, doctor reports, test catalog |
| `dh-pacs-website` | github.com/DHS-Ltd/dh-pacs-website (renamed from `DH-PACs-Solutions`, old URL still redirects). Not found locally on this machine as of 2026-07-12 — likely cloned elsewhere only | Marketing site — see [[reference_mimp004_business_memory]] for the authoritative MIMP-004 tracker |
| `ohif-viewer-dhs` | `D:\ohif-fork`, github.com/DHS-Ltd/ohif-viewer-dhs, branch `dhs-main` | Core DICOM viewer fork — branding, hanging protocols, toolbar |
| `ohif-extension-dhs-cardiac` | `D:\ohif-extension-dhs-cardiac` — no remote, **not previously documented anywhere in CLAUDE.md or memory** | Cardiac LVA (ejection fraction, chamber volumes). Status as of 2026-07-12: scaffold only, no logic implemented. Bundled into shared `pacs-ohif-dhs` image, surfaced at `/viewer-cardiac`. Blocked on a real single-plane LVG study to inspect. |
| `ohif-extension-dhs-liver` | `D:\ohif-extension-dhs-liver` — no remote, **not previously documented anywhere in CLAUDE.md or memory** | Liver & lesion volumetry (volume cm³, tumor-burden %). Status as of 2026-07-12: scaffold only, zero commits. No mode package — rides inside existing `longitudinal` viewer as opt-in panel. Blocked on a real contrast CT abdomen study. |

**Why this exists:** discovered mid-session (2026-07-12) that CLAUDE.md's companion-project list was incomplete (missing the two OHIF extensions entirely) and stale in one place (Doctor Portal marked "Planned" when it had been live since 2026-06-13 — since fixed in CLAUDE.md). The extension repos in particular won't show up from reading this repo's own files; they only exist as sibling directories on disk.

**How to apply:** Before scoping any feature request, check this table (or README.md's live copy) for which repo actually owns that surface — don't assume everything is in `dh-pacs-central`. If asked about cardiac/liver viewer features, they're pre-implementation scaffolds, not yet functional.
