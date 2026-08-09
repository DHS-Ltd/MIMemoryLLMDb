# MIMemoryLLMDb — Context

The shared language of the DHS brain: a git-synced, markdown-first knowledge system that AI
assistants read and write. This file is a glossary only — no rules, no structure, no plans.
Format rules live in `SCHEMA.md`; the business model lives in `org/business.md`.

## Tiers

**Brain**:
The whole knowledge system in this repository, across all tiers.
_Avoid_: knowledge base, database, memory system

**Memory file**:
A markdown file under `projects/MIMP-XXX-*/` recording the state of one project.
_Avoid_: note, doc, memory (bare)

**Wiki page**:
A markdown file under `wiki/` synthesising knowledge drawn from external Sources.
_Avoid_: note, article, page (bare)

**Source**:
Any document outside this repository that the brain reads — most often a `CONTEXT.md`, an ADR, or a
strategy doc in another DHS repo; sometimes a PDF, article, or transcript.
_Avoid_: raw file, resource, material, input

**Source card**:
The committed markdown record that stands in for a Source: its origin, date, hash, and abstract.
_Avoid_: manifest, stub, index entry

**Vault**:
The Obsidian view over this repository, rooted at the repo root.
_Avoid_: workspace, folder, project

## Provenance

**First-party**:
Knowledge authored inside this repository and answerable to no document outside it — how the brain
itself works, and its own operational state. Lives in `projects/MIMP-002-mimp/` and `docs/`.
_Avoid_: internal, original, our own

**Sourced**:
Knowledge derived from a Source. Must cite a Source card. Lives in `wiki/` and, after the rebuild,
in `org/`.
_Avoid_: external, third-party, researched

**Authority**:
The repository that owns a subject and may assert facts about it. `DHS-PACS` holds Authority over
Commercial Content; each engineering repo holds it over its own product. MIMemoryLLMDb holds
Authority over no subject except itself — it cites, synthesises, and reports staleness.
_Avoid_: owner, source of truth (ambiguous — a Source is not an Authority)

**Superseded**:
A claim a Source has explicitly replaced. Recorded with what replaced it and when, never deleted
silently, because stale copies survive in other repos and in Memory files.
_Avoid_: outdated, deprecated, wrong

## Operations

**Ingest**:
Reading a new Source and folding its knowledge into existing and new Wiki pages.
_Avoid_: import, upload, add, process

**Lint**:
A health pass over the brain that reports defects rather than fixing them silently.
_Avoid_: audit, review, check, validate

## Products

DHS's product vocabulary is owned by `E:\DHS-PACS\CONTEXT-MAP.md`. Repeated here only where the
brain must not get it wrong — the first two collide, which is DHS's open risk **R7**.

**Advanced DICOM Image Viewer**:
The **Inobitec** product DHS resells. Certified, sellable today, and the current north-star
(`PRD-003`). Fills the Advanced Post-Processing slot.
_Avoid_: Advanced DICOM Analyzer, the analyzer, Inobitec (that is the vendor, not the offer)

**DHDicomAnalyzerPro**:
The 3D Slicer–based tool DHS is **building** to replace Inobitec in the same slot (`PRD-004`).
No code exists yet. A build goal, never a sales goal.
_Avoid_: DHDicomAnalyzer (pre-rescaffold name, superseded 2026-07-27), Advanced DICOM Analyzer, DHDAPro

**DH Advanced Post-Processing**:
The **capability** DHS markets, deliberately named so the engine beneath it can change from
PRD-003 to PRD-004 without a brand break.
_Avoid_: naming the engine vendor in customer-facing material as if it were the product

**Pillar**:
One of DHS's four lines of business — Build (prime), Supply, Service, Facility. Replaces the
retired `niche` field in `registry.json`.
_Avoid_: niche, activity line, vertical, division

## Reserved words

**Schema**:
The format specification for Memory files and Wiki pages — the thing `SCHEMA.md` defines.
Never use "schema" for the AI's operating instructions; those are the Wiki rules.

**Wiki rules**:
The operating instructions telling the assistant how to Ingest, format, Lint, and answer.
_Avoid_: schema, spec, constitution, config

**Node**:
An Entity, Program, or Project — a unit of the org model registered in `registry.json`.
A Wiki page is not a Node.
_Avoid_: item, record, object
