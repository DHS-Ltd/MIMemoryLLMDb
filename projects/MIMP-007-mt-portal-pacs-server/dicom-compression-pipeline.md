---
name: dicom-compression-pipeline
description: JPEG-LS lossless IngestTranscoding now applied at BOTH central (ADR-0016) and site (ADR-0017); how to verify transfer syntax
metadata: 
  node_type: memory
  type: project
  originSessionId: f75c9e1a-865d-4bcf-a52c-95e0a770961e
---

**SUPERSEDED 2026-07-15 — the system now DOES apply compression.** The prior version of this note
("no compression applied anywhere") was true only until Phase 2. As of 2026-07-15, **JPEG-LS lossless**
(`1.2.840.10008.1.2.4.80`) is transcoded at **ingest** in two places via Orthanc's `IngestTranscoding`
key (transcodes each instance once on receipt, stores + serves it compressed; lossless, MPR/HU-safe;
failed transcode falls back to storing the original TS — no data loss):

- **Central** (`dh-pacs-central`, ADR-0016, live 2026-07-14) — fixed the ~80 min doctor-side viewer load;
  a 1.9 GB CT abdomen stores as ~560 MB. See [[dh-pacs-leg1-upload-compression]].
- **Site Receiver** (this repo, ADR-0017, live on SITE005 2026-07-15) — `IngestTranscoding` in
  `orthanc/payload/config/orthanc.json.template` and on the box at
  `C:\DHPacs\Receiver\config\orthanc.json`. Shrinks the site->central **upload** ~3.4x
  (2.4x faster wall-clock after per-instance C-STORE overhead). See [[dh-pacs-leg1-upload-compression]].

`StorageCompression` is still `false` (that's zlib-at-rest, unrelated). New arrivals only —
`IngestTranscoding` never rewrites already-stored studies.

**How to verify a study's actual codec:** `GET http://localhost:8042/instances/<id>/metadata/TransferSyntax`
(or `/tags?simplify` -> `TransferSyntaxUID`). `1.2.840.10008.1.2.4.80` = JPEG-LS (transcoded by us);
`1.2.840.10008.1.2.1` = uncompressed (a pre-change study, or a site without IngestTranscoding yet).

**How to apply:** If asked about compression/transcoding/study sizes, the answer is now "yes, JPEG-LS
lossless at ingest on both legs" — not the old "we don't compress." Check the transfer syntax to tell a
transcoded study from a pre-change one.
