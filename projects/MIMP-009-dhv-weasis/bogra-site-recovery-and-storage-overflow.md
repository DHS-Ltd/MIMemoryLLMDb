---
name: bogra-site-recovery-and-storage-overflow
description: Ibn Sina Bogura (Site 008) Receiver outage — RESOLVED 2026-08-26, first-ever proper Site Registration issued, DicomAet DHVIEWER preserved, zero data loss, live-verified (22 series matched). Multi-drive overflow question deferred to a future session.
metadata:
  type: project
  originSessionId: 23052427-87f8-4f68-9fe2-05606ad2bc93
  modified: 2026-08-25T19:12:49.777Z
---

Part of the [[dh-pacs-standalone-site]] workstream. Site 008 (Ibn Sina Hospital, Bogura) stopped
receiving from its vendor modality after the user installed the DH-PACS-Portal/Receiver bundle over
an existing, undocumented, hand-built Orthanc setup. **RESOLVED 2026-08-26** — see
`01_Pacs_File/01_Pacs_File/docs/Ibn_Sina_System_Onboarding/` for the full operational record
(`README.md`, `SITE_FACTS.md`, and the dated recovery writeup); this memory keeps the investigative
narrative and the facts that aren't obvious from that folder alone.

**Root cause chain, confirmed by diagnostics, not guessed:**

- Bogura had a bespoke two-tier storage system predating this product: a Primary Orthanc
  (service `Orthanc`, AET `DHVIEWER`, port 8042/4242, storage `D:\DHViewer`) and an Archive
  Orthanc (service `OrthancArchive`, AET `DHVIEWER_ARC`, storage `E:\OrthancArchive\Storage`),
  tied together by a permanent Python watchdog (`OrthancMonitor`,
  `C:\OrthancMigration\monitor.py`) that migrates the oldest studies from D: to E: when D: free
  space drops below 50GB, deleting from primary only after verifying the archive received it.
  Full spec: `E:\Orthanc_Configuration\DHS_Orthanc_Storage_Documentation.md`. Never part of DH's
  product; nobody else at DH knew it existed.
- Installing the DH-PACS bundle stopped/disabled the old `Orthanc` service and installed a new
  `DH-PACS-Receiver` that took over ports 4242/8042. `OrthancMonitor` kept running, unaware its
  "Primary Orthanc" target on port 8042 was now a completely different instance — a live landmine
  that turned out to be provably harmless only because the archive tier was confirmed empty.
- Separately, someone had hand-patched the new Receiver's `DicomAet` to bare `DHPACS` — **wrong
  value**. The Siemens CT/MR consoles are factory-locked to call this box `DHVIEWER` (matching the
  old legacy Orthanc's AET exactly), not `DHPACS`. That was the actual proximate cause of the
  reception failure, confirmed only after the user corrected an earlier assumption mid-session.
  That live config was also a single flat `orthanc.json`, not DH's documented partitioned
  `10-/50-/90-` layout (ADR-0015) — proving this Receiver was never set up via the real installer.
- Bogura had **never gone through a real Site Registration** for the current product at all — no
  `.dhvlicense` existed anywhere on the box. `SITE008_DHPACS` in `credentials.txt` came from the
  standalone Receiver installer's `/AET=` bypass path, not a verified licence.

**Code contradiction found and documented (`orthanc/README.md`'s "Open, 2026-08-25" note):**
`install-orthanc-service.ps1` hard-rejects any AET that isn't `SITE<NNN>_(ORTHANC|DHPACS)`,
unconditionally — even via `/AET=`. `CONTEXT-MAP.md`'s brownfield description (inbound AET may
diverge from the allocated Site AET) was conceptually right but had zero implementation. The
resolution: install licensed normally (passes the installer's own validation and health check),
then one deliberate, durable manual edit of `50-site.json` afterward — durable because the
installer only generates that file once and preserves it on every future upgrade.

**Decision (2026-08-25, executed 2026-08-26):** retire the bespoke system entirely, adopt DH's
standard single bounded Working Cache (ADR-0014). The archive tier turned out to be empty
(confirmed by the user before any migration planning), so nothing was actually at stake there —
only `OrthancMonitor` (the dangerous automation) needed removing, plus a clean uninstall of the
legacy `Orthanc` service.

**Data preservation, two different mechanisms depending on where data lived — both worked, zero
loss:**
- Old Primary (`D:\DHViewer`, 9547 files / 15.36GB, Apr–Aug 2026): DH's installer template
  collapses `IndexDirectory` onto `StorageDirectory` by default, which would have produced a fresh
  empty index next to real files Orthanc doesn't know about (confirmed: `CountStudies: 0` right
  after a naive install). Fixed by a second deliberate post-install edit splitting
  `IndexDirectory` back to `C:\Orthanc` (the real pre-existing paired index) instead of leaving it
  collapsed onto `D:\DHViewer`. Immediately recovered 67 studies / 8998 instances.
- The 225 files the ad-hoc Receiver had already received during the broken window: exported via
  REST (`GET /instances` -> `GET /instances/{id}/file`) to local `.dcm` files **before** touching
  the service at all, then re-ingested via `POST /instances` once the real install was live and
  correctly configured. 194 new + 31 already-covered-by-Primary, 0 failures.

**Licensing:** first-ever real Site Licence issued for Bogura, `SITE008_DHPACS`, bound to Machine
Code `X6YH-SAYK-Y8K9-KJH7` (BIOS-anchored). **Perpetual by contract** — a genuine, deliberate
exception to the standard annual-term model, written up as **ADR-0021** (20-year expiry as the
practical "never" stand-in, since the licence schema has no unlimited-expiry concept at all —
`--expiry` is required and hard-validated `YYYY-MM-DD`). Do not treat this as a precedent for other
sites without the same explicit contractual basis.

**Live verification, not just arrival count:** a real test send from the Siemens console produced
+1 study / +669 instances, then opened in DH DICOM Viewer with **22 series matched** against what
the technologist confirmed was sent — the check that catches a silent C-GET gap (ADR-0019's
history), deliberately not skipped just because REST counts looked right.

**Explicitly deferred to a future session, tracked officially in
`docs/adr/0014-receiver-storage-is-a-bounded-working-cache.md`'s "Open, 2026-08-25" note:** how
the Receiver should behave when a site's primary volume fills before its retention need is met.
Needed across multiple sites, not just Bogura.

**Also explicitly deferred (per the user, 2026-08-26):** adding the MT Portal properly (Central
pairing) to this now-working standalone workstation, **without hampering the OEM modality
connection** — i.e. whatever that integration does must not touch `DicomAet: DHVIEWER` in
`50-site.json`. See [[site-onboarding-docs-pattern]] for where this and future sites' onboarding
records live.
