---
name: mirpur-orthanc-av-sqlite-lock
description: "Named pointer — Mirpur (SITE015) outage 2026-08-27: Viewer showed no patients because a trial McAfee install locked Orthanc's live SQLite index file, not because Orthanc was down. Resolved; installer still doesn't set AV exclusions anywhere."
metadata:
  node_type: memory
  type: project
  originSessionId: 9be7f864-f45d-4960-ae62-2a251eb4ab36
  modified: 2026-08-27T10:57:10.422Z
---

Full incident writeup, all raw PowerShell transcripts and screenshots:
`01_Pacs_File/01_Pacs_File/docs/Problem_Troubleshooting/2026-08-27_mirpur-orthanc-outage-av-sqlite-lock.md`.
Troubleshooting steps folded into `orthanc/README.md`'s new "Troubleshooting" section and a new
"Open, 2026-08-27" note in its Contracts section — read those first before re-diagnosing a similar
symptom at any site, don't re-derive.

**The reusable diagnostic pattern, useful beyond this one site:** a report of "Orthanc isn't running"
is not evidence Orthanc isn't running. A well-formed Orthanc JSON error (even a 404 on `/`, which
isn't a real resource here since `OrthancExplorerEnabled` is `false`) proves the HTTP server is
alive — a truly dead Orthanc gives connection-refused, not a payload. Likewise `Get-Service -match
'orthanc'` finds nothing because the service is white-labelled `DH-PACS-Receiver` (NSSM-hosted).
The decisive branch: if a Viewer C-FIND **connects and returns zero results** (not an error), stop
suspecting the licence/config/network and go straight to `Logs\orthanc-stderr.log` for SQLite
errors. `"Cannot flush the SQLite database to the disk (is your filesystem full?)"` is Orthanc's
generic guess for *any* SQLite I/O error — it is not a literal disk-space check, and free space must
be confirmed separately (Mirpur had 324GB free on a "full" disk). Once the live SQLite connection
takes one I/O error it stays broken for every later query until the service restarts — `Restart-
Service DH-PACS-Receiver` is safe (documented in `50-site.json`'s own README, loses nothing already
on disk) and is the actual fix, not just a log-reading exercise.

**Root cause here specifically:** a trial McAfee install (not the site's licensed AV, since expired)
was the box's real active antivirus — Windows Defender was fully disabled
(`Get-MpComputerStatus` → `AntivirusEnabled: False`), confirmed via
`Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct` (works even when
Defender's own module fails to query, which it did here with `0x800106ba`). Real-time scanning of a
live, fast-growing SQLite file is a known Windows failure class. Customer consulted McAfee support,
uninstalled it, rebooted — Windows Defender auto-enabled itself (box was never left with zero AV).

**Two open threads, not yet resolved:**
- No AV exclusion has been added anywhere (Mirpur still runs bare Windows Defender against
  `D:\DHPacs\Receiver\Storage` with no exclusion) — this can recur with Defender exactly as it did
  with McAfee. `install-orthanc-service.ps1` should set this at every future install; doesn't yet.
  Worth checking whether other live sites (Shantinagar, Bogura) carry the same exposure.
- The Viewer's Query/Retrieve dialog showed a stale/wrong target AE label `SITE004_DHPACS` (not
  `SITE015_DHPACS`) — traced to `orthanc/README.md`'s own silent-install *example* command using that
  AET as a placeholder, almost certainly the origin, but not confirmed and not fixed. Didn't block
  anything (Orthanc's `DicomCheckCalledAet` is unset everywhere, defaults `false`), so it was set
  aside once the real outage was resolved. Weasis's preference file wasn't found under the RDP admin
  profile — check the actual clinical user's profile next time this is picked up.

See [[dh-pacs-standalone-site]] for the umbrella Site/Receiver context this sits under.
