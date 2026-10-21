---
name: ibn-sina-ctg-site
description: IBN Sina Hospital Chattogram (CTG) = SITE023 — installed v1.0.4 clean 2026-10-21; PARKED waiting on Siemens CT config; next session = receiving verification.
metadata:
  node_type: memory
  type: project
  originSessionId: 39125933-4ebb-446d-b347-f94150cb65d7
  modified: 2026-10-21T15:02:29.543Z
---

New site, started 2026-10-21. Record: `01_Pacs_File/01_Pacs_File/docs/Ibn_Sina_CTG_System_Onboarding/`
(README has the resume point). Third Ibn Sina site — distinct from Bogura ([[bogra-site-recovery-and-storage-overflow]])
and Dhanmondi 4 ([[ibn-sina-hospital-site022]]).

**State:** SITE023_DHPACS, bundle v1.0.4 (Viewer 2.0.4 + Receiver, engine 1.12.11) freshly installed over a
clean `C:\DHPacs` after removing an old SITE006-labelled install, Osimis Orthanc and DHViewer 4.6.7. Licence
bound to `44KW-X4GZ-HR34-Z7PV`, expires 2037-12-31. Receiver + Viewer verified; storage `D:\DHPACS\Storage`,
cap 900 GB (user's choice over my 700 recommendation, D: is 954 GB). Scanner-facing IP `192.168.112.80`
(USB NIC, 100 Mbps); Siemens CT `192.168.112.139`. Standalone site, no Portal.

**Parked 2026-10-21:** user handing `SIEMENS_CONFIG_HANDOVER.md` to the hospital engineer. **Next session starts
the receiving part**: scanner echo -> real send -> series-count -> files on disk -> no N-ACTION. Guide one step at
a time ([[feedback-one-step-at-a-time-on-site-pcs]]).

**Also open:** the PC's earlier random shutoffs were GT 710 `0x116` blue screens, card cleaned+reseated and
unproven — on any recurrence run `docs/Problem_Troubleshooting/shutdown-triage.ps1`, a repeat 0x116 means swap
the card. Windows build 26120 Insider check never done. MR scanner unidentified (`192.168.112.2` pings).
