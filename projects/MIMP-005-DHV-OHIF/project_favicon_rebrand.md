---
name: favicon-rebrand
description: "Favicon/icon rebrand from OHIF to DHV mark: SVG tag was already wired, raster fallbacks partially fixed and deployed (1bd2c77e7); ~28 icon slots still pending"
metadata: 
  node_type: memory
  type: project
  originSessionId: 22938c09-eca1-4dc3-bfc4-816acc7b5298
---

The SVG favicon (`<link rel="icon" type="image/svg+xml">` in `platform/app/public/html-templates/index.html`) was already DHS-branded from earlier work (`48f99e181`, `fee52dd79`). What was missing: all the **raster fallbacks** — `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon-*` (11 sizes + 2 duplicates), `android-chrome-*` (9 sizes, used by `manifest.json` for the PWA install icon — see [[pwa-manifest-dhviewer]]), `mstile-*` (4 sizes), `coast-228x228.png`, `yandex-browser-50x50.png` — were still the original OHIF dot-grid logo. Browsers/OSes that can't use the SVG tag (older Safari, Apple touch icons, Android home-screen install, Windows tiles) were still showing OHIF branding even after the SVG fix.

**The brand mark is called "DHV"** — a navy rounded-square tile (matches the existing `dhs-favicon.svg` gradient tile) with a stylized "D" (containing a small signal/wave glyph) + "HV" in teal, i.e. a DHV monogram. Ties into the "DHViewer" PWA name from [[pwa-manifest-dhviewer]].

**Shipped 2026-06-17, commit `1bd2c77e7`** ("feat(branding): replace favicon/touch-icon fallbacks with DHV mark") — only 4 of the ~32 raster files: `favicon.ico` (now 6 embedded resolutions: 16/32/48/64/128/256, richer than OHIF's original 2), `favicon-16x16.png`, `favicon-32x32.png`, `android-chrome-512x512.png`. Pushed to `origin/dhs-main`, deployed to the VM (`pacs-ohif-dhs:v1` rebuilt, `pacs-ohif` force-recreated, front nginx reloaded), and verified live via `curl` against `https://pacs.dhsolutions.com.bd/assets/favicon.ico` — `Content-Length` and `last-modified` matched the new build exactly, confirming origin (not just local) is serving the new mark.

**Source convention followed:** raw art copy lives in `platform/app/assets/`, an identical copy is served from `platform/app/public/assets/` — same pattern as the existing `dhs-favicon.svg`/`dhs-logo.svg`.

**Design decisions locked in for the rest of the set** (resolved via grill-with-docs interview before generating):
- Render the SVG's own built-in rounded-square gradient tile as-is for every square icon size — no extra padding/safe-zone inset.
- `mstile-70x70.png`/`150x150.png`/`310x310.png` should be fixed to match their filenames exactly (the OHIF originals were oversized: 128/270/558px respectively — an old @2x export quirk, not intentional).
- `mstile-310x150.png` (wide tile): DHV mark centered, white letterbox margins (matches `browserconfig.xml` `TileColor=#fff`, no config change needed).
- **Explicitly out of scope, left as OHIF-branded:** `firefox_app_60/128/512.png` (dead — referenced only by `manifest.webapp`, which itself isn't linked from `index.html` or anywhere else — vestigial Firefox OS marketplace manifest), and the 13 `apple-touch-startup-image-*.png` legacy iOS splash screens (low-visibility, full splash compositions not just icon-on-canvas, deferred as a separate follow-up if ever needed).

**Still pending:** ~28 files — the rest of `apple-touch-icon-*`, `android-chrome-36/48/72/96/144/192/256/384`, `mstile-70/144/150/310x310`, `mstile-310x150` (wide), `coast-228x228.png`, `yandex-browser-50x50.png`. User generates these manually (no image-conversion tooling like ImageMagick/sharp is installed in this repo or on the VM) from the 512px DHV master, then they get committed/deployed the same way as this batch.

See [[reference_commit_and_deploy_tutorial]] for the deploy sequence used (all steps followed cleanly: PowerShell commit due to husky/node-on-PATH issue, push, SSH `pacsvm`, `docker compose build ohif`, `--force-recreate` up, nginx reload, curl verification). See [[feedback_build_deploy_ops]] for the asset-path gotcha hit during verification.
