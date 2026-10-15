---
name: ibn-sina-hospital-site022
description: "IBN Sina Hospital Dhanmondi 4 (SITE022, NOT Bogura) - Oct 2026 outage fix, storage moved to D:\\DHPACS, slow-retrieval diagnosis in progress; modality AET DHVIEWER2 / port 4242 are locked."
metadata:
  node_type: memory
  type: project
  originSessionId: 3354ab6c-6ad4-4d00-bf6c-36c6ad1a5712
  modified: 2026-10-14T18:54:48.483Z
---

Site: **IBN Sina Hospital Dhanmondi 4**, site number **022** (licence AET `SITE022_DHPACS`), Machine Code
`V45M-52GB-K99M-KH5Z`. Licence file `SITE022_IbnSinaHospital_Dhanmondi4.dhvlicense` already placed on the
site box (user confirmed 2026-10-14). Distinct from Ibn Sina Bogura (Site 008) - see [[bogra-site-recovery-and-storage-overflow]]
for the shared pattern (brownfield Orthanc, locked modality AET, `50-site.json` post-install edit).

**Hard constraint:** modality-facing `DicomAet` = **DHVIEWER2**, `DicomPort` = **4242** (Siemens CT/MR locked,
no access). Never change; the Receiver install must keep them via the Bogura-style post-install edit.

**Root cause of the outage (2026-10-13):** primary Orthanc stored to C:\DHViewer on a 238 GB SSD with no cap -> C: hit 0 GB.
Hand-built migration (monitor.py -> archive Orthanc on 4243, storage D:\DHViewer, index C:\OrthancArchive) deadlocked: push jobs
timed out at 1800 s, 3 monitor.py copies piled up. Last good arrival 2026-10-13 15:14.

**Done 2026-10-14:** automation (OrthancMonitor/ArchiveCleaner/Watchdog tasks + OrthancWatchdog service) DISABLED not deleted;
primary storage+index moved to `D:\DHPACS\Storage` / `D:\DHPACS\Index` (robocopy /MOVE, verified 265 studies, 0/200 unreadable);
deleted 485 old archive studies (<=2026-06-16) and 302 GiB of unindexed pre-May-9 orphan files (user-confirmed DELETE, no backup).
D: ~326 GiB free after. Archive Orthanc (8043) still runs, ~407 GiB, to be merged/retired. HDD D: 931 GB 7200rpm, SSD C: 238 GB, 14 GB RAM.
Backups in `D:\DHPACS\backup` (orthanc.json.orig, OrthancMigration copy); old index kept as `C:\Orthanc.moved`.

