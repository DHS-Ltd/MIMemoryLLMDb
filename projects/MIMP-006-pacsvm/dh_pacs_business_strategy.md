---
name: dh-pacs-business-strategy
description: "Durable DH PACS product positioning, pricing model structure, HIPAA phrasing rule, sales chain, and brand voice hard lines — pulled from MIMP-004 on 2026-06-17"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4a1b770e-8ea6-4b4c-a188-2bed29f37d05
---

Pulled from [[reference_mimp004_business_memory]] (MIMP-004) because it directly shapes how to talk about this platform's "front side" (marketing site, sales material, demo framing).

**Product positioning — do not misrepresent:**
DH PACS is NOT teleradiology or remote reporting. The hospital's existing radiologist/PACS workflow is untouched. DH PACS merges the DICOM images it already receives centrally (this repo) with the hospital's written report into one patient-owned record, delivered via shareable link. The pitch is "patient data ownership," a new market category in Bangladesh — never frame it as competing with reporting services.

**Pricing model structure (exact numbers NOT finalized — don't fabricate):**
1. Installation: free (removes hospital capex/committee friction)
2. Per-patient link generation: charged (revenue aligns with hospital volume; anchor against current film cost ~৳150–300/study)
3. Patient Data Agreement: hospital shares patient data access with DHS, framed as relieving the hospital of long-term data-restoration burden — also seeds a future direct-to-patient (B2C) channel
White-label (hospital's own branding instead of DH PACS) carries a pricing premium.

**HIPAA phrasing rule:** Say "built to HIPAA standards" (true — stack is compliant) — never "HIPAA certified" (company-level cert not yet done). Bangladesh hospitals treat HIPAA as the aspirational benchmark even though it isn't legally mandated there.

**Three-layer sales chain (don't skip layers):** IT (technical fit: Tailscale, zero firewall changes, existing PACS untouched) → Management (business case: Ibn Sina proof point, per-patient vs film cost, zero disruption) → Radiologists/Surgeons (live demo, full DICOM quality on phone, report travels with images). IT validates before Management approves; clinical demo before signing.

**Brand voice hard lines** (full profile at `E:\DHS-PACS\docs\DH_PACS_BRAND_VOICE.md`): never teleradiology language, never quote exact pricing, never mention BDC or the fitness-tracker side project, ৳14.6B figure always sourced (NBR import data, HS code 3701.10 — exact year still needs verifying), "built to HIPAA standards" not "certified," free installation mentioned before any fee. Tone: calm, number-led, system-is-the-villain-never-the-hospital, leapfrog/pride national framing (not "Bangladesh is behind").

**Why:** These decisions came out of correcting an early misframing of DH PACS as teleradiology, plus a dedicated 2026-05-29 strategy session. They apply to any marketing copy, demo script, or outreach material referencing this platform, even though the actual website build now lives outside this repo.

**How to apply:** Before writing or reviewing any customer-facing copy (website, demo walkthrough, sales deck, WhatsApp/email outreach) that touches this PACS platform, check these constraints first. If asked for exact pricing, redirect to "pending a dedicated pricing session" rather than guessing.
