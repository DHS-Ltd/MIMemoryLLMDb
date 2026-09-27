---
name: dcm4chee-mwl-lab
description: "The Machine A dcm4chee-arc + DVTk lab built 2026-09-13 — a deliberate departure from the Orthanc stack that closed the full MWL loop and overturned three project assumptions. Rig details, exact versions, gotchas and what is still open."
metadata: 
  node_type: memory
  type: project
  modified: 2026-09-12T23:20:04.675Z
  originSessionId: 5cbacc11-a81b-40e2-bd0e-431675ea9aa2
---

**Built and completed in one session on 2026-09-13.** A deliberate experiment with a
*different approach*: bypass Orthanc entirely — the stack every DH project has used — and drive
a Modality Worklist loop with **dcm4chee-arc 5.35** plus the **DVTk Modality Emulator**, on
Maidul's own desktop rather than the Ibn Sina box.

**It was framed explicitly as a learning rig, not a product bake-off.** Orthanc remains the
product; nothing built here ships. But it was instrumented so the bake-off question stays
answerable later. MPPS was deliberately out of scope. Related: [[grilling_plan]],
[[repo_identity]], [[working_style]], [[doc_filing_rule]].

**Why it existed:** three sessions at the Ibn Sina site produced no successful worklist query
and no way to tell whether the fault was the server, the console, or the network. This rig
removed every variable that could not be controlled — no hospital, no GE console, no service
password, no radiographer's schedule.

## Everything is written up — read these, not this file, for detail

`D:\IBNSinaPacs\dcm4chee_Testing\` on Machine B:

| File | What it is |
|---|---|
| `findings/2026-09-13-mwl-loop-result.md` | **The deliverable. 12 findings, ~415 lines, the full C-FIND identifier attribute by attribute.** |
| `MACHINE_A_MWL_LAB_PLAN.md` | The design and every decision, with reasons |
| `MACHINE_A_RUNBOOK.md` | P0–P11 paste-by-paste, with the corrections folded in |
| `compose/docker-compose.yml` | The rig, with five documented departures from upstream |
| `hl7/seed1-video-orm-o01.hl7`, `hl7/seed2-dh-shaped-orm-o01.hl7` | The two ORM messages; seed 2 is Ibn Sina's real format |
| `scripts/` | `send-mllp.ps1`, `seed-rest-mwlitem.ps1`, `assert-closure.ps1`, `enable-arc-debug-logging.ps1` |
| `probes/Installation_Results/Worklist_query.txt` | The raw C-FIND dump off the emulator |

## The rig, exactly

| | |
|---|---|
| Machine A | `MAIDUL_DESKTOP`, Win 11 Pro, PS 5.1, 32 GB RAM, Docker 29.5.3 (Linux containers, WSL2), **Docker engine capped at 8.3 GB shared with Immich/n8n/hermes**, JDK 25 |
| Lab root on A | `E:\dcm4chee_Testing\` (`compose/ hl7/ rest/ scripts/ downloads/ logs/`) |
| Images | `dcm4che/dcm4chee-arc-psql:5.35.0`, `dcm4che/slapd-dcm4chee:2.6.13-35.0`, `dcm4che/postgres-dcm4chee:17.9-35` — **pinned, never `latest`** |
| Compose project | `dcm4chee-lab`; containers `dcm4chee-lab-{arc,db,ldap}-1` |
| Published ports | **only three, all `127.0.0.1`**: `8080` UI, `11112` DICOM, `2575` HL7. LDAP and Postgres unpublished |
| UI | `http://localhost:8080/dcm4chee-arc/ui2` |
| Modality | **DVTk Modality Emulator 3.1.4.0**, `C:\Program Files (x86)\DVTk\Modality Emulator\`, own AE title `MODALITY` |

## Gotchas that cost real time — do not repeat these

1. **`WORKLIST` is the MWL AE title, not `DCM4CHEE`.** arc 5.35 ships eight AE titles and
   serves the Modality Worklist from a dedicated one. `GET /aets/DCM4CHEE/rs/mwlitems` → 404
   while `/rs/studies` on the same AE → 204. The emulator's **RIS System** role must use
   `WORKLIST`; its **Storage** role uses `DCM4CHEE`. Both on port `11112`. The walkthrough
   video points everything at `DCM4CHEE` because it ran on an older build.
2. **"DICOM Echo failed" was NOT the famous `.def`-files bug.** The Activity Logging tab said
   `Can't connect over TCP/IP to remote host "localhost" using port number 105` — the
   emulator's Configure Remote Systems tab was simply still at factory defaults (RIS `105`,
   PACS `107`). **Do not infer from labels; read the log.** The `.def` files were never
   implicated; both Echoes passed the moment the ports were right.
