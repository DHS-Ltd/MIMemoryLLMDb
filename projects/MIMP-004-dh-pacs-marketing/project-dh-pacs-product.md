---
name: dh-pacs-product
description: "DH PACS product architecture, what it does, and its correct market positioning as a new patient data ownership category — not teleradiology"
metadata: 
  node_type: memory
  type: project
  originSessionId: da756dae-fcc1-41f9-b54e-e0c23d99ce97
---

DH PACS is a cloud DICOM imaging platform built for Bangladesh hospitals. The product is already built and deployed.

**Company vs Product:**
- Company: DH Solutions Ltd (DHS) — legal entity, invoices, email
- Product: DH PACS — what to say in every headline and conversation
- Domain: dhsolutions.com.bd

**DH Solutions Ltd second business line — Theranostics:**
- Regional Partner for MED I Thailand (theranostics solutions provider)
- Working to introduce advanced theranostics to Bangladesh — not yet live
- In personal brand content: mention briefly only; do not elaborate until the service is live in Bangladesh
- In company/product copy: keep open as a future direction; do not present as a current deployed service

**How it works technically:**
1. A DHV Workstation (hardware node) is installed at the hospital alongside existing CT/MRI and existing PACS — installation is free, zero disruption
2. DHV Workstation connects to the cloud via Tailscale VPN — encrypted, no firewall changes, no static IP, no port forwarding
3. When a scan completes, the DICOM study is forwarded to the central cloud server
4. DH PACS also collects the written radiology report from the hospital's existing system
5. Both are merged into one complete patient record and delivered via a unique secure link
6. Patient (or any doctor they share with) opens the link on any device — no app, no account, no registration needed
7. Full OHIF DICOM viewer renders the images (windowing, measurements, zoom — full clinical quality)

**CRITICAL market positioning — do not misrepresent this:**
DH PACS is NOT a teleradiology or remote reporting company. It does NOT compete with existing radiology reporting companies in Bangladesh. It is creating a new market segment that does not currently exist: **the patient as complete owner of their own imaging record**.

The hospital's existing radiologist continues reporting as normal. The existing PACS runs as normal. DH PACS simply takes what the hospital already produces — DICOM images AND the written report — and delivers the complete package to the patient permanently.

**The complete patient record:**
- DICOM images from the scanner (full quality, not compressed)
- Written radiology report from the hospital's existing system
- Merged into one patient-owned digital record
- Accessible on any device, shareable globally via WhatsApp, forever
- No other hospital service in Bangladesh currently provides this

**Current traction:**
- 7 DHV Workstations deployed across 5 Ibn Sina Hospital centers
- 2 units sold January 2026
- 3 more confirmed Ibn Sina orders expected Q1-2026 (~৳900,000 revenue)
- Target: 5 more hospitals Q2-Q3 2026
- Marketing partner: Digitafy (Facebook/social awareness campaigns)

**White-label option:**
Hospitals that want patient links and branding to carry the hospital's own identity (not DH PACS branding) can be accommodated. White-label carries a higher per-patient fee or monthly platform fee.

**Demo portal:**
Being built in a separate system, will connect to the website when ready. Will include a live OHIF viewer instance with a pre-loaded demo case and step-by-step walkthrough overlay.

**Why:** Knowing the correct product positioning is essential — in early sessions it was incorrectly framed as a remote reporting tool. This is wrong and misleads hospitals about what they are buying. DH PACS is a patient data ownership and delivery platform.

**How to apply:** In any conversation about what DH PACS does, always emphasize: (1) hospital workflow unchanged, (2) complete patient record = images + report together, (3) new category that does not exist in Bangladesh yet.
