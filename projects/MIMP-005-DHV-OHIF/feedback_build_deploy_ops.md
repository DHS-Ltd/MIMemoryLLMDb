---
name: feedback-build-deploy-ops
description: "Operational rules for Docker image builds and deploy on pacsvm — avoid duplicate builds, always reload nginx after ohif restart, verify static assets at /assets/ not /viewer/assets/, JS bundles are gzip-precompressed, /viewer is never Cloudflare-cached, PowerShell commit message quoting"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 07e89958-39fd-4cf6-ae6d-9536a93daa5f
---

Never trigger more than one `docker compose build ohif` at the same time on pacsvm.

**Why:** The VM has limited CPU. Two parallel webpack compilations saturate it completely — SSH times out, both builds stall, the VM becomes unresponsive. This happened on 2026-06-01 when two agent sessions each kicked off a build.

**How to apply:** Before starting a build, check there isn't one already running: `ps aux | grep buildx`. If there is, wait for it or kill it (`kill -9 <pid>`) before starting a new one. Never run build commands in parallel across sessions.

---

Always run `docker exec pacs-nginx nginx -s reload` after restarting the `ohif` container.

**Why:** The outer nginx proxy caches the container's IP at startup. When the `ohif` container is recreated, it gets a new Docker-assigned IP. Nginx still forwards to the old IP → 502 errors. A reload forces nginx to re-resolve `ohif` via Docker's internal DNS (127.0.0.11).

**How to apply:** Any time `docker compose up -d --no-deps ohif` is run, always follow with the nginx reload. Add it to the deploy sequence as a mandatory step.

---

Always use `--force-recreate` when bringing up the ohif container after a build.

**Why:** `docker compose up -d ohif` without `--force-recreate` will report "Container pacs-ohif Running" and do nothing if a container with that name already exists — even though a new image was just built. The old container keeps serving old code.

**How to apply:** Use `docker compose up -d --force-recreate ohif` as the standard restart command after every build.

---

The nginx config must serve `/viewer` and `/basic-test` with `Cache-Control: no-store`.

**Why:** After each rebuild, webpack produces new content-hashed bundle filenames. If the browser has `index.html` cached, it tries to load old bundle URLs → 404 → completely blank viewer. This happened in production on 2026-06-02. The fix (already applied to `deploy/config/nginx/nginx.conf`) is a `location ~ ^/(viewer|basic-test)$` block that strips `ETag`/`Last-Modified` and adds `no-store`.

**How to apply:** If nginx config is ever reset or replaced, re-apply this block. Without it, every ohif deploy will blank-screen users until they manually clear their browser cache.

---

When verifying a deploy with `curl` against `pacs.dhsolutions.com.bd`, static OHIF assets (favicons, icons, anything under `public/assets/`) live at **`/assets/<file>`, NOT `/viewer/assets/<file>`**.

**Why:** `window.PUBLIC_URL = '/'` in the built `index.html` — OHIF's own asset references are root-relative. `/viewer` in `deploy/config/nginx/nginx.conf` is an *exact-match* location (`^/(viewer|basic-test)$`) for the SPA entry point only; it does not act as a path prefix for assets. Curling `/viewer/assets/favicon.ico` hits the OHIF container's SPA fallback and silently returns `index.html` (200 OK, looks like success) instead of 404ing — easy to mistake for a real response. Separately, bare root `/favicon.ico` is special-cased in nginx (`location ~ ^/(favicon\.ico|robots\.txt|sitemap\.xml|og-image\.jpg)$`) to proxy to the **marketing website**, not the OHIF container at all.

**How to apply:** Verify static assets at `https://pacs.dhsolutions.com.bd/assets/<filename>`. Check `Content-Length`/`last-modified` against the known new file size/build time, not just HTTP 200 — an SPA fallback or wrong-route response can return 200 with the wrong content.

---

When verifying deployed JS content (per COMMIT_AND_DEPLOY.md §5.3), `grep` against the plain `.js` files in `/usr/share/nginx/html/` will silently find nothing even when the change shipped correctly.

**Why:** `.docker/compressDist.sh` (run during the image build) precompresses every bundle to `.js.gz` for nginx `gzip_static`, and **zeroes out the original `.js` file** as a placeholder. `grep 'my-new-string' *.js` returns nothing because the files are empty, not because the deploy failed — this is easy to mistake for a broken build.

**How to apply:** Verify with `zcat <file>.js.gz | grep '<string>'` inside the container, not `grep` on the bare `.js`. To find *which* chunk contains a given string (OHIF webpack splits extensions into many numbered chunk files, e.g. `5277.bundle.<hash>.js`), loop `zcat` + `grep -c` over `*.js.gz` and check for nonzero count. Once you have the chunk filename, you can also curl it directly through the CDN (`https://pacs.dhsolutions.com.bd/<chunk>.js`) with `Accept-Encoding: gzip` to confirm the edge is actually serving it, not just the origin container.

---

`/viewer` (and `/basic-test`) come back `cf-cache-status: DYNAMIC` on Cloudflare, confirmed by curl headers.

**Why:** the `no-store` nginx rule added for the 2026-06-02 blank-screen bug (see the `Cache-Control: no-store` entry above) also tells Cloudflare not to cache the route at the edge. In practice this means the Stage-5.2 "purge Cloudflare cache" step in COMMIT_AND_DEPLOY.md is usually **not needed** for ordinary `/viewer` deploys — only the Stage-5.1 browser/service-worker cache-bust matters now.

**How to apply:** After a deploy, `curl -sD- https://pacs.dhsolutions.com.bd/viewer` and check for `cf-cache-status: DYNAMIC` before assuming a Cloudflare purge is required. Only reach for the dashboard purge if that header instead shows `HIT`/`STALE`, or if a *different* route (one without the no-store rule) is involved.

---

`git commit -m $msg` from PowerShell fails with `error: pathspec '...' did not match any file(s)` (and no commit lands) when `$msg` contains literal double-quote characters in the body text, even inside a single-quoted here-string (`@'...'@`).

**Why:** PowerShell's argument-passing to native executables (git.exe) mishandles embedded `"` characters in a string variable, splitting the message into multiple args that git then misreads as pathspecs. The here-string itself parses fine in PowerShell — the breakage happens at the PowerShell-to-native-exe boundary.

**How to apply:** Avoid literal double quotes inside commit message bodies passed via `$msg`. Failure is clean (no partial commit, safe to just fix the message and retry) — confirm with `git status`/`git log` before re-attempting.
