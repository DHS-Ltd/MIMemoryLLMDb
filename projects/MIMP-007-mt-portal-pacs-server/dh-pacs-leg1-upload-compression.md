---
name: dh-pacs-leg1-upload-compression
description: 2026-07-15 shipped — site-side JPEG-LS IngestTranscoding to cut site->central upload time (ADR-0017); diagnosis method + deferred Lever 2; 2026-08-23 confirmed the fleet-retrofit gap is real, fixed SITE013 (earlier mislabeled "SITE03" in this file) and separately fixed the real SITE03 (fix applied, verification pending next study)
metadata: 
  node_type: memory
  type: project
  originSessionId: f75c9e1a-865d-4bcf-a52c-95e0a770961e
  modified: 2026-08-30T13:09:41.070Z
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

**2026-08-23 — confirmed on SITE013, retrofitted.** (Corrected 2026-08-23: this whole entry was
originally mislabeled "SITE03" — it is actually **SITE013**. See the separate, distinct SITE03 entry
below for the real SITE03, checked later the same day.) An MT complaint ("uploads take forever," e.g.
patient Mousumi 921 MB / 91 min = 0.169 MB/s — worse than even SITE005's bad-uplink case) traced to
SITE013 (install dir `C:\DHPacs\Receiver` same as SITE005) never having gotten the ADR-0017 retrofit —
it predates 2026-07-15 and, unlike SITE005, nobody had patched it by hand. Portal's independent
progress-bar/non-blocking-tray fix ([[dh-pacs-mt-push-architecture]]) *was* present (built 2026-07-11)
— the two fixes ship independently, so a site can have one without the other. Confirms the "other live
sites need the same box edit" gap flagged above is not hypothetical — **treat every site older than
2026-07-15 as suspect until checked.**

Fixed on SITE013 live: same one-key edit + `Restart-Service DH-PACS-Receiver`, verified via
`GET /studies/{id}/instances` -> first instance's `/metadata/TransferSyntax` == `1.2.840.10008.1.2.4.80`.
Readiness checklist used before trusting a fresh test upload: services running + 4242/8042 listening,
config key present, **C-ECHO to Central over the local REST API** (catches leg-1 transport being down,
separate from the compression question), `LINK_MODE` in `portal/.env` (mt_gated here — MT must claim
before push fires), disk headroom. A same-study-in-place retrofit (Orthanc `/studies/{id}/modify` with
`Keep: [StudyInstanceUID, SeriesInstanceUID, SOPInstanceUID], KeepSource:false, Force:true`) was drafted
as an option for an already-landed-but-unclaimed study (patient Khadiza) to avoid losing that specific
upload to the old slow path, but the operator chose to wait for a genuinely fresh study instead — the
in-place approach is untested, not yet run.

**2026-08-23 (separate session) — SITE03 (the real one: CMCH, AET `SITE03_ORTHANC`, the fleet's
first-ever live site, onboarded 2026-06-06) also found missing the fix and retrofitted.** Reported as
"one site uploading very slowly." Diagnostic showed `orthanc.json` untouched since 7/9/2026 — predates
ADR-0017 entirely, no `.bak` file, i.e. never previously patched (unlike SITE013, which had at least
been looked at). Install dir here is `C:\DHPacs\Orthanc` (the installer default) and the service is
named `DH-PACS-Orthanc`, **not** `DH-PACS-Receiver` — another confirmation that install layout varies
per site and must be discovered, never assumed from a prior site's session. Applied the standard fix
(backup, add `IngestTranscoding` = `1.2.840.10008.1.2.4.80`, `Restart-Service DH-PACS-Orthanc`); config
survived the restart; C-ECHO to Central OK; `LINK_MODE=mt_gated`; disk headroom fine (~24 GB free).
**Not yet validated end-to-end** — no fresh study has landed since the restart yet, so the transfer
syntax / timing verification (runbook §4-5) is still pending as of this writing. Operator will return
once the next study arrives at this site.

**2026-08-30 — SITE016 (Baroicha Diagnostic Center Ltd) born compliant, no retrofit needed.**
Onboarded 2026-08-30, built from the v1.3.0+ installer, so `IngestTranscoding` was present from first
arrival — confirmed via RDP + PowerShell against the live box's `orthanc.json`. Checked because the
user suspected a compression regression (0.2 MB/s throughput on a 7.4 MB DX upload "feels slow/big"),
surfaced while testing an unrelated OHIF mobile-display fix. **Verdict: not a bug.** Confirmed at
Central the stored instance's `TransferSyntaxUID` is `1.2.840.10008.1.2.4.80` (JPEG-LS Lossless); 7.4 MB
stored vs. ~12 MB raw pixel data (computed from Rows×Columns×BitsAllocated) is a genuine ~1.6x
compression — just far short of CT's ~3.4x, because DX/X-ray images compress worse under lossless
JPEG-LS than CT due to detector noise (ADR-0017 only ever measured CT). The 0.2 MB/s throughput matches
the already-documented uplink-bound range (0.14–0.45 MB/s, see AL AMIN above) — it's this site's
hospital internet, not a codec problem. **Calibration note for future throughput complaints on DX/X-ray
studies specifically: don't expect CT-level compression ratios or absolute throughput.** See
[[dh-pacs-duplicate-link-display-bug]] for the actual bug found in the same session (unrelated —
duplicate study cards, not a compression issue).
