---
name: decision-branding-logo
description: "Branding decision — two separate logos: DHV for OHIF viewer, DHP for all PACS central surfaces (admin/patient/doctor portals + viewer loading page)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 809d919d-6d82-468b-b7a4-e38a4d3566fb
---

## Decision — 2026-06-16

Two distinct brand identities, intentionally kept separate:

| System | Logo file | Where deployed |
|---|---|---|
| OHIF Viewer (`pacs-ohif-dhs` fork) | `DHV_logo.svg` (DH Dicom Viewer) | Baked into OHIF Docker image — do NOT touch |
| PACS Central (admin/patient/doctor/viewer loading) | `DHP_Logo_Wording.png` (logo + wordmark) | `/brand/dhs-logo.png` via nginx static |
| PACS Central favicon | `DHP.svg` (icon only, square) | `/brand/dhs-favicon.svg` via nginx static |

**Source assets:** `docs/Asset/DHP_Logo_Wording.png` and `docs/Asset/DHP.svg`

**Why:** The OHIF viewer is a separate fork and uses the DHV identity. The admin, patient, and doctor portals represent the DH PACS product brand and use the DHP identity. These must stay separate even if future corrections are needed.

## Rule — Future Logo Updates

### To update the DHP portal logo (admin / patient / doctor)

1. Replace `docs/Asset/DHP_Logo_Wording.png` with the new file (keep the filename).
2. SCP it to the VM: `scp docs/Asset/DHP_Logo_Wording.png maidul@192.168.1.10:/srv/pacs/config/nginx/assets/dhs-logo.png`
3. Reload nginx (no rebuild needed — it's a static file): `ssh … "docker exec pacs-nginx nginx -s reload"`
4. Verify: `curl -si http://localhost/brand/dhs-logo.png` → 200 image/png

No SPA rebuilds needed. The file is served directly by nginx from the bind-mounted assets dir.

### To update the DHP favicon (all portals)

Same steps as above but with `docs/Asset/DHP.svg` → `/srv/pacs/config/nginx/assets/dhs-favicon.svg`.

### To update the DHV viewer logo (OHIF toolbar)

The logo is baked into the `pacs-ohif-dhs` Docker image via the OHIF fork at `D:\ohif-fork\` (branch `dhs-main`). Steps:
1. Edit the logo file inside the OHIF fork.
2. Rebuild: `docker compose build ohif && docker compose up -d ohif` on the VM.
3. Do NOT touch `/srv/pacs/config/nginx/assets/` — that is DHP territory only.

### NEVER do
- Add a `/assets/` location block to nginx.conf — it blocks OHIF's own static files (`/assets/dhs-logo.svg`, PWA icons).
- Reference `/dhs-logo.png` (bare path) in any SPA — falls through to OHIF catch-all, returns HTML silently.
- Use the same logo file for both DHV viewer and DHP portals — they are intentionally separate brand identities.

## Deployment architecture

All PACS central logo/favicon assets are served from a **single nginx static location**:
- VM path: `/srv/pacs/config/nginx/assets/` (bind-mounted into nginx container as `/brand/`)
- URL path: `/brand/dhs-logo.png` and `/brand/dhs-favicon.svg`
- nginx block: `location /brand/ { root /usr/share/nginx/html; }` in `deploy/config/nginx/nginx.conf`
- docker-compose mount: `assets:/usr/share/nginx/html/brand:ro`

**Why `/brand/` not `/assets/`:** OHIF bakes its own static files at `/assets/` (logo, favicons, PWA icons). If nginx has a `/assets/` location block, it intercepts ALL `/assets/*` requests, blocking OHIF's own `dhs-logo.svg` from being served by the OHIF container. Using `/brand/` for portal assets avoids this collision entirely.

**Critical gotcha:** SPAs must reference `/brand/dhs-logo.png` — NOT `/dhs-logo.png`. A bare `/dhs-logo.png` request falls through to the OHIF catch-all (`/` proxy) which returns OHIF's `index.html` as `text/html`, breaking the image silently (HTTP 200 but wrong content-type).

## Per-surface references

Each SPA `index.html` has `<link rel="icon" href="/brand/dhs-favicon.svg">`. All `Layout.tsx` and `LoginPage.tsx` files across admin-ui, patient-ui, and doctor-ui use `<img src="/brand/dhs-logo.png">`.

**Doctor portal note:** `D:\dh-pacs-doctor` has no git remote — changes must be SCP'd directly to `/srv/pacs/doctor-ui/` on the VM before rebuilding. See [[feedback-vm-file-transfer]].
