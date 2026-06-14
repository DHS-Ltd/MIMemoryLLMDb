---
name: Server Hardware & Network Info
description: Physical server specs, network topology, existing services, and connectivity plan for the DICOM project
type: project
originSessionId: 153ccd2f-a8df-44cd-93d8-b2c6f901058b
---
Server is an on-premise Windows Server 2022 Standard (not Ubuntu as CLAUDE.md assumed).

**Hardware:**
- OS: Windows Server 2022 Standard (10.0.20348), 64-bit
- RAM: **31.88 GB installed** (corrected 2026-06-09 — earlier "~16 GB" was wrong)
- CPU: 4 logical cores
- Storage: DELL PERC H755 RAID ~4TB total — C: 816 GB free, D: 211 GB free

**Hyper-V memory (live 2026-06-09, both VMs use Dynamic Memory):**
- PacsVM: assigned ~5 GB, demand ~4.3 GB, Min 2 / Startup 4 / **Max 12 GB**. Guest (Ubuntu) sees ~5.1 GB, ~4.2 GB free — not memory-pressured. Disk: 590 GB vol, 39 GB used (7%).
- ImmichVM: assigned ~4.2 GB, Min 2 / Startup 6 / Max 10 GB.
- Safe budget: 32 GB − ~6 GB (Windows parent + IIS + VMware) = ~26 GB for guests. Current Max ceilings sum to 22 GB. PacsVM Max can safely rise to ~16 GB (16+10=26).

**Network:**
- Physical NIC: "Hospital" adapter (Broadcom NetXtreme), MAC B8:CB:29:FA:C4:5B
- Server LAN IP: 192.168.1.6/24 (via Hyper-V external switch "ImmichSwitch")
- Default gateway (router): 192.168.1.1
- Public WAN IP: 182.52.151.108 — DYNAMIC (ISP does not provide static IP)
- Office router is on-premise, user has access to it

**Domain:**
- Primary: dhsolutions.com.bd (registrar unknown)
- PACS subdomain: pacs.dhsolutions.com.bd
- Connectivity: Cloudflare Tunnel (no static IP or port forwarding needed)

**Max patient study size: 2GB** — individual WADO-RS requests are small (per frame), so Cloudflare free tier is fine for viewer access.

**Existing services on Windows host:**
- IIS (Web Server) running on ports 80 and 8088 (System/kernel)
- VMware-hostd on port 443
- VMware Workstation 11 installed
- Hyper-V enabled with running VM: ImmichVM (4.4 GB RAM, on ImmichSwitch external switch)

**Deployment plan:**
- Create new Ubuntu 22.04 Hyper-V VM (static LAN IP e.g. 192.168.1.10) on ImmichSwitch
- VM runs full Docker Compose stack: Orthanc, MinIO, PostgreSQL, OHIF, Nginx
- Patient access: pacs.dhsolutions.com.bd → Cloudflare Tunnel → Ubuntu VM:443
- DICOM ingestion: Hospital LAN only → Ubuntu VM:4242 (no internet exposure needed)
- No port forwarding required (Cloudflare Tunnel handles public access)

**Why:** Dynamic IP makes port forwarding unreliable. Cloudflare Tunnel solves this without static IP or router changes. DICOM C-STORE stays on LAN between hospital systems.
**How to apply:** All setup steps target the Ubuntu VM. Cloudflare tunnel replaces Nginx SSL on the internet-facing side.