**Speed diagnosis (the user's main objective = fast retrieval in the Viewer):** server-side, not Viewer/network/disk. Disk healthy
(3 ms latency, idle). Orthanc 1.12.10 burns ~135-147 ms CPU (>93% of wall) on a trivial index-only `GET /instances/{id}` on BOTH the
primary (index on HDD) and the archive (index on SSD) while `GET /system` takes 5 ms -> index-on-SSD is NOT the fix. Suspect: the
stock `Plugins` folder (the DH Receiver payload ships WITHOUT the 316 MB Plugins). **2026-10-14 result:** box loaded 31 plugins (DH Receiver payload loads none). Set `"Plugins" : [ ]` in `C:\Program Files\Orthanc Server\Configuration\orthanc.json` (backup `D:\DHPACS\backup\orthanc.json.before-noplugins`): index call 198->81 ms, /file 371->84 ms, zip 6.8->19.9 inst/s, reception confirmed working (265->272 studies, AET/port intact). Still ~40x slower than a healthy Orthanc (kernel+user CPU bound, ~5 ms even for /system): next = throwaway no-plugin empty-DB Orthanc + CPU speed/power-plan check to split engine/machine vs DB-specific.
Defender excludes whole C:\ and D:\ (not the cause, but a security smell to narrow later).

**ROOT CAUSE FOUND 2026-10-14 (speed10):** same 523k-instance SQLite index copy, plugin-less throwaway Orthanc, `GET /instances/{id}`:
**1.12.4 = 2.4 ms**, 1.12.10 = 144 ms, 1.12.11 (DH Receiver pin) = 143 ms, 1.13.0 = 146 ms. Per-request cost grows ~0.3 us per stored
instance in >=1.12.10 (likely the 1.12.5 "ExtendedFind" rewrite on SQLite); all engines read the DB as schema v6 (no migration to swap).
Product-wide impact: every DH site on the 1.12.11 pin slows linearly as its cache grows. Bisect 1.12.5-1.12.9 pending; official builds at
orthanc.uclouvain.be/downloads/windows-64/orthanc/<ver>/Orthanc.exe (unsigned). ADR candidate (engine pin).

**Swap attempt 1 (2026-10-14 22:40):** preflight refused, live untouched. 1.12.4 hard-fails on unknown `Warnings` names; Osimis
>=1.12.5 configs carry W003-W007 (1.12.4 knows only W001/W002). Fix = strip them with ATOMIC regex
`,(?>(?:\s*//[^\n]*)*)\s*"W00[3-9]_[A-Za-z]+"\s*:\s*(?:true|false)` (non-atomic version hangs on comment-heavy stock config).
Verified locally: 1.12.4 starts on stock Osimis config after strip. Any engine pin in the Receiver must handle this too.
Baseline before swap: index 84.5 ms, file 135 ms, zip 10.2 inst/s (252,928 instances).

**Swap attempt 2 (2026-10-14):** preflight passed, but swap FAILED + rollback FAILED -> live Orthanc service left STOPPED (reception down).
Cause: NSSM service OrthancArchive runs the SAME `C:\Program Files\Orthanc Server\Orthanc.exe` ("D:\orthanc-archive.json", loads full
Plugins folder, no Warnings section) -> exe image locked. Exe untouched; orthanc.json already stripped of W003-W007; backups
`Orthanc-1.12.10.exe` + `D:\DHPACS\backup\orthanc.json.before-1124` exist. Fix given (script 1124b): repoint archive NSSM
`HKLM\...\Services\OrthancArchive\Parameters\Application` to `Orthanc-1.12.10.exe` (archive stays 1.12.10 - do NOT delete that file),
lock-check before swap, rollback start in finally, final safety-net Start-Service. Lesson: any service-stopping site script must end
with an unconditional "service running?" check in finally; and check every process's ExecutablePath before replacing a binary.

**SWAP DONE 2026-10-14 23:08 (script 1124b, SUCCESS):** live primary now Orthanc **1.12.4** (`C:\Program Files\Orthanc Server\Orthanc.exe`),
AET DHVIEWER2:4242 unchanged, 274 studies/252,928 instances intact, REST write self-test OK. Same DB: index 82.1 -> 6.8 ms, /file 84.1 -> 4.4 ms,
process CPU ~9.5 s -> ~0 s per 120 calls, zip 10.0 -> 19.7 inst/s (zip now compression-bound; Viewer uses DIMSE, not zip).
Archive (OrthancArchive, NSSM) now runs `Orthanc-1.12.10.exe` (registry Parameters\Application repointed) - DO NOT delete that file.
Undo: stop Orthanc, copy Orthanc-1.12.10.exe over Orthanc.exe + `D:\DHPACS\backup\orthanc.json.before-1124` over orthanc.json, start.
NOT yet proven: a real Siemens C-STORE on 1.12.4, doctor-side Viewer retrieval speed. Still pending: bisect 1.12.5-1.12.9
(`Orthanc-bisect-test.zip` in user Downloads), Receiver engine-pin ADR (Receiver pins slow 1.12.11), DH Viewer v2.0.4 install here,
archive retire/merge, recycle cap, onboarding docs.

**Next step prepared 2026-10-14 (script `ibnsina_setup.ps1`, in user Downloads, NOT yet run):** Viewer-only path chosen over the
Bogura-style bundle because the bundle reinstalls slow Orthanc 1.12.11. Script: cap = floor((primaryUsed + D:free - 50 GB)/10)*10
(~460 GB expected; ~60 GB/month -> ~7 months) with MaximumStorageMode Recycle; registers `DHV: [DHV_SCU,127.0.0.1,11113]` via a
comment-stripping ConvertFrom/ConvertTo-Json rewrite that asserts no other key changed (tested locally on stock Osimis config + 1.12.4);
preflight on test ports; restart; then silent `DHDicomViewer_Setup_v2.0.4.exe /LICENSE=<SITE022 file> /AET=DHVIEWER2` (installer
SHA256 8A6B8380...563C1E, licence SHA256 CF151837...F63404; licence machine_id V45M52GBK99MKH5Z, expiry 2037-10-14).

**SETUP DONE 2026-10-15 (~00:00, ibnsina_setup.ps1 SUCCESS):** cap **450 GB** Recycle live (Orthanc logged "At most 450.00GB"),
`DHV:[DHV_SCU,127.0.0.1,11113]` registered (DicomModalities was `{}` before), C-ECHO OK, DH DICOM Viewer **v2.0.4** installed silently
in `C:\Program Files (x86)\DH Solutions Limited\DH DICOM Viewer`, node DHVIEWER2@localhost:4242, licence in ProgramData, machine code MATCH.
Config backup: `D:\DHPACS\backup\orthanc.json.before-cap-viewer`. CORRECTION: primary only holds studies from ~2026-09-10 (archive holds
May-mid-Sep); intake ~280 studies / ~150-190 GB per month -> 450 GB = ~2.5-3 months (not 7). Pre-Sep-10 priors are ONLY in the archive
(DHVIEWER_ARC:4243, not visible to the new Viewer). Recommended next: merge archive into primary overnight, retire archive, raise cap
to ~850 GB (~5 months). Also installed: "Orthanc 26.1.0" (Osimis - repair/upgrade would restore slow 1.12.10), "DHViewer 4.6.7"
(unknown connection method - may have broken when plugins were disabled 2026-10-14), UltraViewer. Pending user tests: Viewer
Q/R + open a large study, first real exam arrival.

**FLAG - OPEN FOLLOW-UP (user, 2026-10-15): re-measure patient-data loading speed at this site after ~2 weeks of use
(due ~2026-10-29 to 2026-11-05).** Fix is proven only server-side (index 82 -> 7 ms) plus one day; doctor-side Viewer load times and
behaviour as the 450 GB cap fills are unmeasured. Protocol + result table: repo `01_Pacs_File/docs/Ibn_Sina_Dhanmondi4_System_Onboarding/FOLLOW_UP_speed-measurement.md`
(site record folder created 2026-10-15: README, SITE_FACTS, 2026-10-14 event file). Record result as a new dated file there; do NOT claim
"proven in the field" to other sites or in the engine-pin ADR until it is done. Also flagged in `orthanc/BUILD-NOTES.md`.
When a session starts on/after 2026-10-29 and touches this site, remind the user this is due.

**Why:** lesson - install alone will not make it fast; measure first. **How to apply:** gate the Receiver swap on the throwaway-instance result.
