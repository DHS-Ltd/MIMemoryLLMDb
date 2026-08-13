---
name: ibn-sina-cancer-pacs-system
description: "Ibn Sina Cancer PACS System — proposed federated multi-site PACS (central index, distributed per-site storage) being designed as a USP for Ibn Sina. Design phase, started 2026-06-20."
metadata: 
  node_type: memory
  type: project
  originSessionId: b4a1a88a-0ab0-4252-ab44-cb471afc59b4
---

# Ibn Sina Cancer PACS System (design phase — started 2026-06-20)

A **new, separate infrastructure** being designed for **Ibn Sina** (large hospital/cancer chain) — distinct from the current DH PACS Central single-server architecture. DH already has a workstation installed at Ibn Sina and has been **offered the chance to present the full PACS system**; this federated design is the pitch.

## Core architecture (confirmed so far)

- **No central data server.** Unlike DH PACS Central, there is NO central Orthanc/MinIO holding all pixels.
- **Distributed storage:** each **site (center) runs its own full stack** ("complete copy of this system") and stores its own DICOM pixel data locally.
- **Central Patient Directory (index only):** one lightweight central service holds only a patient/study → owning-site mapping (a phone-book / locator). Kilobytes per study, no pixels. The user's phrase "central data storage queue" = this directory (reading confirmed 2026-06-20).
- **Local read = local transfer:** a DHV viewer client physically at a site fetches that site's data locally (fast, no WAN).
- **Remote read = routed to the "matched server":** if the client is outside the owning site, the request resolves via the directory to the site that owns the data and is fetched from there.
- **Peer mesh:** site servers communicate with each other to serve requested patient data.
- **Upgradable to a cloud network** across the Ibn Sina network later (explicit future path, not v1).

## Business positioning (the USP)

**Modular investment as data grows** vs. one-time huge upfront investment. Ibn Sina does not pre-fund a large central server; they **add a server per site as that site's demand requires it.** Capacity scales with adoption. This is the headline selling point for the Ibn Sina pitch.

## Design grilled out 2026-06-20 — decisions locked

Full design lives in the repo (separate context from DH PACS Central):
- `docs/IbnSinaCancerPacs/ARCHITECTURE.md` — consolidated design
- `docs/IbnSinaCancerPacs/BUILD_PLAN.md` — phased build plan (Phase 0 confirmations+parameterize → 1 tracer 2-site remote read → 2 replicate → 3 patient plane → 4 browse/audit → 5 provisioning → 6 redundancy → 7 pilot). Critical path to demo = Phase 0→1→3.
- `docs/IbnSinaCancerPacs/SERVER_SPEC.md` — internal/technical Site Server spec
- `docs/IbnSinaCancerPacs/Ibn_Sina_PACS_Server_Procurement_Report.md` — **management-facing** build/procurement report for Ibn Sina (Dell turnkey + vendor-neutral component build, indicative budgetary costs, procurement checklist)
- `docs/IbnSinaCancerPacs/CONTEXT.md` — glossary (Site Server, Patient Directory, Owning Site, Enterprise Patient ID, Local/Remote read, branding)
- `docs/IbnSinaCancerPacs/adr/0001..0004` — federated mesh / two-plane exposure / single-codebase-flagged / DR posture

**Resolved:**
- Identity keyed on Ibn Sina HIS **Enterprise Patient ID** (unified chain-wide; they have a self-built HIS serving thousands).
- **Remote read = proxy-stream** WADO-RS over **Tailscale** (no copy left behind). [[feedback_ohif_orthanc_cloudflare_gotchas]]
- Patient Directory **replicated on every Site Server**; v1 = HQ (Dhanmondi) write-primary + read-replicas everywhere.
- **Both clinician + patient access day one.** Public = **per-site Cloudflare tunnels**, patient single-study Links stream **direct from Owning Site**. Clinician = Local read (LAN) or Remote read (mesh).
- Clinician access **v1 org-wide, both-ends audited**; care-relationship scoping = Phase 2.
- **Self-registration** of new Site Servers is first-class (the USP's operational backbone).
- **One codebase, `FEDERATED_MODE` flag** — NOT a fork (ADR 0003). Mesh is resellable.
- Branding per-deployment config: front = Ibn Sina, admin/login = subtle DH; **DHV viewer keeps DHV identity + adds Ibn Sina logo (co-branded), NOT replaced.**
- Redundancy: **L1 RAID+local backup mandatory**, L2 peer DR-buddy designed-in optional, L3 cloud future.
- **Repo boundary (2026-06-21):** new `dh-pacs-ibnsina` repo = `pacs-directory` service + infra/provisioning (Ansible, Tailscale/Cloudflare per-site configs, server spec) + Ibn Sina branding bundle + support runbooks. Shared app (backend/admin/viewer/patient) STAYS in `dh-pacs-central` behind `FEDERATED_MODE` — NOT forked (ADR 0003 reaffirmed; Reading A). Mirrors workstation/doctor repo pattern.
- **DH Remote Support model (2026-06-21):** SSH-over-Tailscale to `dhs-ops` user for software; **Claude Code runs on DH engineer's laptop**, pulls logs/configs over SSH, applies fixes over SSH → **server needs ZERO outbound internet**. iDRAC Enterprise over Tailscale for hardware/OS rescue (console, power, virtual-media reinstall). Customer "DH access ON/OFF" + audit. No Google/Chrome Remote Desktop (iDRAC has its own browser console; server is headless).
- **Server spec COMPLETE (2026-06-21)** → `docs/IbnSinaCancerPacs/SERVER_SPEC.md`. Ibn Sina rate = **1 GB/study (1 TB per 1000 studies), ~11 studies/day, ~4 TB/yr → 5yr retention = ~20 TB pixels**. Standard Site Server = bare-metal Ubuntu+Docker on Dell PowerEdge 2U (≥12 LFF bays), 8C/16T + 64 GB ECC, RAID6 HDD bulk (start lean **~16 TB usable / 4×8TB**, grow in-place to ~80 TB) + NVMe RAID1 OS/DB/cache, PERC H755, redundant PSU, iDRAC Enterprise, dual 10 GbE. Variants: HQ step-up (12-16C/128GB/32TB), small-center tower, BYO-VM fallback. Site-readiness: ≥100 Mbps/center, ≥300-500 Mbps HQ; local reads LAN-only (internet-independent).

**Parked (decide later):**
- Q5 — do modalities embed Enterprise Patient ID via DMWL worklist? (impl-time; decides if HIS API is a v1 dependency)
- Q9 — DH's retained ops access + telemetry tier + DR-product terms → decided against Ibn Sina's **order terms** when the deal lands. DH requires full access to maintain the service.
- HIS↔Directory indexing API = separate design scope.

**Why/how to apply:** This deliberately removes the central data store the [[reference_multi_customer_scaling]] strategy doc assumed (Model C/E) — it's a federated mesh pushed further. Keep federation behind flags so DH PACS Central is unaffected. Pitch framing = modular per-site investment vs one-time central cost.
