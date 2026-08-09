---
name: SITE01 Workstation Setup & Blocking Issues
description: SITE01 (IBN Sina Hospital, Windows 11) FULLY COMPLETE 2026-05-25. AET=SITE01_ORTHANC, Tailscale 100.86.132.36, autolink.lua bugs fixed.
type: project
lastUpdated: 2026-05-10
originSessionId: e8446a9d-e451-42c4-b1f2-a501f048073a
aliases: [SITE01 Workstation Setup & Blocking Issues, site01-workstation-status]
---
## SITE01 Workstation Details

**Location:** IBN Sina Hospital (SITE01)  
**Hardware:** Windows 11, 100.86.132.36 (Tailscale IP)  
**Orthanc:** 1.12.11 installed at C:\OrthancServer\  
**Configuration:** SITE01_ORTHANC (AET), port 4242 (DICOM), port 8008 (HTTP)

---

## Completed Setup (Steps 4a–5)

✅ **Step 4a:** Python 3.12 installed  
✅ **Step 4b:** Tailscale 1.96.3 connected (IP: 100.86.132.36)  
✅ **Step 4c:** Orthanc 1.12.11 installed at C:\OrthancServer\  
✅ **Step 4d:** Site configuration written (SITE01_ORTHANC AET)  
✅ **Step 4e:** Lua forwarding script deployed  
✅ **Windows Firewall:** Rules added for ports 4242, 8008  
✅ **Local Verification:** 11/11 checks passed  
✅ **E2E Test (Step 5):** 
- Local Orthanc receives test DICOM ✅
- Lua script forwards to central within 30s ✅
- Central Orthanc confirms receipt ✅

---

## Current Blocker: Step 6a (Windows Service)

**Issue:** Cannot create Windows Service because manual Orthanc process is still running and holding ports 4242 and 8008.

**Error Pattern:**
1. Service created with New-Service command
2. Service won't start because ports are in use
3. Manual Orthanc process still running in background PowerShell

**Resolution Steps:**

```powershell
# 1. Find and stop manual Orthanc process
Get-Process Orthanc -ErrorAction SilentlyContinue | Stop-Process -Force

# Or manually: Ctrl+C in PowerShell window where Orthanc was started

# 2. Verify ports are free
netstat -ano | findstr "4242"  # Should return empty
netstat -ano | findstr "8008"  # Should return empty

# 3. Create service (copy entire block)
New-Service `
  -Name "OrthancDICOM" `
  -BinaryPathName '"C:\OrthancServer\Orthanc.exe" "C:\OrthancServer\Configuration\site-config.json"' `
  -DisplayName "Orthanc DICOM Server (DHS PACS)" `
  -StartupType Automatic

# 4. Start service
Start-Service -Name "OrthancDICOM"
Start-Sleep -Seconds 5

# 5. Verify
Get-Service -Name "OrthancDICOM"  # Should show Status = Running
Invoke-WebRequest -Uri "http://localhost:8008/system"  # Should return 200
```

---

## Remaining Steps (6b–6e)

### Step 6b: Hospital PACS Configuration
**Owner:** Hospital IT  
**Timeline:** 30 minutes  

| Parameter | Value |
|-----------|-------|
| Destination Name | LOCAL_ORTHANC or SITE01_BRIDGE |
| AET | SITE01_ORTHANC |
| IP Address | SITE01 workstation LAN IP (192.168.x.x) |
| Port | 4242 |
| Protocol | DICOM C-STORE |

**Success:** Test study visible in http://localhost:8008 within 5 seconds

### Step 6c: Full E2E Test with Real Study
**Timeline:** 30 minutes  
**Procedure:**
1. Ask radiologist to send real (anonymized) study from hospital PACS
2. Verify study appears in local Orthanc
3. Wait 35 seconds for stability timer
4. Check logs: `Get-Content "C:\OrthancServer\Logs\orthanc-startup.log.err" -Tail 30 | Select-String "AutoForward"`
5. Should see: "[AutoForward] Study forwarded to CENTRAL OK"
6. Open patient link in browser: https://pacs.dhsolutions.com.bd/open?token=<uuid>
7. Verify OHIF Viewer displays DICOM images

### Step 6d: Log Rotation
**Timeline:** 10 minutes  
**Task:** Create Windows Task Scheduler job to delete logs >14 days old weekly (Sunday 2am)

### Step 6e: Health Checks
**Timeline:** 10 minutes  
**Task:** Create Windows Task Scheduler job for weekly monitoring (Monday 8am)
- Orthanc service running
- Tailscale connected
- HTTP API responding
- Ports 4242/8008 listening

---

## Access & Credentials

**SITE01 Access:** User confirmed they have direct access to SITE01 workstation (Windows 11)  
**Network:** 100.86.132.36 on Tailscale VPN, local LAN IP varies (verify with ipconfig)  
**Central Server:** 100.118.47.99 on Tailscale VPN (192.168.1.10 on LAN)

---

## Documentation References

- **SITE01_IMPLEMENTATION_STATUS.md** — Complete status with all steps and commands
- **SITE01_PRODUCTION_READINESS_GUIDE.md** — Step-by-step instructions for Steps 6a–6e
- **HOSPITAL_IT_PACS_CONFIGURATION.md** — Vendor-specific PACS setup guides

---

## Next Session Action Items

1. **Immediate:** Stop manual Orthanc, complete Windows Service creation (Step 6a)
2. **Coordinate:** With Hospital IT for PACS configuration (Step 6b)
3. **Test:** Full E2E with real DICOM study (Step 6c)
4. **Automate:** Log rotation and health checks (Steps 6d–6e)

---

**Last Updated:** 2026-05-10  
**Current Blocker:** Windows Service port conflict (manual Orthanc still running)  
**Time to Resolve:** < 15 minutes (stop process + create service)  
**Time to Full Phase 2 Complete:** ~2 hours (including 6b–6e)
