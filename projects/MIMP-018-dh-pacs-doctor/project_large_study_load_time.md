---
name: project-large-study-load-time
description: "Diagnosis + phased plan to fix ~80-min load of large CT studies in the doctor viewer. Phase 1 (OHIF wadouri) FAILED & retired (broke MPR); Phase 2 (JPEG-LS ingest compression) SHIPPED to production 2026-07-14, pilot + real-ingest validation both passed."
metadata: 
  node_type: memory
  type: project
  originSessionId: ecc463f5-1862-4468-a1c5-1dbb82c5b2d1
---

Large CT/MRI studies (~1.5–2 GB) take **~80 minutes** to fully load in DHV (OHIF). Diagnosed 2026-07-13 with `/grill-with-docs` on test patient **DUD Miah** (link token `03ec938e-75f1-4862-8384-00a1822465d1`, study `1.2.392.200036.9116.2.6.1.3268.2056789032.1783830713.136570`).

**Root cause (measured):** 7 **uncompressed multi-frame** objects (~544 frames each, 512×512×16-bit, ~278 MB/object, ~1.9 GB total). Bottleneck is **Orthanc per-request overhead extracting single frames** from a huge multiframe: whole-object bulk serves at 10 MB/s but per-frame at 0.25 MB/s (40× gap, non-parallelizable). NOT the tunnel (cache-busted static hit origin at 11.4 MB/s) and NOT last-mile. OHIF loads frame-by-frame → hits the worst case ~3,800×. (Cloudflare edge cache also dead for frames — `cf-cache DYNAMIC`, ADR 0004 inert — secondary.) Desktop pre-fetch app idea was shelved (hides latency that has a cheaper origin fix; no offline requirement).

## Phase 1 — OHIF wadouri — FAILED & RETIRED (2026-07-13)
Flipped doctor viewer `imageRendering: 'wadors' → 'wadouri'` (whole-object retrieval). **Deployed and rolled back same day.** MPR rendered **blank** (`[object Object]` overlay) — Cornerstone3D volume loader chokes on whole-object data. MPR/reformats on plain CT are **routine primary-diagnostic tools** reachable on any study → no modality routing can protect them, so the planned two-data-source split was also holed. Even stack path was bad (black viewport until manual reload, ~9 min). **wadouri is dead for the doctor viewer; it stays on `wadors`/`wadors`.** Config is at `/srv/pacs/config/ohif/doctor-app-config.js`, mounted `:ro` into the **nginx** container (NOT the ohif `:rw`/gzip path — that's the patient viewer). Docs: `docs/Data_Reloading/OHIF_Whole_Instance_Retrieval_{Plan,BUILD}.md`.

## Phase 2 — JPEG-LS ingest compression — PRIMARY FIX, decisions LOCKED, not yet executed
The only lever that speeds delivery **without** changing the retrieval mode MPR depends on. Locked:
- **Lossless** (primary diagnostic reads; lossy = future, needs radiologist sign-off, irreversible).
- **Codec: JPEG-LS Lossless `1.2.840.10008.1.2.4.80`** — empirically best on real data: 3.61× (145 KB vs 524 KB/frame) AND fastest. JP2 worse+3× slower; JPEG-LL-SV1 2.89×; RLE unsupported. Orthanc image `orthancteam/orthanc` 1.12.11 can produce all three (probed via WADO-RS on-the-fly transcode).
- **Mechanism: Orthanc `IngestTranscoding` key** in `orthanc.json` (currently unset; `StorageCompression:false`). One key, transcode-once-at-ingest.
- **Scope: NEW studies only** — no backfill of existing uncompressed corpus this pass (managed doctor-side).
- **Retrieval stays `wadors`.** Fidelity guaranteed (lossless = bit-identical; HU/W-L/measure/MPR unaffected).
- **MANDATORY PILOT GATE before rollout:** unproven that stored-compressed serves *per-frame* fast (the 40× gap is per-request overhead; compression only fixes it if Orthanc uses the JPEG-LS offset table). Transcode ONE study (Orthanc `/studies/{id}/modify` Transcode+KeepSource, on the VM), measure per-frame speed + native-TS serve + MPR renders + fidelity, then delete the copy. If per-frame still slow → contingency = split multiframe into single-frame instances at ingest.

Runbook: `dh-pacs-doctor/docs/Data_Reloading/Phase2_Ingest_Compression_JPEGLS.md`. **ADR: central repo `docs/adr/0016-transcode-ingest-jpegls-lossless.md`** (written 2026-07-13).

## Shipped (2026-07-14)

Pilot passed all 6 gates (3.56× compression, 0.05–0.26 s/frame = 25–40× faster, MPR intact, no data-loss risk).
`IngestTranscoding` rolled out to production Orthanc config (both `/srv/pacs/config/orthanc/orthanc.json` on
the VM and the tracked copy at `deploy/config/orthanc/orthanc.json`). Validated a second time against the
first real unplanned ingest post-rollout (Mizanur Rahman, ~1.9 GB → 567 MB, confirmed JPEG-LS transfer syntax
on an actual instance header, 0.3–5% CPU / ~215 MB RAM through the ~80-min upload). Backfill of the existing
uncompressed corpus explicitly deferred (separate future initiative). Full report:
`docs/Data_Reloading/Phase2_JPEGLS_Compression_Implementation_Report.md`.

**Status 2026-07-14:** Phase 1 retired, Phase 2 live in production and doctor-verified. This unblocked
[[project-doctor-dh-viewer]]'s build-planning session (2026-07-15) — the two compound (the pre-fetch agent
downloads already-compressed studies). See [[project-git-remote-live]] for repo/deploy conventions.
