<!-- BRAIN LAYER | org/business.md | The whole-business source of truth for DHS -->

# DHS — Business Overview

> This is the top of the MIMemoryLLMDb "brain." It describes the whole business that every
> entity, program, and project ladders up to. Read this first, then `north-star.md` for the
> current priority, then the `entities/` and `programs/` files for detail.

## Identity

**DHS = Direct Hospital Solution Ltd** — a healthcare company serving the Bangladesh market
(hospital owners, diagnostic centres, and healthcare providers). DHS is **not** a software
company; software is one of three activity lines.

- **Mission:** empower hospitals and patients with the knowledge they need to make informed
  healthcare decisions, fostering trust and confidence in our expertise.
- **Vision:** transform healthcare technology in Bangladesh through meaningful advancements —
  in collaboration with doctors, patients, and hospital owners. Value over market domination.
- **USP:** deliver sustainable growth for the *client's* healthcare business — flexible pricing
  + proactive service models that reduce operational risk and optimize their financial performance.
- **Differentiators:** relationships-first / client needs first / honor commitments; 25+ years of
  team experience; strong connections to top-tier global manufacturers; technologies tailored to
  Bangladesh; curated, accessible pricing.

## The strategic thesis (the flywheel)

> **Land with Software-SaaS + the Diagnostic-Centre business → earn market awareness, trust, and
> credibility → convert that trust into high-ticket medical-equipment deals (the long-term
> revenue anchor).**

- **Current revenue engine:** Software SaaS + the Diagnostic-Centre business (BDC). These pay the
  bills today.
- **Long-term core target:** Equipment supply — expensive equipment, very long sales cycles. *Not*
  the anchor yet, but the destination the whole business steers toward.
- **The lens for every decision:** does this move generate direct revenue *and* compound trust
  toward equipment? Any "what's next" synthesis should apply this lens.

## Three activity lines

| Activity | Role in the thesis | Status |
|----------|--------------------|--------|
| **Software SaaS** (PACS, HMS) | Trust + awareness engine; current revenue | Active; first external PACS sale is the current north-star |
| **Diagnostic-Centre business** (BDC) | Proving ground + current revenue + lead generation | Live and operating (see `entities/bdc.md`) |
| **Equipment supply** | Future revenue anchor | Groundwork / awareness stage (see `programs/equipment-deal-pipeline.md`) |

## Entities (2 — kept deliberately small)

| Entity | What it is |
|--------|-----------|
| **DHS** (parent) | The healthcare company. Holds all three activity lines and owns BDC. See `entities/dhs.md`. |
| **BDC** — Baroicha Diagnostic Center Ltd | **100%-owned subsidiary**, run on a **different business model**: a real rural diagnostic centre + a patient-generation engine + DHS's proving ground. See `entities/bdc.md`. |

Future ventures fold under DHS or BDC. External reference customers (e.g. Ibn Sina) are **not**
entities — they are sales targets / proof points referenced inside DHS memory.

## Node types in the brain

- **Entity** (no code): DHS, BDC.
- **Program** (operational, usually no code): BDC patient-generation & marketing; equipment-deal pipeline.
- **Project** (code, today's MIMP-XXX): OHIF viewer, PACS site, HMS, ImageConverter, mimp.

## The full map

```
DHS  (parent — thesis: trust -> equipment)
├── activity: Software SaaS
│     ├── PACS product   → MIMP-004 (markets) + MIMP-005 (OHIF viewer)  --sold-to--> external hospitals
│     └── HMS product    → MIMP-003                                     --runs-on--> BDC
│     └── internal tooling → MIMP-001, MIMP-002
├── activity: Equipment supply ............ future revenue anchor   → program: equipment-deal-pipeline
└── owns (100%): BDC  (subsidiary — different model)
        ├── operations (tests, doctor chambers, reports)
        ├── program: patient-generation & marketing
        └── runs-on: HMS (MIMP-003)   ← dogfooding / proving ground
```

See `relationships.md` for the typed edges, and `north-star.md` for the current priority.

## Customers & market

Hospital owners, diagnostic centres, and healthcare providers across Bangladesh. Known pain points
DHS is built to solve: low awareness of advances, needs/offering mismatch, lack of locally-tailored
solutions, training/skill gaps, complex import/procurement, high cost & financing constraints, and
unreliable suppliers.
