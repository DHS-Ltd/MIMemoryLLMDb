---
name: Business Model & Architecture
description: Core business model, data flow, and architectural decisions for the DICOM teleradiology platform
type: project
originSessionId: 153ccd2f-a8df-44cd-93d8-b2c6f901058b
aliases: [Business Model & Architecture, project-business-model]
---
> ## ⚠ BANNED FRAMING in the description above; business model superseded
>
> The frontmatter calls this a **"DICOM teleradiology platform."** *Never teleradiology* is a
> standing hard line in the DH PACS brand voice — DH PACS does not compete with reporting services
> and the hospital's radiologist workflow is untouched.
>
> The business model below ("patients can't access their data") was superseded on 2026-08-03: the
> category is the **Advanced Connected Imaging Network**, patient access is the *mechanism* rather
> than the claim, and DHS sells to the **surgeon's** need for post-processed studies.
>
> **The technical description below remains accurate** — data flow, Orthanc-per-site, Tailscale
> tunnel. Only the framing is superseded.
>
> **Authority:** `E:\DHS-PACS\CONTEXT-MAP.md`. Current position: `org/north-star.md` (ADR-0006).

---

**Business model:** Break the barrier where local Orthanc PACS holds patient data — radiologists view but patients can't access. Central server provides patient-facing viewable links.

**Data flow:**
1. CT/MRI scan in hospital → Tech sends to Local Orthanc (workstation, commercially running, radiologists use it)
2. Local Orthanc forwards study to Central Server (this machine) via secure tunnel
3. Central Server stores DICOM, generates viewable patient link
4. User's separate frontend (already built, has patient DB) ingests the link from our API
5. User's frontend distributes link to patients via their multiple gateways (SMS/email/etc.)
6. Patient opens link on any device, views in browser via OHIF — no app install

**Local PACS at workstations:**
- Windows 10/11 PCs
- DECISION: Deploy fresh open-source vanilla Orthanc at each site (NOT integrate with existing commercial PACS)
- Reason: User wants total control because lots of future modifications anticipated
- Existing commercial PACS may stay alongside (radiologist's choice) — out of our scope

**Connectivity (revised, multi-site):**
- Channel 1 — Tailscale VPN: Local Orthanc → Central Orthanc (study transfer, supports 2GB+ files, no Cloudflare upload limit)
- Channel 2 — Cloudflare Tunnel: Patient browser → Central OHIF Viewer (public HTTPS, no app)

**Server is co-hosted:**
- pacs.dhsolutions.com.bd → DICOM viewer (this project)
- erp.dhsolutions.com.bd (or similar) → ERP (small data, same server, different subdomain)
- Both share single Cloudflare tunnel via subdomain routing

**Subscription model (must be built into foundation from day 1):**
- Per-patient subscription state: active, expired, deceased
- Per-study retention: configurable expiration
- Programmatic data discard when subscription ends or patient deceased
- Build now: schema fields + delete API; activate later: billing UI + cleanup job
- Why: user wants to monetize via subscriptions later, but data must already be tagged correctly when launched

**Operations:**
- Manual link generation/management initially (manpower available at sites)
- Automation phase later

**Frontend integration (user's existing patient-facing system, also being rebuilt with full control):**
- Primary: polling API — frontend GETs `/api/v1/studies?since=<ts>` to fetch new studies
- Secondary: webhook (build alongside, optional to use)
- Both sides have full design freedom — adjust contract as needed

**Patient ID model (initial):**
- Composite key: (site_id, external_patient_id) — each site assigns its own patient IDs
- Schema includes optional `global_patient_id` field for future cross-site mapping (national ID, phone, or user's own ID)
- Add global resolver later without schema migration breaking anything

**Internet speed:** Not a barrier, can be upgraded as needed.

**Why:** This is a 2-year-developed teleradiology business filling the gap between hospital PACS (radiologist-only) and patient-accessible imaging.
**How to apply:** All design decisions must support: (a) non-disruptive integration with existing local Orthanc, (b) subscription-aware data lifecycle, (c) external frontend ingesting links via API, (d) multi-site scalability.
