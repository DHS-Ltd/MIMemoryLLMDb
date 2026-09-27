---
name: repo-identity
description: "What d:/IBNSinaPacs is — the DH Worklist implementation repo, its scope, and its relationship to dh-pacs-central and dh-pacs-workstation"
metadata:
  node_type: memory
  type: project
  originSessionId: 3e795962-3582-4ffc-8110-cfb79f47f1ac
  modified: 2026-09-07T11:16:37.790Z
---

`d:/IBNSinaPacs` is the working directory for **dh-pacs-worklist** (working name, not the final product name) — the standalone implementation of the DH Worklist product decided in ADR 0009 in the `dh-pacs-central` repo.

Scope: Order Adapter (+ transports), identity matcher / DH Patient Identity minting, DMWL SCP, Worklist Console, Procedure Catalogue. Does **not** contain the PACS. Must run with no mesh (`FEDERATED_MODE`) present — standalone-sellable to any hospital with modalities and a billing system, not just Ibn Sina.

As of 2026-09-07: **Stage 1 demo fully designed, no code written.** Read `CLAUDE.md` at the repo root first — it now has an ordered reading list. Not a git repo (the user chose not to `git init`).

**Three repos, and mixing them up is the mistake to avoid:**
- `D:\Pacs_Viewer_Storage_Project` — `dh-pacs-central`. Design authority; also the source of `idGenerators.js` and the claim-safety machinery this repo reuses.
- `D:\dh-pacs-workstation` — Components A/B/C, the software **already installed** on the Ibn Sina box. **Escrowed, never handed to a customer** (ADR 0010) — which is precisely why the worklist is built in `d:/IBNSinaPacs` instead. Consume from it, never build into it.
- `d:/IBNSinaPacs` — this repo.

**Why:** the codebase may be handed to Ibn Sina on sale, and a shared repo can't be given away without exposing every other customer's system. Reasoning is in ADR 0009 itself — read it before assuming this summary is complete.

**How to apply:** keep implementation work scoped to the worklist product. Domain vocabulary lives in the [[docs_mirror]]; this repo's own three terms are in its `CONTEXT.md`. See [[grilling_plan]] for where work resumes.
