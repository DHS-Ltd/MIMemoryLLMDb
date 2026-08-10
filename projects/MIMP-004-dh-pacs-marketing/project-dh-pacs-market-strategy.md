---
name: dh-pacs-market-strategy
description: "DH PACS go-to-market strategy — two angles, three-layer sales chain, and the patient data ownership differentiator that is absent in the Bangladesh market"
metadata: 
  node_type: memory
  type: project
  originSessionId: da756dae-fcc1-41f9-b54e-e0c23d99ce97
---

> ## ⚠ SUPERSEDED — do not use for customer-facing work
>
> **Superseded on every major point.** DHS serves the **surgeon, not the radiologist** — the radiologist is a *deliberate non-persona* (DHS-PACS ADR-0002, 2026-08-03).
>
> - "patient data ownership" differentiator → demoted to mechanism
>
> - "Ibn Sina as the master proof point" → **banned framing**; use tier-matched proof
>
> - three-layer sales chain → **Enterprise only**
>
> - The competitive set is not PACS vendors but the ~30 radiology-reporting companies; the argument is differentiation by *customer*, not by product.
>
> **Authority:** `E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-03). Current position:
> MIMemoryLLMDb `org/north-star.md`. Retained rather than deleted so stale copies stay
> traceable (ADR-0006).

---

**The core differentiator:**
Patient data ownership — giving patients their complete imaging record (DICOM images + written report, merged) — is currently absent in the Bangladesh medical imaging market. This is the sharpest competitive edge. No film, CD, USB, PACS, or reporting service does this.

**The two market angles:**

Angle 1 — Patient Data Ownership as Hospital Value-Add:
Use when the hospital wants to differentiate their patient experience. Core pitch: "Your hospital already produces the images and the report. We package both together and give them to the patient permanently. Your workflow doesn't change. Your patients leave with everything."
This is a new market category, not competition with existing services.

Angle 2 — Film Replacement:
Use when the hospital has heavy film printing costs or explicit budget pressure on consumables. Core pitch: "Film is a fixed cost that produces an inferior, static, unsharing artefact. DH PACS converts that spend into a per-patient variable cost that delivers a complete digital record instead."
Key stat: Bangladesh medical imaging film market is approximately ৳14.6 billion annually (source: NBR import data, HS code 3701.10 — user to verify exact figure before using on website).

Both angles converge on the same outcome: the patient owns their complete digital record, the hospital pays per patient rather than for film, DHS builds the patient data relationship for the future B2C channel.

**The three-layer sales chain:**

Layer 1 — Hospital IT (Requirement Finder):
Validates technical fit. What they need: specifics on Tailscale VPN (no firewall changes, no port forwarding), confirmation existing PACS is untouched, clarity on who handles installation and support (DHS does, not them). Speak technically and honestly. Do not oversell.

Layer 2 — Hospital Management (KOL):
Approves business case. What they need: Ibn Sina social proof first, the per-patient cost vs. current film spend calculation, the "zero disruption" guarantee, the patient experience differentiation story. Speak in business numbers and competitive positioning.

Layer 3 — Radiologists & Surgeons (End Users / Internal Advocates):
Use the product daily. Their buy-in makes adoption succeed; their resistance makes it fail regardless of management approval. What they need: a live demo with their own case types, seeing full DICOM quality on a phone, understanding that their report travels with the images to every doctor the patient ever sees. Speak clinically. Let them hold the phone.

**Do not skip layers.** IT validates before Management approves. Clinical demos happen before the agreement is signed.

**Ibn Sina as the master proof point:**
7 workstations, 5 centers. Use in every first conversation with every new hospital. This is the single most credible thing DHS can say. Treat the Ibn Sina relationship as a distribution channel — warm referrals from Ibn Sina contacts outperform all cold outreach.

**Why:** Established in conversations on 2026-05-29 based on user's handwritten product insights (DHS PACs marketing note self 29.05.26.pdf) and corrections to an initial guide that wrongly framed the product as a teleradiology/remote reporting tool.

**How to apply:** The two-angle framework should guide any sales conversation advice, website copy, or marketing material. The sales chain order is non-negotiable — don't recommend skipping IT validation to go straight to Management.
