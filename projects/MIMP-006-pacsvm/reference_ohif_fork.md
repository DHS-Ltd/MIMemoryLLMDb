---
name: OHIF Fork Reference
description: DHS-Ltd/ohif-viewer-dhs private fork details — GitHub repo, branches, SSH aliases, build mechanic, key file paths, version pin.
type: reference
originSessionId: 7afc5ebd-90fe-4259-b4da-af3266b241ea
---
The OHIF viewer is built from a private fork at **`DHS-Ltd/ohif-viewer-dhs`** on GitHub (private repo). All viewer changes flow through this fork.

## Repository

- **GitHub URL:** `git@github.com:DHS-Ltd/ohif-viewer-dhs.git`
- **Long-lived branch:** `dhs-main` — produces tagged release images (`pacs-ohif-dhs:vN`).
- **Forked from:** OHIF/Viewers tag `v3.12.0` (commit `04b121c1b`, released 2026-02-06).
- **Upstream remote:** `upstream` → `https://github.com/OHIF/Viewers.git` (use `git fetch upstream` + merge for upstream pulls).

## Working copies

- **Windows dev:** `D:\ohif-fork\` — edit here, commit, push to origin.
- **VM build host:** `/srv/pacs/ohif-fork/` on `192.168.1.10` — pull from origin, run `docker compose build ohif` from `/srv/pacs/compose/`.

## SSH access (deploy keys, NOT user keys)

Two deploy keys registered on the GitHub repo, both with write access:

| Source machine | Key path | Title in GitHub | SSH config alias |
|---|---|---|---|
| VM `192.168.1.10` | `~/.ssh/id_ed25519_ohif` | `pacs-vm` | `github-ohif` |
| Windows dev | `C:\Users\Administrator\.ssh\id_ed25519_ohif` | `windows-dev` | `github-ohif` |

Both machines clone/push via `github-ohif:DHS-Ltd/ohif-viewer-dhs.git`.

## Key files inside the fork

- `Dockerfile` (root) — upstream's multi-stage build (bun + lerna → nginx-unprivileged). Used as-is for `pacs-ohif-dhs:vN`.
- `.docker/Viewer-v3.x/default.conf.template` — nginx config template (port/PUBLIC_URL substituted by entrypoint).
- `.docker/Viewer-v3.x/entrypoint.sh` — gzip-compresses `app-config.js` at runtime (this is why the compose mount must NOT be `:ro`).
- `platform/app/public/assets/dhs-logo.svg` — DHS brand logo (copy of `D:\Pacs_Viewer_Storage_Project\DHV_logo.svg`).
- `platform/app/public/assets/dhs-favicon.svg` — same SVG, served as favicon.
- `platform/app/public/html-templates/index.html` — page title, app-name meta, favicon links.
- `platform/ui-next/src/components/Header/Header.tsx` — header component (NOT edited; uses `WhiteLabeling.createLogoComponentFn` hook from app-config.js).
- `BRAND_TODO.md` (root) — placeholder vs final brand-asset checklist for design team.

## Build mechanic

- Build context: fork root (`/srv/pacs/ohif-fork`).
- Build command: `cd /srv/pacs/compose && docker compose build ohif`.
- Output image: `pacs-ohif-dhs:vN` (currently `:v1`).
- Build time: ~5–8 min cold, ~2 min with cache.
- Build output goes to `platform/app/dist` inside the builder stage, copied to `/usr/share/nginx/html/` in the final image.

## Compose integration

`/srv/pacs/compose/docker-compose.yml` `ohif:` service has both `image: pacs-ohif-dhs:v1` AND a `build:` block pointing to the fork root, so `docker compose build ohif` works without separate `docker build` commands.

App-config mount is `:rw` (NOT `:ro`) so the entrypoint's gzip step can run.

## Upgrade workflow (when OHIF v3.13+ releases)

1. On Windows or VM: `cd ohif-fork && git fetch upstream && git checkout dhs-main && git merge upstream/v3.13.0` (resolve any conflicts in our branded files).
2. Re-run validation pass (paths like `platform/ui-next/src/components/Header/Header.tsx` may shift).
3. Commit merge, push to origin.
4. Rebuild: `docker compose build ohif` on VM; tag as `:v2` if shipping.
