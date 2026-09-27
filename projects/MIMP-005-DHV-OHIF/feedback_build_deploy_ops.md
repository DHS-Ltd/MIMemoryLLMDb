---
name: feedback-build-deploy-ops
description: "Operational rules for Docker image builds and deploy on pacsvm — avoid duplicate builds, always reload nginx after ohif restart, verify static assets at /assets/ not /viewer/assets/, JS bundles are gzip-precompressed, /viewer is never Cloudflare-cached, PowerShell commit message quoting, SSH nested-quoting workaround (pipe local script via stdin), Playwright as chromium-cli substitute for local UI verification, build overwrites the v1 tag and destroys rollback, /brand/ is a live mount for ad-hoc static pages"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 07e89958-39fd-4cf6-ae6d-9536a93daa5f
  modified: 2026-08-20T13:26:32.598Z
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

---

Multi-line or loop-containing remote commands sent as `ssh pacsvm "..."` from PowerShell reliably break — nested quoting across PowerShell → ssh → bash → (sometimes) `docker exec ... sh -c '...'` collapses in confusing ways: `for`/`do` loops throw "syntax error near unexpected token", `$var:` inside a double-quoted PowerShell string gets misparsed as a PowerShell drive reference, and multi-line here-strings sent as a single ssh argument arrive corrupted (lines like a stray `dev` appearing mid-script).

**Why:** each layer (PowerShell, ssh argument parsing, remote bash, and optionally another `sh -c` inside `docker exec`) re-tokenizes quotes and `$` independently; there is no single escaping scheme that survives all of them for anything beyond a single simple command.

**How to apply:** for anything more than one plain command, write the script to a **local file** first, then pipe it over stdin: `Get-Content -Raw local_script.sh | ssh pacsvm "bash -s"`. Stdin content isn't re-parsed by any of the intermediate shells the way inline arguments are — this worked cleanly on the first try after three failed inline-quoting attempts (2026-08-20, Volume3DDH deploy verification). Keep loops, `$(...)`, and any `docker exec` nesting inside that script file, not in the PowerShell command string.

---

`chromium-cli` is not installed in this environment (Windows Server 2022 dev box). For local UI verification (per the `run` skill's browser-driven pattern), use Playwright directly instead: it's already a devDependency in `d:\ohif-fork\node_modules\playwright`, but the browser binaries are not pre-downloaded — run `npx playwright install chromium` first (~150MB, one-time, cached at `%LOCALAPPDATA%\ms-playwright`). Write a one-off Node script (not a project file — put it in the repo root or scratchpad and delete after) using `chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })` to get software-rendered WebGL2 (real, not headless-stubbed — confirmed `EXT_color_buffer_float` support, sufficient for Cornerstone3D volume rendering to actually produce correct pixels, not just a non-crashing black canvas).

**Why:** confirms the fix works, not just that nothing threw — a blank/black 3D pane after a layout-switch click can mean either "still rendering," "broken," or "degenerate source data" (e.g. this repo's `PID_SR` test study has 27 series but only 1 instance each — a synthetic multi-modality fixture, not real volumetric data; MPR/3D reformats of it are meaningless). Test against a real multi-slice series (e.g. `NEW_PATIENT_ID` / "CT NECK SOFT TISSUE W/ CONTR", 295 instances) before concluding a 3D feature is broken.

**How to apply:** target toolbar buttons via `[data-cy="<ButtonId>"]` (OHIF's `ToolButton.tsx` sets `data-cy={id}` — far more reliable than text matching, which fails silently when buttons render icon-only). Use `force: true` on clicks to bypass the investigational-use banner and onboarding-tour overlays. Give volume construction + first-frame ray-cast real time (10-20s) before screenshotting on a large CT series — screenshots themselves may need `{ timeout: 60000 }` since the render can peg the main thread past Playwright's default 30s screenshot timeout.

---

`docker compose build ohif` **destroys your rollback**: it writes to the same
`pacs-ohif-dhs:v1` tag that compose references, and buildkit prunes the previous
image. Tag the *outgoing* image before building, not after.

**Why:** COMMIT_AND_DEPLOY.md §4.5 says to tag a release version *after*
verifying, but by then the image you'd want to roll back to no longer exists —
only its unpacked layers, still held by the running container. Confirmed
2026-08-26: after building the float-texture fix, `docker tag <old-id>` failed
with "No such image", leaving only `pacs-ohif-dhs:v1.1` (3 months stale) or a
10-15 min rebuild as recovery options.

**How to apply:** before `docker compose build ohif`, run
`docker tag pacs-ohif-dhs:v1 pacs-ohif-dhs:v<N>-prev`. After verifying the new
build, tag it with its real version (`docker tag pacs-ohif-dhs:v1
pacs-ohif-dhs:v2`) so a future rebuild of the `v1` tag cannot orphan it either.
Also pre-flight a new image before recreating the live container: run it on a
spare loopback port (`docker run -d -p 127.0.0.1:8099:80 pacs-ohif-dhs:v1`),
check `/` returns 200 and every JS bundle referenced by `index.html` resolves,
then remove it.

---

To publish an ad-hoc static page on `pacs.dhsolutions.com.bd` with **no nginx
edit, no compose edit and no restart**, drop the file into
`/srv/pacs/config/nginx/assets/` on the VM. It is a live directory bind-mount
(`assets:/usr/share/nginx/html/brand:ro`) already served by
`location /brand/`, so `https://pacs.dhsolutions.com.bd/brand/<file>.html` works
the moment the file lands.

**Why:** the obvious route — a new `location =` block plus a single-file mount,
mirroring how `/open` and `/demo` are wired — needs a config change *and*
`--force-recreate` (a reload won't pick up a new bind mount), and nginx's
catch-all `location / { proxy_pass http://ohif:80/; }` silently returns the OHIF
SPA with **200 OK** for any unmatched path, so a missing route looks like a
successful deploy. Used 2026-08-26 to host the WebGL probe for external testers,
which also matters for trust: patients will open a link on their own PACS domain,
not a claude.ai or github.io one.

**How to apply:** verify with `curl -s http://localhost/brand/<file> | head -c 60`
and confirm the *content*, never just the status code. Files authored for the
Claude Artifact publisher need `<!doctype html>`, `<meta charset>`,
`<meta name="viewport">` and a CSS reset added by hand — the publisher injects
those, nginx does not, and without the viewport tag a phone renders the page at
980px zoomed out. Delete the file when done; nothing else needs undoing.

