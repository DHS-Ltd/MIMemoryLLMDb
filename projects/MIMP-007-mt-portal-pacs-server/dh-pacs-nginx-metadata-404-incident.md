---
name: dh-pacs-nginx-metadata-404-incident
description: "2026-06-12 patient-viewer outage root cause — unpinned nginx auto-update broke WADO-RS /metadata, NOT Cloudflare"
metadata: 
  node_type: memory
  type: project
  originSessionId: e86d9753-1f91-4bd4-965e-beb951ad4678
---

On 2026-06-12 the central patient viewer (OHIF) showed blank for every Link.
Root cause was **not** Cloudflare or the patient's edge-cache rule (that rule was
inert — a `wildcard "/frames/"` with no `*` matches nothing; every request was
`cf-cache-status: DYNAMIC`). The real cause: the central `nginx` ran on the
floating tag `nginx:alpine`, and a restart silently pulled **nginx 1.29.8**,
whose `proxy_pass` with a URI part (`http://orthanc:8042/dicom-web/`) corrupted
WADO-RS `/metadata` requests — Orthanc returned 404 "inexistent Study" via nginx
but 200 direct. OHIF loads studies via that metadata, so all 17 studies failed.

Fix (committed on `feat/safety-mt-gated`): drop the URI part →
`proxy_pass http://orthanc:8042;` (forwards the raw request URI). Verified all
studies' metadata + frames 200 end-to-end through Cloudflare. Also pinned
nginx/orthanc/minio by digest in [[central-vm-deploy]] compose to stop silent
drift.

**Why:** the timing coincided with a Cloudflare cache edit, which made the
operator (rightly) suspect their change; the actual trigger was an image
auto-update with no code change on our side.

**How to apply:** if the viewer breaks again with no deploy on our part, FIRST
check for image drift (`docker inspect` running nginx/orthanc vs the pinned
digests) before suspecting Cloudflare. Isolate origin-vs-edge by curling
`localhost:80` (bypasses Cloudflare); compare against `localhost:8042` (direct
Orthanc). Pixels were never at risk — Orthanc native frame access kept working
throughout.
