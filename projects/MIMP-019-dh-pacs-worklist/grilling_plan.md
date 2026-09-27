---
name: grilling-plan
description: "State of the DH worklist work: as of 2026-09-13 night, the console DOES request the SPS (probe 01 was an artifact), arc's zero-item sequences are the leading suspect and are now fixed by populating procedure codes, attribute coercion is closed in both directions, and the console reboot is the decisive test."
metadata:
  node_type: memory
  type: project
  originSessionId: 2d9a2089-479a-4d45-9f2e-b70a70dd279b
  modified: 2026-09-13T13:56:02.301Z
---

**Current working document: `docs/demobuilder/ARC_WORKLIST_CUTOVER_RUNBOOK.md`**, section
*"What the console faces at the next contact"* — carries a **revision notice** added 2026-09-13
evening. Evidence:
`docs/demobuilder/probes/2026-09-13-04-console-asks-for-sps-and-arc-returns-empty-sequences.md`.
Related: [[no_console_pretesting]], [[dcm4chee_mwl_lab]], [[repo_identity]], [[doc_filing_rule]],
[[working_style]].

## The two findings that reset the diagnosis, 2026-09-13 night

**1. `...` in arc's `server.log` is SEQUENCE ELISION, not truncation.** dcm4che never writes
sequence item contents to the log at any level — proven with a control query known to carry seven
SPS keys, which logged as `(0040,0100) SQ [1 Items]` / `>Item #1` / `...` in nine lines, nowhere
near the 50-line cap. **So `...` marked the RICHER queries.** Probe 01 read association 17 — three
keys, no SPS — and concluded the console never asks for a scheduled procedure step, having selected
that association *because* it was the only one without a `...`. **It was the outlier.** GEHC(6) at
13:08:08 asked for `PatientName`, `PatientID` and `(0040,0100)`. The console sends at least three
query shapes. **The query shape was never the problem**, and any future question about what is
inside a console's `(0040,0100)` must be answered off the wire.

**2. The IGS540 empty-sequence hazard reproduces here.** Ask arc for `(0008,1110)`, `(0032,1064)` or
SPS>`(0040,0008)` against a row that lacks them and it returns each as `SQ #=0` — the artifact behind
the dcm4che thread that closes with no working fix. **This overturns probe 03's F4**, which tested a
key set that never requested them. DVTk requests all three, so real modalities ask routinely.

## What is fixed, and how

`demo/site007-arc/rest/conformant-row-1.json` now carries a real procedure code
(`MRLSPINE` / `99DHPACS` / `MRI LUMBAR SPINE`) in **both** `(0032,1064)` and SPS>`(0040,0008)`.
arc persists both and serves them populated through `DH_WORKLIST` on 104. **Zero-item sequences in
the response: 3 -> 1** — only `(0008,1110)` remains, correctly empty for a newly scheduled order.
Conformant fix, not a workaround, and it is the Procedure Catalogue's first real entry. The
`99`-prefixed private scheme needs a real decision before go-live.

## Closed — do not re-open

**Attribute coercion cannot supplement or strip MWL return keys.** Six pushes, all rolled back:

| Rule | Fires | Effect on the wire |
|---|---|---|
| `C_FIND_RQ` + SCU | yes (logged) | changes MATCHING only, never the return-key set |
| `C_FIND_RSP` + SCP / + SCU | no | none |

arc assembles the response identifier — filling requested-but-absent keys as empty — **after**
coercion runs. Same wall both directions. Scripts kept with their rationale:
`supplement-ge-worklist-return-keys.ps1`, `strip-empty-sequences-from-mwl-response.ps1`; both have
`-Remove` and auto-rollback, and the second refuses to run while the first is installed.

Also closed: `console.pcapng` (26.94 MB) contains **zero** MWL queries — it is the console
C-STOREing MR images to `DH_WORKLIST:104`, which does independently confirm ADR 0005 on the wire.
The console's real `(0040,0100)` contents exist in no artifact this project holds.

## Next, and it is the decisive experiment

**Reboot the console — the system, not the application** (the blacklist survived two app restarts).
Planned for 2026-09-14. **This console has never been shown a conformant row**: every query it ever
made was answered from the seven non-conformant rows, and the conformant row did not exist until
~16:50 while the console went silent at 14:28:16. Seed BEFORE the reboot — `Refresh Worklist on
Startup` spends the first query the moment it comes back. Run the live tail first:

```
docker exec dh-arc-arc-1 sh -c "tail -f /opt/wildfly/standalone/log/server.log | grep -E 'GEHC|A-ASSOCIATE|MWL C-FIND'"
```

Capture with pktmon across the reboot — the wire has no `...`, and this is the only way the
console's real key list is ever recovered.

## Machines — the split that keeps getting asked

- **`.ps1` in `demo/site007-arc/scripts/` runs on the DEV MACHINE** (`WIN-2G5V0O0AEBU`), reaching the
  box over Tailscale. They need `D:\IBNSinaPacs\bin\dcmtk` and `bin\arc-config`, which exist only
  there. Use absolute paths; a fresh PowerShell window starts in `C:\Users\Administrator`.
- **Anything starting with `docker` runs ON THE BOX.** Exception:
  `read-console-query-from-arc-log.ps1` is all `docker exec`, so it is a box script.
- The box has no SSH, no WinRM, no RDP. Files come off it by running a one-line Node HTTP server
  bound to the tailnet address (`C:\DHPacs\Portal\bin\node\node.exe`), then curl from the dev machine.
- **Sante holds Ibn Sina's image-receive path only while user `user` stays logged into console
  session 1.** Verified 2026-09-13 night: still Active, PID 17188 on 11112. Check with `quser`.

## Instruments and traps

- **PS 5.1 + native stderr:** DCMTK logs to stderr; `2>&1` wraps each line in a
  `NativeCommandError` and `$ErrorActionPreference="Stop"` makes it fatal — a script reported
  failure *after* its config PUT and reload had both returned 204. Drop to `Continue` around the call.
- **A rollback target captured mid-incident is not a known-good state.** An auto-rollback that
  restored the start-of-run baseline would have restored the broken state. Strip the rule instead.
- **`findscu -v` echoes the REQUEST identifiers first** — counting artifacts across the whole
  transcript double-counts. Count from `Find Response` onward.
- The dev machine's clock is **+1h** vs the box and console.
- arc's `mwlitems` REST 404s on `DH_WORKLIST` but the DICOM C-FIND works. Never read a REST 404 as
  a broken AE.
- `(0008,0201)` TimezoneOffsetFromUTC is `dcmTimezoneQueryAdjustment: true`, not a defect. Still the
  only unrequested element in our response, and still untested as a suspect.

## Carried forward

- `nextDhpId` caps at 99 identities/day — Stage 2 blocker.
- Docker Desktop licence on a hospital chain's hardware — blocking at Stage 2.
- PHI lands on the DH box since ADR 0005's storage fix. Retention and capacity undecided.
- `(0010,1000)` OtherPatientIDs is silently dropped by arc — half of ADR 0002 is not implementable
  on this stack as written. Go-live blocker, not a demo blocker.
- Console photographs hold real patient data and a service-credentials card — deliberately not filed.
- `C:\DHWorklist\logs\*.etl|.pcapng|.txt` hold LAN captures — delete once read.
