---
name: dh-pacs-pricing
description: "DH PACS pricing model — free installation, per-patient link charge, patient data agreement, and the future B2C channel it enables. Exact per-patient numbers not yet finalized."
metadata: 
  node_type: memory
  type: project
  originSessionId: da756dae-fcc1-41f9-b54e-e0c23d99ce97
---

> ## ⚠ SUPERSEDED — do not use for customer-facing work
>
> **Superseded.** Pricing is now **two tiers and two revenue lines**: Standard (free install, per-patient billing) and Enterprise (licensed, charged, on-prem). Free installation is a **Standard-tier term only** — Ibn Sina bought workstation licences at ~300k BDT/unit.
>
> Line 1 = per-patient link enrolment. Line 2 = the **Advanced Post-Processing licence**, which is the current north star: sell one by 2026-10-10.
>
> **Authority:** `E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-03). Current position:
> MIMemoryLLMDb `org/north-star.md`. Retained rather than deleted so stale copies stay
> traceable (ADR-0006).

---

The DH PACS pricing model has three components. This is a core part of the business architecture, not just a commercial decision.

**Component 1 — Installation: Free (STANDARD small-tier model ONLY)**
DH Solutions handles the full DHV Workstation installation and configuration on-site at no charge. This removes the largest procurement barrier in Bangladesh hospital buying: the capital expenditure approval process. Free installation means no committee, no budget cycle, no delay.
> ⚠️ SCOPE: "Free installation" applies to the **standard small-tier hospital model** (e.g. Cumilla). It does **NOT** apply to the **Ibn Sina enterprise deal**, where installation is **charged**. See [[dh-pacs-ibnsina-commercial-posture]].

**Component 2 — Per-patient link generation: Charged**
A charge occurs for every patient link generated — i.e., every time a complete patient record (images + report) is packaged and delivered. The hospital pays only when value is delivered. This aligns DHS revenue with hospital patient volume.
- Exact per-patient fee: NOT YET FINALIZED. User has handwritten pricing notes in a physical notebook. This will be discussed and decided together in a future session. Do not guess or fabricate numbers.
- Anchoring strategy: compare per-patient fee against current film printing cost per study (~৳150–300 depending on modality). Goal is cost-neutral or cost-reducing for the hospital while delivering dramatically better patient outcome.

**Component 3 — Patient Data Agreement**
As part of the service agreement, the hospital shares patient data access with DH Solutions. This enables:
1. Patient-initiated data restoration (if a patient loses their link, DH Solutions can restore access)
2. Future direct patient services from DHS (B2C channel — see below)
How to frame this to hospitals: position as relieving the hospital of long-term patient data restoration burden, not as a data-sharing arrangement.

**The future B2C channel:**
Every hospital onboarded builds DHS's direct patient data relationship. As patient volume grows across connected hospitals, DHS can market services directly to patients (data restoration, follow-up services, specialist referrals). This is a second revenue stream that is not yet active — it depends first on building the hospital base. Every hospital sale today is also an investment in this future channel.

**White-label pricing:**
White-label agreements (hospital branding on patient links) should carry a premium over standard per-patient pricing — either higher per-patient fee or an additional monthly platform fee.

**Why:** Pricing model structure was clarified from the user's handwritten notes (29.05.26). The free installation + per-patient model is fundamental to how hospitals are approached and how DHS presents its commercial offer. Numbers are pending a dedicated pricing session.

**How to apply:** Always present "installation is free" before mentioning any per-patient fee. Never reveal exact per-patient pricing before understanding the hospital's patient volume — calculate the right number for their scale first. When asked to help finalize pricing, prompt the user to share the notebook notes.
