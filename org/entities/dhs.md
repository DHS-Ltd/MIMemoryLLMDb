<!-- BRAIN LAYER | org/entities/dhs.md | Entity: DHS (parent). Cites; does not assert (ADR-0006). -->

# Entity: DH Solutions Ltd (DHS)

| Field | Value |
|-------|-------|
| Type | Entity (parent company) |
| Market | Bangladesh medical imaging |
| Owns | BDC (Baroicha Diagnostic Center Ltd) — 100% |
| **Pillars** | **Build ⭐** · Supply · Service · Facility |
| Brand architecture | Endorsed House — DHS is the master brand; products are named sub-brands |
| Contact | directhospitalsolutionsltd@gmail.com |

> Rebuilt 2026-08-09. The previous version listed three *activities* (Software SaaS ·
> Diagnostic-Centre · Equipment supply) and named "first external sale to Ibn Sina by July 2026" as
> the current focus. Both are superseded — see `../business.md` §3 and `../north-star.md`.

## What DHS is

A healthcare company building for **the surgeon** — the one customer none of Bangladesh's ~30
radiology-reporting companies serve. The radiologist writes the report; the surgeon treats the
patient and needs the study post-processed for a specific finding, which they cannot produce
themselves. [S2 §1]

Mission, vision, USP and the relationships-first differentiators carry forward from
`DHS Business_Initial_Plan.md`, marked HISTORIC as brand doctrine on 2026-08-03 but still valid as
the record of the company's origin. [S2 §13]

## Pillars

### Build ⭐ — the prime pillar
DH-produced software, in-house and revenue-generating.

| Product | Engineering repos | Registry |
|---------|-------------------|----------|
| **DH PACS** (flagship) | `E:\DHS-PACS` (also the Commercial Hub), `dh-pacs-website`, `E:\DHPacs` | MIMP-004 ⚠ path broken, MIMP-006, MIMP-007 |
| **DHV** (DH Viewer) | OHIF web track; `E:\DHV-Weasis` desktop track | MIMP-005 (web only) |
| **DHDicomAnalyzerPro** | `E:\DH-Advanced-Viewer` (3D Slicer) | **unregistered** |

Internal tooling, not products: ImageConverter (MIMP-001), MIMemoryLLMDb/mimp (MIMP-002).

### Supply — medical equipment & accessories
A pillar in its own right. **Not** the destination of a trust flywheel — that framing is retired.

### Service — installation, maintenance & training
Previously mis-filed as a customer benefit rather than a pillar. [S1]

### Facility — the BDC diagnostic centre
Operated through the wholly-owned subsidiary (see `bdc.md`). Runs on HMS (MIMP-003).
🚫 **Banned from all Commercial Content.** [S1] This is a reversal: the June brain treated BDC as the
proof/credibility engine backing PACS sales.

## Accounts (not entities, not nodes)

Held as records in the CRM (`E:\DHS-PACS\docs\CRM\CONTEXT.md`), cited here only as proof points:

- **Ibn Sina** — live Enterprise deployment since Feb 2026. Proves **Enterprise Tier only**.
- **Cumilla** — Standard Tier, connected but commercially weak. Proves **Standard Tier only**.
- **Popular Diagnostic** — proposal issued 2026-07-03; outcome unrecorded.

🚫 Tier-matched proof: never crossed. `master proof point` is a banned term. [S1]

## Linked nodes

- Owns → `bdc.md`
- Projects → MIMP-001 … MIMP-007 (plus ~13 unregistered repos — see `../relationships.md` §5)
- Chain, tiers, revenue lines → `../business.md`
- Current position and open risks → `../north-star.md`

## Sources

S1 `E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-06) · S2 `E:\DHS-PACS\docs\MarketingStrategy\DHS_BRAND_STRATEGY.md` (2026-08-03)
