---
name: ssh-connection-setup-complete
description: SSH connection to PACS VM successfully configured. Root cause was vEthernet adapter IP conflict with VM IP.
metadata: 
  node_type: memory
  type: project
  originSessionId: ec274d09-378a-48fd-92dd-697434882926
---

## SSH Connection to PACS VM — RESOLVED

**Status:** ✅ WORKING (as of 2026-05-25)

### Root Cause
The **host's vEthernet (ImmichSwitch) adapter had the same IP address as the VM (192.168.1.10)**, preventing communication. This created an IP conflict on the Hyper-V bridge.

**Why:** After VM restart, network adapter configuration was misaligned.

### Solution Implemented

1. **Reconfigured vEthernet Adapter:**
   - Changed IP from 192.168.1.10 (conflict) → 192.168.1.6 (host)
   - Subnet mask: 255.255.255.0
   - Default gateway: 192.168.1.1
   - Via: Control Panel → Network Connections → vEthernet (ImmichSwitch) Properties

2. **Verified SSH Service on VM:**
   - SSH service was running (`systemctl status ssh`)
   - UFW firewall had SSH rules in place
   - SSH was listening on port 22

3. **Tested & Verified:**
   - `Test-NetConnection 192.168.1.10 -Port 22` → TcpTestSucceeded: True ✅
   - `ssh pacsvm` → Connected successfully ✅

### Prevention Going Forward

**After any VM restart, verify:**
```powershell
# Check host adapter has correct IP (not 192.168.1.10)
Get-NetIPAddress | Where-Object {$_.InterfaceAlias -like "*ImmichSwitch*"}

# Should show: 192.168.1.6 (or .1)
```

### Documentation Updated
- **File:** `docs/Phase1Complete/VM_Start_Shutdown.md`
- **Changes:** Added comprehensive troubleshooting section covering:
  - Network adapter IP misconfiguration fixes
  - SSH service startup procedures
  - UFW firewall rules
  - Complete diagnostic checklist
  - Emergency recovery procedures

### Claude Code Configuration
**File:** `.claude/settings.json`
- ✅ SSH permissions configured (allow ssh/scp without prompts)
- ✅ SSH config pre-configured with `pacsvm` host alias
- ✅ SSH key path stored in env variables
- ✅ Ready for remote VM management via Claude

### Key Commands Reference
```powershell
# Test connectivity
Test-NetConnection 192.168.1.10 -Port 22

# Connect via SSH
ssh pacsvm

# Start VM
Start-VM -Name PacsVM

# Check adapter IP
Get-NetIPAddress | Where-Object {$_.InterfaceAlias -like "*ImmichSwitch*"}
```
