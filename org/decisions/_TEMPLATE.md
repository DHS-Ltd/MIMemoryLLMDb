---
id: ADR-NNNN
date: YYYY-MM-DD
status: accepted          # proposed | accepted | superseded | reversed
scope: []                 # any of: business | entities | programs | projects | infra
                          # plus specific node ids where useful, e.g. MIMP-005, BDC, mcp-server
tags: []                  # free tokens for get_decisions filtering, e.g. [pacs, viewer, fork]
supersedes:               # ADR id this replaces, or omit
superseded_by:            # ADR id that replaced this, or omit
---

<!-- BRAIN LAYER | org/decisions/ADR-NNNN-*.md | Decision (ADR, trajectory layer) -->

# ADR-NNNN: <short imperative title>

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Status | accepted |
| Scope | <human-readable scope, e.g. "PACS product line (MIMP-005)"> |

## Context

What forced the decision. The situation, the constraint, the gap. Enough that a future
reader (human or LLM) understands *why this came up* without external memory.

## Decision

What was chosen, stated plainly. One paragraph. The thing that is now true.

## Alternatives

What else was on the table and why it lost. Even one line each — the rejected options
are the most valuable part for anyone tempted to revisit this later.

- **<option>** — why not.
- **<option>** — why not.

## Path-impact

What this decision constrains, unlocks, or commits future work to. Downstream effects,
reversibility, and any follow-on decisions it implies (link with `ADR-NNNN`).

<!--
ADR conventions:
- id is sequential by decision date (ADR-0001 = earliest). IDs are stable and quotable.
- Frontmatter is the machine-readable surface for the future get_decisions MCP tool
  (step 1e): it filters by scope / tags / date. Keep keys present even when empty.
- Lives under org/, which is always checked out on every machine (not sparse-excluded).
- Commit + `mimp push mimp` after adding an ADR, like any other org/ change.
-->
