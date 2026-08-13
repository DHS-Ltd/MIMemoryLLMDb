---
name: feedback-new-customer-scoping
description: "Before scoping ANY new customer / hospital chain deployment for DH PACS, read MULTI_CUSTOMER_SCALING_ARCHITECTURE.md first and map their requirement to one of the five deployment models documented there."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7cc38ce3-362e-466c-b092-ca4c0575f554
---

Before proposing a deployment approach for any new DH PACS customer, **first read** `docs/researchDocs/MULTI_CUSTOMER_SCALING_ARCHITECTURE.md` and walk the user through the checklist in Part 8 of that document.

**Why:** On 2026-06-01 the user and I worked through the architectural decision framework for scaling DH PACS beyond the single DH-operated central server. We documented five deployment models (SaaS / DH-hosted dedicated / Customer-owned dedicated / White-label / Federated) mapped onto three sliders (hardware ownership, operational ownership, data residency). The user explicitly asked that this doc be the entry point for every future customer-scoping conversation so we don't re-derive the same framework or invent overlapping sixth models.

**How to apply:**
- Trigger when the user says any of: "a customer wants...", "new hospital chain asking for...", "how do we propose this to X", "deploying for someone else", or anything that implies a non-DH-operated deployment.
- First action: tell the user "Let me re-read the multi-customer scaling doc so I'm grounded in the framework" and read `D:\Pacs_Viewer_Storage_Project\docs\researchDocs\MULTI_CUSTOMER_SCALING_ARCHITECTURE.md`.
- Then walk the checklist in Part 8: map to three sliders → identify matching model (A/B/C/D/E) → check seven Ibn Sina failure modes against the new customer → confirm the four shipping prerequisites → propose.
- Default recommendation is Model C unless customer constraints push elsewhere — document why if they do.
- Do not invent a sixth model without re-reading Part 1 of the doc.

Related: [[project_business_model]], [[project_website_work]].
