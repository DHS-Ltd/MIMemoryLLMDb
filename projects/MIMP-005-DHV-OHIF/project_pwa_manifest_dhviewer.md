---
name: pwa-manifest-dhviewer
description: "PWA manifest name renamed OHIF Viewer → DHViewer so Chrome's \"Install / Open in App\" prompt shows DH branding; committed 0b2f0c445 on dhs-main 2026-06-06, deployed as pacs-ohif-dhs:v1"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8269d753-41a5-416b-b3b7-dc3dbfc2e559
---

The browser "Install OHIF" / "Open in App" popup is the **OHIF PWA install prompt** — driven by `platform/app/public/manifest.json` (`"display": "standalone"`), nothing to do with patient-data analysis. Chrome reads `name` for the prompt text; it says "Install …" before install and "Open in App" after the PWA is already installed on that profile.

**Change made (2026-06-05):** `manifest.json` `name`/`short_name`/`description` set to **`DHViewer`** (was `OHIF Viewer`). So the prompt now reads "Install DHViewer" / "Open DHViewer".

**Deferred → partially done:** icons were OHIF defaults; `android-chrome-512x512.png` was fixed to the DHV mark 2026-06-17 (commit `1bd2c77e7`, see [[project_favicon_rebrand]]), but `android-chrome-36/48/72/96/144/192/256/384.png` (the other 8 sizes in `manifest.json`'s `icons` array) are still OHIF. `theme_color` still OHIF blue `#20a5d6` (DHS teal is `#36918d` if wanted later) — untouched by the favicon rebrand.

**Deploy & commit state (FINAL):** committed as `0b2f0c445` ("feat(branding): rename PWA manifest to DHViewer") on `dhs-main` and pushed to origin 2026-06-06. VM checkout `/srv/pacs/ohif-fork` discarded its scp'd copy (`git checkout`) and fast-forwarded (`git pull`) to `0b2f0c445` — clean tree, manifest = DHViewer. Running image is `pacs-ohif-dhs:v1` (built earlier from the scp'd file; content identical to the commit, so no rebuild was needed).

**Process notes for next time:** it was first deployed pre-commit by scp-ing just `manifest.json` to the VM then building there (the only way to deploy without committing — checkouts aren't synced). When committing from PowerShell, `git commit -m $msg` with a here-string mangles on embedded quotes; write the message to a file and use `git commit -F`. Beware `Out-File -Encoding utf8` (PS 5.1) adds a UTF-8 BOM to the commit subject — use `[System.IO.File]::WriteAllText` instead. See [[reference_commit_and_deploy_tutorial]] and [[feedback_build_deploy_ops]].

After deploy, the old "OHIF" prompt persists until the **service worker** updates ("Relaunch to update" / unregister SW) and Cloudflare cache is purged — same cache-bust gotcha as [[project_v11_palette_shipped]].
