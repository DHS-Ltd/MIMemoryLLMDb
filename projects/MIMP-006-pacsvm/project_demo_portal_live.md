---
name: project-demo-portal-live
description: Demo portal fully live 2026-05-30 — files, nginx config, sub_filter fix, deploy workflow, SSH alias, path mapping
metadata:
  type: project
---

## Demo portal LIVE as of 2026-05-30

Gateway: `https://pacs.dhsolutions.com.bd/demo` → viewer: `https://pacs.dhsolutions.com.bd/demo-viewer/`
Both verified working in browser. Study list shows CloudFront demo data (CT, MRI, PET-CT, RTSTRUCT etc.).

**Why:** Closes the conversion gap for hospital decision-makers visiting the marketing site — they can explore the full DICOM viewer without a sales call.

**How to apply:** If anyone asks about the demo portal, this memory + [[project-website-work]] cover it. No OHIF image rebuild is needed for any demo portal change — all config is nginx + static files.

---

## Files (all in PACS repo `D:\Pacs_Viewer_Storage_Project`)

| Action | File | What it does |
|---|---|---|
| CREATED | `deploy/config/ohif/demo-app-config.js` | OHIF config: CloudFront CDN datasource, `routerBasename: '/demo-viewer'`, `showStudyList: true`, DHS whiteLabeling, `investigationalUseDialog: never` |
| CREATED | `deploy/config/nginx/demo.html` | Branded gateway page: navy/teal, DHS logo, 4 feature cards, `noindex` meta, "Launch the Viewer" CTA → `/demo-viewer/`, secondary CTA → `dhsolutions.com.bd/#contact` |
| MODIFIED | `deploy/config/nginx/nginx.conf` | 3 location blocks added before catch-all: `= /demo`, `= /demo-viewer/app-config.js` (alias intercept), `/demo-viewer/` (OHIF proxy + sub_filter) |
| MODIFIED | `deploy/compose/docker-compose.yml` | 2 new nginx volume mounts: `demo.html → /usr/share/nginx/html/demo.html:ro`, `demo-app-config.js → /etc/nginx/conf/demo-app-config.js:ro` |

---

## Critical nginx detail: sub_filter

OHIF is built with `PUBLIC_URL=/` (hardcoded in Dockerfile line 72). This makes `index.html` always request `/app-config.js` as an **absolute path**, regardless of what sub-path the page is served from. Without the sub_filter, the browser loads the production Orthanc config and React Router 404s at `/demo-viewer/`.

The `location /demo-viewer/` block has:
```nginx
proxy_set_header Accept-Encoding "";   # disables gzip so sub_filter can read plaintext HTML
sub_filter 'src="/app-config.js"' 'src="/demo-viewer/app-config.js"';
sub_filter_once on;
```

This rewrites the script src in OHIF's index.html response before it reaches the browser. The browser then requests `/demo-viewer/app-config.js`, which the `location = /demo-viewer/app-config.js` intercept catches, serving `demo-app-config.js`.

**This sub_filter is scoped to `location /demo-viewer/` only — it has zero effect on the production patient viewer (`location /`).**

---

## Deploy workflow for future changes

**VM is NOT a git clone.** The repo has `deploy/` prefix; VM paths don't. Path mapping rule:

| Windows repo path | VM path |
|---|---|
| `deploy/config/nginx/nginx.conf` | `/srv/pacs/config/nginx/nginx.conf` |
| `deploy/config/nginx/demo.html` | `/srv/pacs/config/nginx/demo.html` |
| `deploy/config/ohif/demo-app-config.js` | `/srv/pacs/config/ohif/demo-app-config.js` |
| `deploy/compose/docker-compose.yml` | `/srv/pacs/compose/docker-compose.yml` |

```powershell
# 1. Commit + push from Windows PowerShell (for version history)
cd D:\Pacs_Viewer_Storage_Project
git add deploy/config/nginx/nginx.conf   # whichever files changed
git commit -m "..."
git push origin main

# 2. scp FROM Windows TO VM — SSH alias is "pacsvm" (NOT "dhserver")
scp deploy/config/nginx/nginx.conf        maidul@pacsvm:/srv/pacs/config/nginx/nginx.conf
scp deploy/config/nginx/demo.html         maidul@pacsvm:/srv/pacs/config/nginx/demo.html
scp deploy/config/ohif/demo-app-config.js maidul@pacsvm:/srv/pacs/config/ohif/demo-app-config.js
scp deploy/compose/docker-compose.yml     maidul@pacsvm:/srv/pacs/compose/docker-compose.yml
```

```bash
# 3. On the VM
docker exec pacs-nginx nginx -t                                           # validate
docker exec pacs-nginx nginx -s reload                                    # nginx.conf-only changes
# OR:
cd /srv/pacs/compose && docker compose up -d --force-recreate --no-deps nginx  # when volumes changed
```

**When to use what:**
- `nginx -s reload` — nginx.conf or static HTML content changes only
- `--force-recreate` — any time docker-compose.yml volume mounts changed

**SSH alias:** `pacsvm` (defined in `C:\Users\Administrator\.ssh\config`, resolves to `192.168.1.10`)

---

## What's still not done

- Marketing site (`dhsolutions.com.bd`) links not yet added — guide §8 recommends:
  1. Hero section — ghost "Try the Viewer Now →" button
  2. Features section — "See it live → Try the interactive demo"
  3. How It Works section — contextual inline link at step 3
