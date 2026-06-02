---
name: site03-cumilla-status
description: "SITE03 — Cumilla Medical College Hospital. Onboarding COMPLETE 2026-06-02. Philips MRI live, NSSM service confirmed auto-start."
metadata: 
  node_type: memory
  type: project
  originSessionId: d49fefb1-8b36-43cc-853e-5cf7a507795c
---

## SITE03 — Cumilla Medical College Hospital

**Status:** COMPLETE ✅ (2026-06-02)  
**AET:** `SITE03_ORTHANC`  
**Tailscale IP:** `100.81.132.123` (hostname: `desktop-5gja4q2`)  
**Orthanc version:** 1.12.11  
**Modality confirmed live:** Philips MRI

**Why:** Second external hospital site onboarded to the DH PACS platform, proving the site-onboarding playbook scales beyond Ibn Sina.

**How to apply:** When a third site is onboarded, expect the same NSSM and port-3000 gotchas documented in [[feedback-site-onboarding-lessons]].

---

## Setup Summary

| Step | Result |
|---|---|
| Tailscale installed & authenticated | ✅ — `100.81.132.123` on DHS network |
| Port 4242 reachable to central | ✅ — `TcpTestSucceeded: True` |
| Orthanc installed at `C:\OrthancServer\` | ✅ — 1.12.11 |
| `site-config.json` configured | ✅ — AET `SITE03_ORTHANC`, HttpPort 8008, CENTRAL modality |
| `forward_to_central.lua` deployed | ✅ — Lua script loaded, CENTRAL modality confirmed via `/modalities` |
| NSSM Windows service `OrthancDICOM` | ✅ — `Status = Running`, `StartType = Automatic` |
| Windows Firewall ports 4242 + 8008 | ✅ |
| Philips MRI study transferred end-to-end | ✅ — Patient visible in admin dashboard and OHIF mobile viewer |

---

## Key Troubleshooting Encountered

- **`New-Service` timeout (error 1053):** Orthanc.exe is a console app, not a Windows service binary. SCM waits 30s for `SERVICE_RUNNING` signal, gets none, kills it. Fix: use NSSM.
- **Port 3000 unreachable from workstation:** Not a problem — patient link is created by central Orthanc's `autolink.lua` via Docker internal DNS (`http://backend:3000`). Port 3000 never needs to be exposed to Tailscale for the core flow.
- **NSSM argument quoting:** Passing config path inline to `nssm install` mangled quotes. Fix: `nssm install <svc> <exe>` then `nssm set AppParameters <path>` separately.
- **DICOMweb plugin absent:** Not needed on local bridge — C-STORE forwarding uses only core Orthanc.

---

## File Locations on Workstation

| File | Path |
|---|---|
| Orthanc executable | `C:\OrthancServer\Orthanc.exe` |
| NSSM | `C:\OrthancServer\nssm.exe` |
| Site config | `C:\OrthancServer\Configuration\site-config.json` |
| Lua forwarding script | `C:\OrthancServer\forward_to_central.lua` |
| DICOM storage | `C:\orthanc_db\` |
| NSSM stdout log | `C:\OrthancServer\Logs\orthanc-stdout.log` |
| NSSM stderr log | `C:\OrthancServer\Logs\orthanc-stderr.log` |
