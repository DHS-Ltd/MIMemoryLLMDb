---
name: dicom-compression-pipeline
description: No compression applied by this system; transfer syntax and size determined by the modality; transcoding caveat on C-STORE to Central
metadata: 
  node_type: memory
  type: project
  originSessionId: 44c25fb6-c031-450c-9d70-4893c680f0f4
---

No compression is applied anywhere in the DH PACS Workstation pipeline.

**Orthanc (Component A) storage:**
- `StorageCompression: false` — files stored on disk exactly as received
- `IngestTranscoding` is **commented out** in `orthanc.json` — no forced recompression on ingest
- Accepts all transfer syntaxes (`1.2.840.10008.1.*`) — whatever the modality sends is stored verbatim

**Portal (Component B) push to Central:**
- Push is `POST /modalities/Central/store` (`server.js:98`) — a plain C-STORE; no transcoding requested
- No pixel manipulation in portal code at any point

**Transcoding caveat — `TranscodeDicomProtocol: true` (`orthanc.json:899`):**
If Central's Orthanc only advertises uncompressed transfer syntaxes during SCP negotiation, local Orthanc will transcode before sending. Fallback syntax is `1.2.840.10008.1.2.1` (Little Endian Explicit, **uncompressed**) — this makes files *larger*, not smaller.

**Why a study may look small:**
Small file sizes are almost certainly because the imaging modality (CT/MRI/X-ray) itself sent already-compressed DICOM (e.g., JPEG 2000, JPEG-LS). The system stores and forwards without modification.

**How to verify:** `GET http://localhost:8042/instances/<id>/tags?simplify` → check `TransferSyntaxUID`. Anything other than `1.2.840.10008.1.2.1` or `1.2.840.10008.1.2` means the modality sent compressed data.

**Why:** Confirmed via code review 2026-06-14; user asked about unexpectedly small study sizes.
**How to apply:** If asked about compression, transcoding, or unexpectedly small/large DICOM sizes — the system does not compress; look at the modality's transfer syntax first.
