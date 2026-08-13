---
name: dh-pacs-leg1-upload-compression
description: 2026-07-15 shipped — site-side JPEG-LS IngestTranscoding to cut site->central upload time (ADR-0017); diagnosis method + deferred Lever 2
metadata: 
  node_type: memory
  type: project
  originSessionId: f75c9e1a-865d-4bcf-a52c-95e0a770961e
---

**Leg-1 (site->central) upload compression — LIVE on SITE005 (Ibn Sina main) 2026-07-15. ADR-0017.**

Problem: after Phase 2 fixed central->viewer serving ([[dicom-compression-pipeline]], ADR-0016), the
site->central **upload** became the bottleneck — the portal (sole uploader, ADR-0001) pushed
**uncompressed** pixels via DIMSE C-STORE (`POST /modalities/Central/store`, `portal/server.js`).
Real study MIZANUR RAHMAN MD.: 1953 MB / 3009 inst / **71m47s = 0.44 MB/s**.

Fix: enable `IngestTranscoding` = `1.2.840.10008.1.2.4.80` on the **site Receiver** Orthanc, so studies
store compressed on arrival from the modality and the C-STORE transmits the compressed syntax (Central
accepts it; its own IngestTranscoding makes re-receipt idempotent). Same one-key move as central.
Applied on the box (`C:\DHPacs\Receiver\config\orthanc.json`, restart `DH-PACS-Receiver`) AND the repo
template (`orthanc/payload/config/orthanc.json.template`) so new sites inherit it.

Same-study A/B pilot (KeepSource transcode copy, fresh UIDs, timed push, then cleaned up on central):
**1953->567 MB (3.44x); upload 71m47s->29.5 min (2.4x); site transcode 55s (negligible).**

**Key diagnostic insight — the win is 2.4x not 3.44x** because a two-component model fits:
`time = N*(~0.245 s/instance C-STORE overhead) + bytes/(~0.55 MB/s)`. There is a ~12 min per-instance
overhead **floor** for 3009 instances that compression can't remove. (Caveat: 2 points fit a 2-param
model exactly — can't fully separate the floor from link variance.) **Lever 2 = concurrent C-STORE**
to attack that floor (~30 -> ~15 min?) is DEFERRED/unproven, its own pilot needed. Tailscale path was
ruled out as primary cause (it establishes DIRECT `182.48.64.198:41641`, not DERP-capped; site uplink
~3.5 Mbit/s is the real byte ceiling).

**Shipped in installer v1.3.0** (`dist\dh-pacs-workstation-setup-v1.3.0.exe`, 2026-07-15): the combined
installer packages `orthanc/payload/config/orthanc.json.template` (verified `dh-pacs-workstation.iss:60`)
and `install-receiver.ps1` renders it by plain text substitution, so **new-site installs get compression
automatically, zero config.** v1.2.0 and older do NOT (predate the change). Committed to `main`
(feat e57360e, docs 189047a, chore ddb4ae5 v1.3.0, docs 68b26f7 Al Amin verification, docs 5b45c92 report).

**PRODUCTION-VERIFIED 2026-07-15 (patient AL AMIN, SITE005):** first fresh study after go-live —
`ReceptionDate 11:47:53` (after key live ~11:40 UTC) — stored + uploaded as **442 MB JPEG-LS** (not ~1.4 GB).
Fix works end to end. **KEY: IngestTranscoding is ARRIVAL-GATED** — it only transcodes studies the Receiver
C-STOREs in from the modality *after* activation; already-stored studies stay uncompressed (a study pushed
later is NOT re-transcoded). So a valid before/after needs a study that *arrives* post-activation.
Al Amin still took 53 min (~0.14 MB/s) — that's the **site's variable uplink, not the codec**: three real
transfers spanned 0.14-0.45 MB/s and the site public IP changed (`182.48.64.198`->`115.127.153.122`) =
unstable/failover line. Path was DIRECT (not DERP) when checked from central (`tailscale ping` via
`:41641`). Expectation: **~25-30 min good window / ~50+ bad, always ~3x better than uncompressed**. Biggest
remaining lever is now stabilising the SITE UPLINK (non-software), not more compression. Unverified caveat:
central logged 2415 instances vs 2542 on site for this study (likely stable-study snapshot timing).

**Gotchas found this session:**
- SITE005/Ibn Sina main is a STANDARD Central-paired Receiver now, NOT the ADR-0011 standalone (that box
  was uninstalled). Live Orthanc = PID from NSSM svc `DH-PACS-Receiver`, config
  `C:\DHPacs\Receiver\config\orthanc.json` (SITE005_DHPACS, auth on, Central modality). Stale/stopped
  leftovers: svc `DH-PACS-Orthanc` (SANTEWS2 standalone) + `OrthancDICOM`. ADR-0011 marked superseded.
- Orthanc :8042 has RemoteAccessAllowed off -> remote calls 401 even with valid creds; must run REST on
  the box (localhost) or via the running instance.
- Central telemetry `app.studies.upload_ms` already records real upload time -> read before/after from DB
  on the next real ingest, no instrumentation. See [[central-vm-deploy]].
- Verify a transcoded study: `GET /instances/<id>/metadata/TransferSyntax` == `1.2.840.10008.1.2.4.80`.

Other live sites already deployed need the same box edit (template only covers new installs).
