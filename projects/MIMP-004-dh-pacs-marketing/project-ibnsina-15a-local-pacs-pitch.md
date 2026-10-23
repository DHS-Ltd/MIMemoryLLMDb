---
name: project-ibnsina-15a-local-pacs-pitch
description: "Ibn Sina Hospital 15/A — pitching the Local PACS (Archive Edition) as a shared archive behind the 4 DHV Workstations 15/A bought itself; grilling started 2026-10-23, not sold"
metadata:
  node_type: memory
  type: project
  originSessionId: 1410b357-ad6d-4467-ad2b-ad47b4bbb601
  modified: 2026-10-23T16:39:37.493Z
---

Pitch, not a sale. Decision log: `docs/LocalPACS/IbnSina15A/PITCH_DECISIONS.md` (read it first —
D1–D5 plus the v2 field wording). Not the Cancer Center (that track is DH PACS Dental now, per the
user 2026-10-23 — the Cancer Center Site Server memory may be stale).

Facts from the user, 2026-10-23: 15/A bought 4 of the 7 Ibn Sina workstations with its own budget;
SITE022 (`DHVIEWER2`) is one of them; workstation 1 holds only ~1 month; a **Report Typist** pre-loads
each session onto the workstation before the radiologist arrives; Siemens auto-send to a PACS node is
a standard Siemens feature.

**Why:** retention (~3 months at SITE022, 450 GB cap) and data safety (2026-10-13 outage, no backup)
are the real pain; speed was an Orthanc ≥1.12.10 regression DH already fixed (1.12.4 swap).

**How to apply:** lead with history + safety; speed only as "already fixed, not permanent"; no speed
figures; "the archive", never "NAS". See [[feedback-pitch-to-the-room-as-it-runs]].