3. **The DVTk Modality Emulator is no longer on dvtk.org's public download page.** The current
   v5.3.0 set has RIS Emulator, Query Retrieve SCP Emulator, DICOM Network Analyzer, DICOM
   Definition Files (v1.1.10), DVT, DICOM Editor, Storage SCP/SCU Emulator, DVT Examples,
   DICOM Compare — **no Modality Emulator**. SourceForge has none either. Maidul found it (a
   members-only area). Third-party mirrors carry `modality_emulator_3.1.4.msi` and were
   refused as unverified 2012 binaries.
4. **Definition files install to `C:\Program Files (x86)\Common Files\DVTk\Definition Files\DICOM`**
   — the *article's* spelling (`DVTk\Definition Files`), not the walkthrough report's
   (`DVTK Definition Files`). **DVT Examples installs to `C:\Users\maidu\OneDrive\Documents\`**,
   not under Program Files, which makes a Program Files search look empty.
5. **`$PSScriptRoot` is empty during parameter binding under `powershell -File` on PS 5.1.**
   Resolve script-relative paths in the body with `$MyInvocation.MyCommand.Path`.
6. **MLLP needs CR between segments, not LF.** `send-mllp.ps1` stores files LF-separated for
   editability and converts on send.
7. **Set the emulator's Local IP to `localhost`.** Its dropdown offered the Tailscale IPv4/IPv6
   and the LAN address, any of which would bind its listener to a network other machines reach.

## The three findings that change what the project believes

Full detail in the findings doc; these are the ones that alter decisions.

1. **`ScheduledStationAETitle` is a RETURN key, not a MATCHING key** — for DVTk at least. Its
   AE title is `MODALITY`, both seeded entries carried `SCHEDULEDSTATION`, and **both matched
   anyway**. Its whole C-FIND is wide open: every element empty, filtering on nothing, not even
   the date. The assumption that a console filters on `(0040,0001)` drove three Ibn Sina
   sessions and the entire four-row Sante discriminator design. **It was never safe.**
2. **The modality never requests `PatientAge`.** It asks `(0010,0030)` PatientBirthDate,
   `(0010,1020)` PatientSize, `(0010,1030)` PatientWeight — `(0010,1010)` is absent from the
   query. ADR 0001 carries age and refuses to invent a DOB, so such a console shows **neither**.
   `DMWL_TAG_MAP.md` flagged this as "observe, don't assume"; now observed.
3. **dcm4chee-arc synthesizes the SPS start date natively.** The video's ORM carries no start
   component in `OBR-27` and the entry still came back dated today. That is what ADR 0007
   specifies and what Orthanc's ModalityWorklists plugin **cannot** do — the DH feeder fakes it
   by rewriting every `.wl` file every five seconds.

Also worth carrying: arc **does not invent a birth date** when `PID-7` is empty (ADR
0001-compatible out of the box), `PID-4` does **not** map to `(0010,1000)` OtherPatientIDs
(so ADR 0002's "send the HIS number twice" only half-survives an ORM), and `ORC-18` is
**ignored** unless `hl7OrderScheduledStation` is configured — arc's default rule overrode a
sent `GEHC` with `SCHEDULEDSTATION`, silently.

## What the loop proved

`bill_line_id BL-1001` → HL7 `OBR-19`/`OBR-20` → MWL `(0040,1001)`/`(0040,0009)` → C-FIND
response → operator picks the patient → C-STORE → stored instance `(0040,0275)`
RequestAttributesSequence. **A hospital billing key ended up inside a DICOM image with no
keystroke anywhere in the chain.**

L3 ("closure") passed machine-checked: `PatientID`, `PatientName`, `AccessionNumber` and
`StudyInstanceUID` all identical between the worklist entry and the stored study. The
`StudyInstanceUID` was the `ZDS-1` value from the HL7 message — **the modality honoured the
worklist's UID rather than minting its own**, answering another "observe, don't assume" item.

## Still open

- **P11 is the highest-value remaining step:** replay the same query with `dcm4che-tools` and
  diff its C-FIND against DVTk's. Until then findings 1 and 2 describe *DVTk's* behaviour, not
  necessarily a DICOM norm. That diff is what makes them generalisable rather than anecdotal.
- `POST /aets/{aet}/rs/mwlitems` returns a bare **404 with no body and no server log** for a
  full MWL item, while a garbage body returns 400 (so path and verb are right). Parked. Seed 3
  never landed, so `PatientAge` was never actually served — though per finding 2 it would not
  have been asked for.
- `hl7OrderScheduledStation` left unconfigured on purpose, so the worklist holds two different
  station AE titles — a discriminator set that arose for free.

**The honest caveat, stated at the time:** a modality emulator is not a SIGNA Hero. This proves
the assumption was unsafe and the loop works — not that GE behaves identically.

## Moving files between the machines

Machine B **cannot** reach Machine A. The tailnet ACL permits only
`maidul-desktop -> win-2g5v0o0aebu:8901`, and Taildrop refuses with *"peer is owned by a
different user"* (B is a tagged device, A is user-owned). **Maidul transfers files by hand**;
Machine B authors text, Machine A runs it. `gh` on Machine B is authenticated as `DHS-Ltd` with
`repo` scope, so a private repo was offered as a route and not taken.
