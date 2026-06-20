---
name: project-demo-link
description: Marketing demo links — two permanent tokens: anonymized AYESHA AKTER (Demo Link, ADR 0009) and consent-backed Abdur Gofur (Consent Demo Link, ADR 0010).
metadata: 
  node_type: memory
  type: project
  originSessionId: ec1144fa-69a4-44d5-8332-54917f2533fe
---

## Consent Demo Link (Abdur Gofur) — LIVE as of 2026-06-16

**URL:** `https://pacs.dhsolutions.com.bd/open?token=50046f87-5c13-4716-a048-7cac9f386410`

**Patient:** `AB. GOFUR  -65 YRS`, Male — DHP-26061304, SITE03 (Cumilla Medical College Hospital)
**Study:** L/SPINE MRI, 2026-06-10, 31 series. Unmodified production study (no anonymization).
**Consent:** Patient Abdur Gofur gave explicit consent to use study on marketing website. Documented in ADR 0010.

**How to apply:** Do NOT revoke without confirming patient has withdrawn consent. If consent is withdrawn, revoke immediately — no Purge needed. See ADR 0010.

---

## Demo Link (AYESHA AKTER) — LIVE as of 2026-06-16

**URL:** `https://pacs.dhsolutions.com.bd/open?token=34e5f845-800d-4d92-821c-2cbedbc90d34`

**Why:** Shows the exact patient viewer experience (direct token link, no login, single study) for marketing website visitors. See ADR 0009 for rationale.

**How to apply:** If anyone asks for the marketing demo URL, this is it. Do NOT revoke or schedule this link — it is a permanent marketing asset. Only the admin can revoke it intentionally.

---

## What was done

- Source: AYESHA AKTER MR lumbar spine study (`1.3.12.2.1107.5.2.51.184143.30000026050406580017300000015`)
- Orthanc `/modify` called → new study `1.2.276.0.7230010.3.1.2.1630613554.1.1781601502.324929`
- PatientName replaced with `DH PACS DEMO`; PatientID (`E1027809`), BirthDate (`20010504`), Sex (`F`) preserved
- Original AYESHA AKTER study untouched in Orthanc
- Backend registered under `siteId = DH_PACS_DEMO` (appears as unregistered site in admin panel)
- Two permanent links exist for this study (second auto-minted by Lua hook); both are valid, use the first

## Orthanc IDs (for reference)
- Original study Orthanc ID: `e299dce2-daa49973-50af6da1-de9945e7-15990aba`
- Demo study Orthanc ID: `80636c61-ce5f1f32-fcc49a23-2eb3e784-5ac560c3`

## Revocation
If the demo needs to be taken down: Admin Panel → Links → revoke token `34e5f845-800d-4d92-821c-2cbedbc90d34`. The demo study in Orthanc can be purged separately if desired.
