---
name: project-dhs-pacs-viewer
description: "DH Solutions runs a patient-facing OHIF DICOM viewer at pacs.dhsolutions.com.bd/viewer; customization has four goals — branding, simplified patient UI, mobile-first layout, new features"
metadata: 
  node_type: memory
  type: project
  originSessionId: 166f59ff-4dd5-4370-91b6-893b33f68d3c
---

DH Solutions (DHS, Bangladesh) operates a PACS at `pacs.dhsolutions.com.bd`. Patients receive bearer-token links (`/open?token=...`) that resolve to a study and load it in the OHIF v3 viewer. This is the **standalone OHIF SPA**, not Orthanc's Stone Web Viewer — Orthanc only exposes the DICOMweb API.

The customization scope (confirmed 2026-05-19) has four goals, all in scope:

1. **Branding** — hospital logo, brand colors, fonts, custom loading screen
2. **Simplified patient UI** — hide measurement/annotation tools, slim toolbar
3. **Mobile-first layout** — bottom tabs, swipe series nav, touch-optimized, single-handed use (patients mostly open links on phones)
4. **New features** — patient info card, share-link button (WhatsApp/SMS), report panel (PDF/text)

**Why:** the audience is patients on phones, not clinicians on workstations — measurement tooling and the desktop-grid layout are at best irrelevant and at worst confusing. Mobile UX is the dominant constraint because of the patient base in Bangladesh accessing on Android phones.

**How to apply:** when scoping any UI change, default to "is this useful for a patient on a phone?" If a feature is clinician-only (measurement, annotation, multi-monitor), assume it should be hidden, not refined. When [[project-phase-c-blockers]] open questions surface, the answers should favor patient privacy and mobile bandwidth over clinical completeness.
