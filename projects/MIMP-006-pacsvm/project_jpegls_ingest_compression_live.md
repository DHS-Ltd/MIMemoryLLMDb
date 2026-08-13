---
name: project-jpegls-ingest-compression-live
description: Phase 2 JPEG-LS lossless ingest compression is LIVE on prod (2026-07-14) — fixes the 80-minute large-CT load bottleneck without touching MPR
metadata: 
  node_type: memory
  type: project
  originSessionId: a1db7fa3-e180-4c59-9cfe-e8bed2a2f698
---

**LIVE on prod 2026-07-14.** Orthanc `IngestTranscoding` set to JPEG-LS Lossless
(`1.2.840.10008.1.2.4.80`) — every newly-ingested instance is transcoded once at receive time and stored
+ served compressed. Viewer stays on `wadors`/`wadors` (unchanged) — this is what makes it safe: it never
touches the retrieval mode Cornerstone3D's MPR/volume loader depends on.

**Why:** Large CT studies (~1.9 GB, ~3,800 frames) took ~80 min to load in DHV. Root cause (diagnosed
2026-07-13): not bandwidth — Orthanc's per-request overhead extracting single frames from *uncompressed*
multi-frame objects (0.25 MB/s per-frame vs 10 MB/s bulk, a 40× gap). An earlier fix attempt
(`wadouri` whole-object retrieval) was deployed and rolled back same-day because it broke MPR entirely
(blank viewport) — MPR is a routine primary-diagnostic tool reachable on any study, no way to route around
it. Compression was chosen because encapsulated transfer syntaxes carry a per-frame Basic Offset Table,
giving Orthanc O(1) frame access — attacks the real bottleneck without changing retrieval mode.

**Full docs:** `docs/Phase2_Ingest_Compression_JPEGLS.md` (runbook + pilot/rollout results),
[[decision_jpegls_ingest_transcoding]] (ADR 0016).

**Validated twice before/during rollout (2026-07-14):**
1. **Pilot** (isolated copy of an existing study via Orthanc `/modify` + `KeepSource:true`, original
   never touched): 3.56× smaller, per-frame speed 0.05–0.26s (was ~2s, confirmed over the *public*
   HTTPS path matching the original baseline methodology, not localhost — tunnel latency matters), MPR
   confirmed clean in DHV.
2. **First real ingest post-rollout** (Mizanur Rahman, Ibn Sina Hospital, ~1.9GB, 3,009
   instances/18 series): stored at 567MB (~3.35×), transfer syntax confirmed genuinely `.80` on an
   instance header (not just reported), CPU sampled every 2min across the full ~80min upload stayed at
   0.3–5%, memory settled ~215MB. No ingest slowdown.

**Key operational fact confirmed via Orthanc's official FAQ before flipping the switch:** if a specific
instance fails to transcode, Orthanc stores it in its *original* transfer syntax rather than
rejecting/dropping the C-STORE — so this change has no data-loss failure mode, worst case is "stays
uncompressed like today" per-instance.

**Scope is new studies only** — `IngestTranscoding` never touches already-stored instances. Backfilling
the existing uncompressed corpus was explicitly re-confirmed as deferred (2026-07-14, reopened and
re-closed same session) — it's a much bigger blast-radius bulk rewrite of live patient data, needs its
own resumable-job design, and old studies are rarely re-read. Treat as a fully separate future initiative
if raised again, not a quick add-on to this one.

**Config lives in two places kept in sync:** `/srv/pacs/config/orthanc/orthanc.json` on the VM and
`deploy/config/orthanc/orthanc.json` in this repo (`dh-pacs-central`).
