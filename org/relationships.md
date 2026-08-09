<!-- BRAIN LAYER | org/relationships.md | Typed edges. Cites; does not assert (ADR-0006). -->

# DHS — Relationships (typed edges)

> Rebuilt **2026-08-09**. The 2026-06-02 edge set modelled a flywheel that no longer exists.
> Machine-readable form lives in `registry.json`; this file is the human-readable narrative.

## Edge types

**Retained:** `owns` · `runs-on` · `dogfooded-by` · `serves` · `depends-on`
**New:** `produces` · `fills-slot` · `succeeds` · `proves` · `refers-to` · `routes-commercial-content-to` · `holds-authority-over` · `excluded-from`
**Retired:** `builds-trust-toward` — the *SaaS → trust → equipment* flywheel is superseded by the four
Business Pillars, in which **Build is prime** rather than a stepping stone to Supply. [S1]
**Retired:** `markets` · `sold-to` — replaced by `proves` + tier, because who a thing was sold to is
only meaningful alongside **which tier** they bought (tier-matched proof). [S1]

## 1. Company → pillars → products

| From | Edge | To | Note |
|------|------|----|------|
| DHS | operates | Build ⭐, Supply, Service, Facility | Four Business Pillars, 2026-08-03 [S1] |
| DHS (Build) | produces | DH PACS, DHV, DHDicomAnalyzerPro | Endorsed House — sub-brands visibly inherit DHS [S1] |
| DHS | owns (100%) | BDC | Subsidiary; **is** the Facility pillar |
| BDC | **excluded-from** | Commercial Content | Active business, banned from all commercial material [S1] |
| BDC | runs-on | MIMP-003 (HMS) | Unchanged |
| MIMP-003 (HMS) | dogfooded-by | BDC | Unchanged — but now internal to Facility, **not** a commercial proof point |

## 2. The Surgeon Chain — the core value chain [S1, S2 §4]

```
CT/MRI patient → Advanced Post-Processing → DH PACS → Surgeon → Patient
```

| From | Edge | To | Note |
|------|------|----|------|
| Inobitec | fills-slot | Advanced Post-Processing | Today's engine, resold as "Advanced DICOM Image Viewer" |
| DHDicomAnalyzerPro | succeeds | Inobitec | Same slot, **sequenced** — not competing products |
| Advanced Post-Processing | feeds | DH PACS | Also a **billable line for the hospital** |
| DH PACS | delivers-to | Surgeon | Free Doctor Dashboard — a referral moat, not a convenience |
| Surgeon | **refers-to** | Account (centre) | **This edge *is* the catchment-compounding strategy.** A surgeon may refer to centres DHS has not signed — which is precisely what makes the next sale easier [S5] |
| DH PACS | delivers-to | Patient | Secure link; patient ownership is the **mechanism**, not the claim [S3] |

## 3. Proof edges — tier-matched, never crossed [S1]

| From | Edge | To | Evidence |
|------|------|----|----------|
| Ibn Sina | proves | **Enterprise Tier** | 7 DHV Workstations, 5 centres, ~1,257 patients since Feb 2026 |
| Cumilla | proves | **Standard Tier** | 5 centres, 56 enrolments, 7 referring doctors (Jul 2026) |

🚫 **Hard rule:** these are never crossed. Citing Ibn Sina to support free installation is false —
Ibn Sina bought workstation licences (~300k BDT/unit). `master proof point` is a **banned term**.

## 4. Authority and content routing [S4]

| From | Edge | To |
|------|------|-----|
| `E:\DHS-PACS` | holds-authority-over | Commercial Content, all three products |
| `E:\DHV-Weasis` | routes-commercial-content-to | `E:\DHS-PACS` |
| `E:\DH-Advanced-Viewer` | routes-commercial-content-to | `E:\DHS-PACS` |
| `E:\Self_project\Personal_Branding` | routes-commercial-content-to | `E:\DHS-PACS` |
| MIMemoryLLMDb | holds-authority-over | **itself only** — it cites, synthesises, reports staleness (ADR-0006) |

⚠ **Live conflict (R8):** `E:\DH-Advanced-Viewer`'s standing rule — *"DH PACS and the DHV Workstation
are out of scope for this product's sales material"* — contradicts the Surgeon Chain, which only works
if post-processing and DH PACS are sold as one thing. That rule must be revised. [S2 §12]

## 5. Registry ↔ reality (as of 2026-08-09)

| Product | Registry | Defect |
|---------|----------|--------|
| DH PACS | MIMP-004, MIMP-006, MIMP-007 | ⚠ **MIMP-004's machineA path `E:\DH-PACs-Solutions` does not exist.** Successor is `E:\DHS-PACS` |
| DHV | MIMP-005 (OHIF track) | Weasis desktop track (`E:\DHV-Weasis`, 17 ADRs) **unregistered** |
| DHDicomAnalyzerPro | — | **Unregistered** (`E:\DH-Advanced-Viewer`, 13 ADRs) |
| — | — | DHS-CRM, DHS-ERP, Isotope/Cyclotron, BDC_Marketing, Personal_Branding all **unregistered** |

## No-edge clarifications

- `depends_on` remains reserved for real build/runtime dependencies between registered projects — none today.
- **Accounts are not nodes.** Ibn Sina, Cumilla and Popular Diagnostic are Accounts in the CRM
  (`E:\DHS-PACS\docs\CRM\CONTEXT.md`), cited here as proof points only. The CRM holds records; the
  brain holds neither records nor identity. [S5, S8]
- **Personas are not nodes.** P1–P6 live in the brand strategy. Note P6 (Medical Technologist) is
  both production capacity and a switching cost, which is why it is named in the chain above. [S2 §10]
- **Equipment supply is a pillar (Supply), not a destination.** The old "trust → equipment anchor"
  narrative is retired.

## Sources

S1 `E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-06) · S2 `…\docs\MarketingStrategy\DHS_BRAND_STRATEGY.md` (2026-08-03) ·
S3 `…\docs\adr\0002-serve-the-surgeon-not-the-radiologist.md` · S4 `…\docs\adr\0001-dhs-pacs-as-commercial-content-hub.md` ·
S5 `…\docs\CRM\CONTEXT.md` (2026-08-08) · S8 `…\docs\adr\0003-crm-lives-in-three-layers.md` (2026-08-06)
