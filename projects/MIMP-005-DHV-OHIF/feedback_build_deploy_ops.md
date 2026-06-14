---
name: feedback-build-deploy-ops
description: "Operational rules for Docker image builds and deploy on pacsvm — avoid duplicate builds, always reload nginx after ohif restart"
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
