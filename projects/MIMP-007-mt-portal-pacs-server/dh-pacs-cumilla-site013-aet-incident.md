---
name: dh-pacs-cumilla-site013-aet-incident
description: "Cumilla SITE013 box had wrong AET baked in since onboarding, causing 3.5 months of study misattribution to SITE03; fixed 2026-09-21; unexplained transfer-failure issue still open"
metadata: 
  node_type: memory
  type: project
  originSessionId: fc358649-00a4-4b3c-8a4f-a82e7153206a
  modified: 2026-09-21T11:03:02.925Z
---

Cumilla Medical College has two separate physical boxes, both easily confused because one's software has misreported its identity since setup:

- **Real SITE03** (legacy, AET `SITE03_ORTHANC`): install dir `C:\DHPacs\Orthanc`, services `DH-PACS-Orthanc` + `DH-PACS-Portal`. Working correctly.
- **Real SITE013** (AET should be `SITE013_DHPACS`, hospital_name in Central is "CT Comilla medical college Hospital" — likely a distinct client, not literally the same hospital as SITE03): install dir `C:\DHPacs\Receiver`, services `DH-PACS-Receiver` + `DH-PACS-Portal`, hostname `DESKTOP-HIS4A3T`.

**Root cause found 2026-09-21:** SITE013's box had `DicomAet` (orthanc.json) and `SITE_AET` (Portal .env) set to `SITE03_ORTHANC` since the box's `orthanc.json` was created on 2026-06-06 — a copy-paste error at initial onboarding, never corrected. Central's `autolink.lua` (on pacs-central, fires for every incoming study regardless of link_mode) derives `siteId` purely from the incoming DICOM association's `RemoteAET`, then `POST /studies/received` (`legacy.js`) looks up `app.sites WHERE aet = $1` — so every study SITE013 ever pushed landed under SITE03's site record (`app.sites` id 4) instead of its own (id 15). Confirmed via DB query: id 15 had **zero studies ever**, spanning the site's full operational life through the day before the fix.

**Fix applied 2026-09-21:** corrected `DicomAet`/`Name` in `C:\DHPacs\Receiver\config\orthanc.json` and `SITE_AET` in `C:\DHPacs\Portal\.env` on `DESKTOP-HIS4A3T` to `SITE013_DHPACS`; restarted `DH-PACS-Receiver` + `DH-PACS-Portal`; verified via C-ECHO to Central. No Central-side change was needed (Central accepts C-STORE from any AET; the `SITE013_DHPACS` site row already existed, PATCH `/api/admin/sites/:id` doesn't even allow editing `aet` after creation).

**Decision:** the ~62 historical studies merged into SITE03's record are NOT being retroactively reassigned — user chose fix-forward-only, since mt_gated already has a human MT verify patient identity at claim time regardless of which site bucket a study landed in, making the retroactive-forensics effort (would need Central Orthanc's own RemoteIP-level logs, log level here is warnings-only so mostly unavailable) not worth it.

**Still unresolved:** this box's real C-STORE transfers to Central reliably die after ~1-3 minutes with "Error in the network protocol" (Orthanc job state -> Failure), even though: C-ECHO succeeds instantly, `Test-Connection` to Central shows zero packet loss over 60 pings (~78ms avg via Singapore DERP relay — same relay + similar latency as the healthy SITE03 box, so relay type alone doesn't explain the gap), NIC negotiates normal 100Mbps, and a raw non-Tailscale download from Cloudflare's CDN sustains 1.51 MB/s for 16s with no drop-off. None of these synthetic tests reproduce the DICOM-specific failure. The original symptom (patient Saleha, 490MB study) took 88 minutes before erroring out. This same box scored 2.48 MB/s successfully on 2026-08-23 right after the [[dh-pacs-leg1-upload-compression]] JPEG-LS retrofit, so the network path *can* sustain a real transfer under some conditions — something has degraded since then. Next step (per user, in progress): re-test with a real newly-scanned patient and time it.

**Why this matters going forward:** self-reported AET/hostname is NOT reliable for identifying which physical box is which at this site — this exact SITE03/SITE013 conflation already bit two earlier sessions (the [[dh-pacs-leg1-upload-compression]] Aug-23 retrofit, and the Sept-2 Portal queue-ordering fix in `docs/PORTAL_COPY_LINK_FLEET_ROLLOUT_RUNBOOK.md`, both partly mislabeled). Use install-directory + service-name signature instead: `C:\DHPacs\Orthanc` + `DH-PACS-Orthanc` = SITE03; `C:\DHPacs\Receiver` + `DH-PACS-Receiver` = SITE013 (hostname `DESKTOP-HIS4A3T`).

**How to apply:** before doing ANY work at Cumilla, verify which physical box you're on via hostname/install-dir, not via what Orthanc Explorer or the AET field says. When investigating other sites' AET/attribution correctness, check `app.sites.aet` (Central, immutable after creation) against the box's own `orthanc.json` `DicomAet` directly — don't trust either one's self-report alone.
