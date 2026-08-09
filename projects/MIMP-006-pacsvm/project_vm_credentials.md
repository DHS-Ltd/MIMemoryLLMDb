---
name: PacsVM Credentials & Access
description: Login credentials and access info for the central Ubuntu PACS VM
type: project
originSessionId: 153ccd2f-a8df-44cd-93d8-b2c6f901058b
aliases: [PacsVM Credentials & Access, project-vm-credentials]
---
**PacsVM (central server, Hyper-V on Windows host):**
- Hyper-V VM name: PacsVM
- OS hostname inside Ubuntu: `dhserver` (chosen during install — for "DH Solutions Server")
- OS: Ubuntu Server 22.04.5 LTS
- LAN IP: 192.168.1.10 (static, configured during install)
- Username: maidul
- Password: (user holds it — never store in memory)
- SSH: OpenSSH installed during Ubuntu setup
- Access from Windows host: `ssh pacsvm` (alias) or `ssh maidul@192.168.1.10`
- SSH key: `C:\Users\Administrator\.ssh\pacsvm_ed25519` (private), `.pub` for public

**Tailnet (Tailscale mesh):**
- pacs-central (this VM): `100.118.47.99`
- win-2g5v0o0aebu (Windows host server): `100.100.152.109`
- Future local workstations join this tailnet and push DICOM to `100.118.47.99:4242` (Orthanc)
- Tailnet account: directhospitalsolutionsltd@gmail.com

**Sudoers:** `/etc/sudoers.d/maidul-nopasswd` — `maidul ALL=(ALL) NOPASSWD: ALL`

**Cloudflare Tunnel:**
- Tunnel name: `pacs-tunnel`
- Tunnel UUID: `7872f57f-7111-4ffd-aa31-d23de67493f7`
- Credentials JSON: `/home/maidul/.cloudflared/7872f57f-7111-4ffd-aa31-d23de67493f7.json`
- Origin cert: `/home/maidul/.cloudflared/cert.pem`
- Existing unrelated tunnel `dhs-desktop` — DO NOT TOUCH (used elsewhere by user)
- DNS routes for pacs/api/erp.dhsolutions.com.bd: NOT configured yet (deferred to Step 3 when services exist)
- systemd service: NOT installed yet (deferred to Step 3)

**Why:** Multi-step project requires consistent username across all configs, scripts, and documentation.
**How to apply:** Use `maidul` as the SSH username in all subsequent commands, Docker file ownership, systemd unit files, and documentation. Do not assume `ubuntu` or `pacs`.
