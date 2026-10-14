---
name: ibn-sina-hospital-site022
description: "IBN Sina Hospital Dhanmondi 4 (SITE022, NOT Bogura) - Oct 2026 outage fix, storage moved to D:\\DHPACS, slow-retrieval diagnosis in progress; modality AET DHVIEWER2 / port 4242 are locked."
metadata:
  node_type: memory
  type: project
  originSessionId: 3354ab6c-6ad4-4d00-bf6c-36c6ad1a5712
  modified: 2026-10-14T16:59:44.490Z
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

**Why:** lesson - install alone will not make it fast; measure first. **How to apply:** gate the Receiver swap on the throwaway-instance result.
