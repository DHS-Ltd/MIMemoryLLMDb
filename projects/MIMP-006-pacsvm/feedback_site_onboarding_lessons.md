---
name: feedback-site-onboarding-lessons
description: "Hard-won lessons from SITE01 and SITE03 onboardings — NSSM required, port 3000 not needed from workstation, DICOMweb not needed on local bridge."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d49fefb1-8b36-43cc-853e-5cf7a507795c
aliases: [feedback-site-onboarding-lessons]
---

## Rule: Use NSSM, never `New-Service`, for Orthanc on Windows

`New-Service` fails with error 1053 (30-second timeout) because `Orthanc.exe` is a console application — it does not implement the Windows Service Control Manager protocol and never sends `SERVICE_RUNNING` to SCM.

**Why:** Discovered during SITE03 (Cumilla) onboarding. `New-Service` created the service entry but it could never start.

**How to apply:** Always install Orthanc as a Windows service via NSSM:
```powershell
& "C:\OrthancServer\nssm.exe" install OrthancDICOM "C:\OrthancServer\Orthanc.exe"
& "C:\OrthancServer\nssm.exe" set OrthancDICOM AppParameters "C:\OrthancServer\Configuration\site-config.json"
```
Pass the config path via `nssm set AppParameters` on a separate line — passing it inline to `nssm install` mangles PowerShell quoting and Orthanc starts with no config.

---

## Rule: Port 3000 is NOT needed from site workstations

The patient share link is created by the **central** Orthanc's `autolink.lua`, which calls `http://backend:3000` via Docker internal DNS — never via Tailscale. The local site workstation only needs port 4242 (DICOM C-STORE) to reach the central server.

**Why:** SITE03 `Test-NetConnection 100.118.47.99 -Port 3000` failed (`TcpTestSucceeded: False`) yet patient links were created correctly. Port 3000 was unreachable from Tailscale because `pacs-backend` had no host `ports:` mapping in docker-compose.yml at that time. Links still worked via internal Docker networking.

**How to apply:** When verifying a new site's connectivity, only `Test-NetConnection -Port 4242` is a hard requirement. Port 3000 check is optional (only needed to run `test_e2e.py` from the workstation, which uses localhost anyway and runs on the central VM).

---

## Rule: DICOMweb plugin is NOT needed on local site Orthanc

The local bridge only does DICOM C-STORE forwarding (`RestApiPost('/modalities/CENTRAL/store', ...)`). DICOMweb (WADO-RS/STOW-RS) is only required on the central Orthanc for OHIF to fetch images.

**Why:** SITE03 `/plugins` endpoint returned only `explorer.js`, not `dicom-web`. Pipeline worked perfectly.

**How to apply:** Do not troubleshoot missing DICOMweb plugin on local site workstations. It is expected and irrelevant.

---

## Rule: Run Orthanc manually first when diagnosing service failures

If `Start-Service OrthancDICOM` fails, run:
```powershell
& "C:\OrthancServer\Orthanc.exe" "C:\OrthancServer\Configuration\site-config.json"
```
This prints the real error (bad JSON, BOM encoding, port conflict, missing plugin) directly to the console. The Windows Event Log error codes (1053, 1067) are generic and don't identify the root cause.

**Why:** Validated during SITE03 troubleshooting — manual run immediately showed correct startup with port 8008, confirming the config was fine and NSSM was the only issue.
