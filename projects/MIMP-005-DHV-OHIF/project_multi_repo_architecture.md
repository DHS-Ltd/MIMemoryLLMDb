---
name: project-multi-repo-architecture
description: "The DHS viewer spans three repos — ohif-fork (this), PACS repo on VM (compose + app-config.js + backend), and a future extension repo; know which one owns what before editing"
metadata: 
  node_type: memory
  type: project
  originSessionId: 166f59ff-4dd5-4370-91b6-893b33f68d3c
---

The DHS viewer customization is split across **three repos by design**:

| Repo | Owns | Where it lives |
|---|---|---|
| `ohif-fork` (this) | OHIF SPA source, brand assets, layout patches, toolbar trims, custom extension wiring. Builds `pacs-ohif-dhs:vN`. | `d:\ohif-fork` (dev), `git@github.com:DHS-Ltd/ohif-viewer-dhs.git` (origin) |
| PACS repo | `docker-compose.yml`, `app-config.js` (mounted at runtime), nginx config, token landing page (`viewer.html`), backend (`/api/links/resolve`, etc.), Orthanc config | `/srv/pacs/` on the production VM |
| `ohif-extension-dhs-patient` | Custom extension package `@dhsolutions/extension-patient` for Phase C panels (patient info, share, report) | Not created yet — Phase C |

**Why:** the split keeps upstream-OHIF merges cheap. `app-config.js` (Tier 1 customization) lives in the PACS repo and never requires rebuilding the image. Source edits (Tier 3) here. New features (Tier 4) in a separate extension package, so they don't pollute `extensions/default` and survive upstream upgrades. See [[project-tier-decision]] for the tier rationale.

**How to apply:**
- Before editing this fork, ask: "could this go in `app-config.js` instead?" If yes, that change belongs in the PACS repo, not here.
- New features (panels, toolbar buttons, modes) go in the extension repo, not in `extensions/default`.
- The PACS-repo `app-config.js` is mounted into the container with `:rw` (entrypoint gzips it in place) — don't mount it read-only.
- Build sequence is: this fork → docker image → consumed by PACS-repo `docker-compose.yml`. Both repos need touching for a release.
