---
id: ADR-0001
date: 2026-05-01
status: accepted
scope: [projects, MIMP-005, programs]
tags: [pacs, dicom, ohif, viewer, fork, software-saas, TO-VERIFY]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0001-ohif-fork-pacs-viewer.md | Decision (ADR, trajectory layer) -->

# ADR-0001: Fork OHIF for the DHS PACS viewer (Tier 3+4)

| Field | Value |
|-------|-------|
| Date | 2026-05-01 (**TO VERIFY** — exact date precedes this memory system) |
| Status | accepted |
| Scope | PACS product line — DICOM viewer (MIMP-005 / DHV-OHIF) |

> ⚠️ **TO VERIFY.** This ADR is a backfill of a product decision made before MIMemoryLLMDb existed.
> MIMP-005's project memory lives on machineB and is sparse-excluded from machineA, so the specifics
> below (exact date, the precise meaning of "Tier 3+4", and the alternatives actually weighed) are
> reconstructed from cross-references in `org/` and the brain memory, **not** from the MIMP-005 record.
> Confirm against the DHV-OHIF project memory on machineB and correct before treating as authoritative.

## Context

DHS's PACS product needs a web-based DICOM viewer as the thing it actually sells. Building a
medical imaging viewer from scratch is a multi-year effort; **OHIF** (Open Health Imaging Foundation
viewer) is the mature, open-source standard for exactly this. The decision was how deeply to adopt
it — thin configuration vs. a maintained fork — given that the viewer is the **sold product**
(MIMP-005, first target Ibn Sina by July 2026) and must carry DHS-specific commercial features.

## Decision

Adopt OHIF as a **fork** with deep customization — referred to as **"Tier 3+4"** customization
(**TO VERIFY:** the tier model and what 3+4 specifically commit to — likely the deeper end of
config → extension → fork → core-modification). The viewer ships as DHV-OHIF (MIMP-005), the code
artifact of the PACS product line, marketed by MIMP-004 and sold to external hospitals.

## Alternatives

> **TO VERIFY** — reconstructed, not from the original decision record.

- **Build a DICOM viewer from scratch** — rejected: prohibitive cost/time for a non-core competency
  when a mature open standard exists.
- **Thin OHIF config / shallow customization only** — rejected (implied by choosing Tier 3+4): too
  shallow to carry the DHS-specific commercial and clinical features the product needs.
- **A different open-source or commercial viewer** — status unknown; confirm whether others were
  evaluated.

## Path-impact

- **Defines the PACS product's technical foundation** — MIMP-005 is an OHIF fork; its Phase-C
  blockers (report source, audit, demographics, i18n) and commercial wrap are tracked against the
  north-star (first PACS sale → Ibn Sina by July 2026).
- **Sets a maintenance commitment** inherent to forking: tracking upstream OHIF vs. carrying local
  changes (**TO VERIFY** how this is managed).
- **Feeds the flywheel** (ADR-0004): every PACS win compounds the trust the equipment-deal pipeline
  ultimately draws on.
