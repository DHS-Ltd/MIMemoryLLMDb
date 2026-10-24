---
name: mobile-remote-operations
description: "Architecture and operational guide for machineA remote operations over Tailscale SSH"
metadata:
  node_type: memory
  type: reference
  modified: 2026-10-24T16:10:00.000Z
aliases: [mobile_remote_operations]
---

# Mobile Remote Operations (`mobile-ops/`)

The infrastructure enabling secure, low-friction control of `machineA` from a mobile phone (Termux) over Tailscale SSH.

## Architecture

- **Transport**: Tailscale encrypted mesh network (Tailnet).
- **Authentication**: Ed25519 public key in `~/.ssh/authorized_keys` on `machineA`.
- **Auto-Launch Entrypoint**: PowerShell profile on `machineA` routes non-interactive SSH or Termux logins to `mobile-ops/operator-menu.ps1`.
- **Declarative Action Registry (`actions.json`)**: Configures numbered menu choices (1-5, 0) without hardcoded shell switches.
- **Dual Launch Model (ADR-0002)**:
  - Invokes `antigravity.cmd -r <target_folder>` to set the workspace inside Antigravity IDE on `machineA`.
  - Concurrently runs the interactive agent harness in the Termux terminal anchored to that folder.
- **Workspace Guardrails**:
  - Restricts execution to development drives (`D:\`, `E:\`).
  - Blocks sensitive roots (`C:\Windows`, `C:\Program Files`) and PHI directories (`DHPacs`, `Orthanc_Configuration`, `Pranto_DICOM_Data_*`).
