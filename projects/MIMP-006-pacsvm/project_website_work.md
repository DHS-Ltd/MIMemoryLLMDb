---
name: project-website-work
description: "Website planning and documentation work completed 2026-05-29 — content blueprint, demo portal build guide, key business facts (Ibn Sina, film market)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 175a2653-6aad-43fe-a244-c566d81e2f17
---

## Website Documentation — COMPLETE (2026-05-29)

Two documents created in `D:\Pacs_Viewer_Storage_Project\docs\Website\`:

| File | Purpose |
|---|---|
| `DH_PACS_WEBSITE_CONTENT_BLUEPRINT.md` | Full content guide for dhsolutions.com.bd marketing site |
| `DH_PACS_DEMO_PORTAL_BUILD_GUIDE.md` | End-to-end build instructions for interactive demo at pacs.dhsolutions.com.bd/demo |

## Key Business Facts Established This Session

**Brand naming decision:**
- Company: **DH Solutions** (legal entity, footer, email)
- Product: **DH PACS** (use in all headlines and product references)
- "mRayImaging BD" was an internal pitch doc name — NOT used publicly

**Key client — Ibn Sina Hospital:**
- 7 DHV Workstations supplied
- 5 centers connected across Bangladesh
- Ibn Sina is a well-known chain hospital — use as primary social proof
- Confirm public naming permission before publishing on website
- Fallback if no permission: "5 centers of a leading Dhaka-based hospital chain"

**Market context:**
- Bangladesh medical film market: ৳14,607,300,000 per year (৳14.6 billion)
- Source: mRayImaging BD value proposition PDF (`docs/Website/Value_proposition_mRayImaging_BD.pdf`)
- Use this figure in hero headline and market vision section

## Website Strategy Decisions

- **Domain:** `dhsolutions.com.bd` (separate from pacs subdomain)
- **Audience:** B2B — hospital/diagnostic center decision-makers (primary), radiologists, surgeons (secondary)
- **CTA:** Request a Demo / Contact sales (no public pricing)
- **Language:** English only
- **Stack:** Static HTML + Tailwind CSS
- **Tone:** Specific numbers and named institutions — no vague claims

## Demo Portal — LIVE ✅ (2026-05-30)

- **Gateway page:** `https://pacs.dhsolutions.com.bd/demo` — working, branded, verified in browser
- **Viewer:** `https://pacs.dhsolutions.com.bd/demo-viewer/` — working, DHS-branded OHIF with CloudFront study list
- **Data source:** OHIF public CloudFront CDN (`d14fa38qiwhyfd.cloudfront.net/dicomweb`) — no production patient data
- **Status:** FULLY DEPLOYED AND VERIFIED. Gateway page and viewer both confirmed working in browser.

**Why:**
Hospital administrators will not request a sales demo without first seeing the product work. The demo portal closes the conversion gap between "interested" and "ready to talk."

See [[project-demo-portal-live]] for full technical implementation details (files, nginx config, deploy workflow, the sub_filter fix).
