<!-- BRAIN LAYER | org/relationships.md | Typed edges, human-readable -->

# DHS — Relationships (typed edges)

> The connective tissue of the brain. Machine-readable form lives in `registry.json`
> (entities / programs / project edges); this file is the human-readable narrative.

## Edge types

`owns` · `runs-on` · `dogfooded-by` · `markets` · `sold-to` · `serves` · `builds-trust-toward` · `depends-on`

## The edges today

| From | Edge | To | Note |
|------|------|----|------|
| DHS | owns (100%) | BDC | Subsidiary, different business model |
| BDC | runs-on | MIMP-003 (HMS) | BDC operates on the HMS software |
| MIMP-003 (HMS) | dogfooded-by | BDC | BDC is the proving ground for HMS |
| MIMP-004 | markets | PACS product | Marketing site + commercial positioning |
| MIMP-005 (OHIF viewer) | sold-to | external hospitals | First target: Ibn Sina (by July 2026) |
| MIMP-005 + MIMP-004 | serves | DHS (Software SaaS) | The PACS product line |
| MIMP-001, MIMP-002 | serves | DHS (internal tooling) | Image converter; this memory system |
| Software SaaS + BDC | builds-trust-toward | Equipment supply | The flywheel: trust → equipment deals |

## Narrative

DHS is the parent. Its current revenue and credibility come from two places: the **Software SaaS**
products (PACS, HMS) and the **BDC** diagnostic centre it wholly owns. HMS *runs* BDC, so BDC is
where the software is proven before it's sold to other centres. The PACS product (viewer + marketing)
is being sold outward — the first deal targets **Ibn Sina**, which doubles as the proof point for the
next sales. All of this trust and awareness is, by design, aimed at the long game: **equipment supply**,
the high-ticket, long-cycle business DHS ultimately wants as its revenue anchor.

## No-edge clarifications

- `depends_on` is reserved for real build/runtime dependencies between **registered projects** — none today.
- External customers (Ibn Sina) are references/targets, **not** nodes.
- Equipment supply and Software SaaS are **DHS activities**, not separate entities.
