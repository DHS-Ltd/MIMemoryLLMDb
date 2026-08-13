---
name: Viewer Repo — Memory Pointer
description: The patient-facing OHIF viewer/portal SPA is a SEPARATE repo (ohif-fork) with its OWN Claude project memory. When asked anything about the viewer/portal UI, read that project's memory for current state — not this central one.
type: reference
---
The DICOM **viewer / patient portal UI** at `pacs.dhsolutions.com.bd/viewer` is the OHIF v3 React SPA built from the private fork `DHS-Ltd/ohif-viewer-dhs` (Windows checkout `D:\ohif-fork`, VM build host `/srv/pacs/ohif-fork`). It is **its own Claude Code project with its own memory** — distinct from this central PACS project.

**Canonical, up-to-date viewer knowledge lives THERE, not here:**
`C:\Users\Administrator\.claude\projects\d--ohif-fork\memory\` (start at its `MEMORY.md` index)

When the user asks about the viewer/portal — branding, color palette, mobile UX, toolbar trims, hanging protocols, PWA/manifest, or the viewer-specific build/deploy cycle — **read that directory for current state** rather than answering from this central project.

This central project owns only the **PACS-side** pieces the viewer depends on: `docker-compose.yml`, the runtime-mounted `app-config.js`, nginx, the token landing page, the backend, and Orthanc config. A build-mechanics summary is kept locally in [[OHIF Fork Reference]]; anything deeper or more current belongs to the ohif-fork project memory.
