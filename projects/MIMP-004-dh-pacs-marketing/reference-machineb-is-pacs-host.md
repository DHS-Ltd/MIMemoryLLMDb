---
name: reference-machineb-is-pacs-host
description: MachineB = MedIServer = WIN-2G5V0O0AEBU = the Hyper-V host running production PacsVM; why the Windows host losing internet does not take pacs.dhsolutions.com.bd down
metadata:
  node_type: memory
  type: reference
  originSessionId: d9a678ad-17d3-455b-9e9c-18fae5b762b1
  modified: 2026-10-03T17:09:28.907Z
---

**MachineB, MedIServer, `WIN-2G5V0O0AEBU` and "the Support PC / DHS build box" are one machine**: Windows Server 2022, user `Administrator`, repos on `D:\`, tailnet `100.100.152.109`, host LAN `192.168.1.6`. **Physically in Thailand** (office LAN, dynamic Thai IP, UTC+7 — dental ADR 0002, amended 2026-09-29). It also hosts **`DentalVM`** (Ibn Sina dental Dedicated Instance, interim, built 2026-09-29, LUKS data disk; LUKS header backup still sits on the host at `C:\ProgramData\DH\dentalvm-luks\`) and `ImmichVM` (personal). It is the **Hyper-V host for production `PacsVM`** (Ubuntu, hostname `dhserver`, LAN `192.168.1.10`, tailnet `pacs-central` `100.118.47.99`). This repo's sessions run on machineA (`Maidul_Desktop`), not MachineB — the user sometimes says "I'm on machineB" when they mean the PACS work.

**Patient traffic never touches the Windows host's network stack.** DNS for `pacs.dhsolutions.com.bd` resolves to Cloudflare anycast IPs. Cloudflare reaches the VM through the `pacs-cloudflared` container *inside* PacsVM, which dials out (no inbound port, so the dynamic WAN IP doesn't matter) → `pacs-nginx` → backend / Orthanc / OHIF. Host and VM are separate peers on the Hyper-V external switch `ImmichSwitch` (physical NIC "Hospital", Broadcom).

Failure map: host loses internet only → site stays up (observed 2026-10-03: `win-2g5v0o0aebu` offline 5h on tailnet, `pacs-central` online, `/api/health` 200). MachineB loses power, reboots, or Hyper-V stops → site down. Building cable/router/ISP down → site down (shared physical path).

Watch: if the host's vEthernet (ImmichSwitch) adapter takes `192.168.1.10`, it collides with the VM and *does* break the site — this happened once before (MIMP-006 `ssh_connection_setup_final.md`). Host should be `192.168.1.6`.

**Out-of-band path when MachineB's own network dies:** PacsVM sits on the same office LAN and is reachable from machineA over the tailnet (port 22, password auth, user holds the password; host key `SHA256:EMFttNuW+bZCMeaTZTk5lYJ8s/mcc3sQcP6F6mkDfqo`). From there MachineB's Windows answers SSH, RDP and WinRM on `192.168.1.6` — `ssh -J maidul@100.118.47.99 Administrator@192.168.1.6`. Proven 2026-10-03. No iDRAC answers on `192.168.1.0/24`. The 2026-10-03 outage was the host's gateway set to `192.168.1.0` with no DNS; detail in `E:\dh-pacs-infra\docs\MACHINEB_EXIT_PLAN.md`. MachineB's uplink runs at 100 Mbps.

Source: mmp-memory MIMP-006 (`project_server_info.md`, `project_vm_credentials.md`, `CLAUDE.md`), MIMP-002 machine table, MIMP-019 `dcm4chee_mwl_lab.md`. Related: [[project-demo-rig-machines]].

**Since 2026-10-04:** MachineA has passwordless aliases `ssh pacsvm` / `ssh machineb` / `ssh dentalvm` (key `machineb_admin_ed25519`, jump chain, DentalVM over LAN so it works while LUKS-locked). DH PACS dev now runs from `E:\dh-pacs-infra\repos\<github-name>`; status and remaining rescue in `E:\dh-pacs-infra\docs\RUNBOOK_DEV_MACHINE.md`. A MachineB reboot leaves DentalVM down until someone runs `ssh -t dentalvm sudo systemd-tty-ask-password-agent` — no alert exists (found 2026-10-04 after 8 h down). MED I Thailand website stays on MachineB permanently (infra D11).
