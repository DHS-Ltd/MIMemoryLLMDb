---
name: decision-jpegls-ingest-transcoding
description: ADR 0016 — why JPEG-LS lossless IngestTranscoding was chosen over wadouri retrieval or lossy compression to fix slow large-CT loads
metadata: 
  node_type: memory
  type: project
  originSessionId: a1db7fa3-e180-4c59-9cfe-e8bed2a2f698
---

**Decision (2026-07-13, live 2026-07-14):** Orthanc `IngestTranscoding` → JPEG-LS Lossless
(`1.2.840.10008.1.2.4.80`), new studies only, viewer retrieval mode (`wadors`) unchanged.
See [[project_jpegls_ingest_compression_live]] for full rollout status and validation numbers.

**Why this over the alternatives:**
- **vs `wadouri` whole-object retrieval (Phase 1, tried first):** rejected — broke Cornerstone3D's MPR
  volume loader (blank viewport), and MPR is reachable from any study's toolbar with no modality-based
  routing to protect it. Rolled back same day it shipped.
- **vs lossy/visually-lossless compression:** rejected for now — doctors make primary diagnoses off
  these images; lossy needs radiologist sign-off and is irreversible. Much bigger size win (~8–15× vs
  ~3.6×) kept on the table as a separate future decision if ever revisited.
- **vs JPEG 2000 / JPEG-Lossless-SV1 / RLE:** JPEG-LS won empirically on real prod CT data — best ratio
  (3.61×) *and* fastest transcode; JPEG 2000 was worse ratio and 3× slower; RLE unsupported by the
  Orthanc image in use.
- **vs backfilling the existing corpus:** deferred, explicitly, twice (2026-07-13 design session and
  2026-07-14 rollout session) — bulk-rewriting live patient pixel data is a much bigger blast radius than
  "new studies only," needs its own resumable-job design, and old studies are rarely re-read.

**How to apply:** If asked to speed up viewer loads again in the future, don't re-suggest `wadouri` —
it's a closed door (breaks MPR, no workaround found). If asked about compressing old studies, don't treat
it as a quick follow-on to this change — it's scoped out as its own project.
