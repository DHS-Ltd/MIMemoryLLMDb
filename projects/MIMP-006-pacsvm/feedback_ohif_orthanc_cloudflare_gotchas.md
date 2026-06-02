---
name: nginx-proxy-and-deployment-gotchas
description: Non-obvious nginx proxy, OHIF, Orthanc, and Cloudflare traps — white pages, caching, bind-mount, and prefix-stripping bugs
metadata:
  type: feedback
  originSessionId: 38502d20-51e4-4b9e-bfa6-2d199b456c1f
---
When deploying OHIF v3 (image `ohif/app:latest`) behind nginx + Cloudflare Tunnel with Orthanc as the DICOMweb backend, the following five issues cost hours of debugging on 2026-05-10/11. Check them first when image rendering or config changes don't behave.

**Why:** Empirically discovered while debugging "Loading Imaging Study…" → blank viewport blocker on `pacs.dhsolutions.com.bd`. Each was non-obvious from logs.

**How to apply:** When touching OHIF / Orthanc / nginx config, or when a config change doesn't appear to take effect, run through this checklist before deeper debugging.

1. **OHIF `app-config.js` REQUIRES `extensions: []` and `modes: []`** as iterable arrays, even if empty. Missing them throws `TypeError: appConfig.extensions is not iterable` at appInit and the viewer stalls at "Loading Imaging Study…". This OHIF build does not default them.

2. **OHIF `requestTransferSyntaxUID` should be `''` (empty), not a specific UID like `'1.2.840.10008.1.2.1'`.** Setting it forces Orthanc to transcode every frame; if the source DICOM uses a compressed syntax Orthanc's transcoder cannot handle, frames return 400 and the viewer hangs silently.

3. **Set `omitQuotationForMultipartRequest: false` for Orthanc.** Orthanc's DICOMweb plugin requires quoted multipart Accept headers. The `true` value is for static-WADO/S3-style servers and causes Orthanc to return 406.

4. **Cloudflare CDN caches static JS for 4 hours by default** (`cache-control: max-age=14400`) — edit-then-reload won't surface changes for ANY browser, including Incognito, until cache expires. Dashboard "Purge Everything" is unreliable across PoPs. Fix: create a Cache Rule (Caching → Cache Rules → Create rule) with `Bypass cache` for the file's URL path. Verify with `cf-cache-status: DYNAMIC`.

5. **Docker single-file bind mounts can serve stale content after `sed -i` or editor save.** Bind mounts target the file's inode at container start; tools like `sed -i` rename a temp file over the path, breaking the mount. `docker compose restart` may not always re-bind — `docker compose stop && rm -f && up -d` (full recreate) is reliable. `tee file > /dev/null <<'EOF'` preserves the inode (uses O_TRUNC) and is safer for in-place edits.

**Bonus rule of thumb:** When the served file (`curl http://localhost/<file>`) differs from the on-disk file (`cat /path/file`), suspect a bind mount inode mismatch. When the served file from origin (`curl http://localhost/...`) differs from CDN (`curl https://...`), suspect CDN caching.

---

6. **nginx `proxy_pass` with a variable does NOT strip the `location` prefix — you must add a `rewrite` rule explicitly.**

   When `proxy_pass` uses a literal upstream (e.g. `proxy_pass http://admin-ui/;`), nginx strips the matching location prefix automatically (`/admin/foo` → `/foo`). But when the upstream contains a variable (e.g. `set $u admin-ui; proxy_pass http://$u/;`), nginx skips this stripping and forwards the full original URI unchanged.

   **Symptom (2026-05-26):** Admin panel at `/admin/` showed a white blank page. The HTML shell loaded (344 bytes, correct) but the JS bundle request to `/admin/assets/index-CZQ0sSQ0.js` also returned 344 bytes of HTML (`Content-Type: text/html`). Diagnosed by: `docker exec pacs-nginx curl http://admin-ui/assets/index-CZQ0sSQ0.js` returned 279 KB of JS correctly — proving admin-ui was fine. nginx was forwarding `/admin/assets/foo.js` to admin-ui as `/admin/assets/foo.js`, which doesn't exist there, so `try_files` fell back to `index.html`. AuthGate could not redirect to `/admin/login` because React never booted.

   **Fix:** Add an explicit rewrite before `proxy_pass`:
   ```nginx
   location /admin/ {
       resolver 127.0.0.11 valid=10s ipv6=off;
       set $admin_ui admin-ui;
       rewrite ^/admin/(.*)$ /$1 break;   # strip /admin/ prefix manually
       proxy_pass http://$admin_ui;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
   }
   ```

   **Why:** Using a variable in `proxy_pass` is necessary so nginx re-resolves the upstream IP on each request via Docker DNS (127.0.0.11), avoiding 502s after a container rebuild changes the container's IP. The rewrite is the correct way to combine dynamic resolution with prefix stripping.
   **How to apply:** Any time `proxy_pass` uses a `set $var` pattern AND the location has a prefix that should be stripped, always add a `rewrite ^/prefix/(.*)$ /$1 break;` line above `proxy_pass`.
