---
id: ADR-0005
date: 2026-06-02
status: accepted
scope: [infra, mimp]
tags: [powershell, encoding, utf8, memory-integrity, bug-fix]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0005-memory-md-push-encoding-fix.md | Decision (ADR, trajectory layer) -->

# ADR-0005: Force UTF-8 on the MEMORY.md metadata rewrite

| Field | Value |
|-------|-------|
| Date | 2026-06-02 |
| Status | accepted |
| Scope | `mimp push` — MEMORY.md "Last updated / Updated by" stamp |

## Context

On every `mimp push`, the CLI rewrites two metadata fields in the project's `MEMORY.md`
("Last updated" date and "Updated by" machine). It did this by reading the file with
`Get-Content -Raw`, regex-replacing the two fields, and writing it back with `Set-Content`.
On **Windows PowerShell 5.1**, `Set-Content` without an explicit encoding does **not** preserve
UTF-8 — so any non-ASCII content in `MEMORY.md` (box-drawing, em dashes, etc.) was corrupted into
mojibake on each push. Because this happens inside the memory system's own write path, it actively
**degraded the source of truth** a little more every time a project was pushed.

## Decision

Pin the encoding to **UTF-8 on both ends** of the rewrite: `Get-Content -Raw -Encoding UTF8` and
`Set-Content -Encoding UTF8`. A one-line-each fix on the read and write that bound the round-trip to
a stable encoding. The already-corrupted characters in the affected `MEMORY.md` were repaired by
hand in the same change.

## Alternatives

- **Leave it / clean up mojibake manually after pushes** — rejected: it re-corrupts on the next
  push; the write path itself is the bug.
- **Skip the in-place metadata rewrite entirely** — rejected: the "Last updated / Updated by" stamp
  is useful and cheap; the problem was encoding, not the feature.
- **Restrict MEMORY.md to ASCII-only** — rejected: the memory format is markdown meant for humans and
  any LLM; mandating ASCII is a worse constraint than just writing UTF-8 correctly.

## Path-impact

- **Protects memory integrity** — the system no longer corrupts its own files on write.
- **Reinforces a PS 5.1 rule** already noted in the architecture memory: always pass `-Encoding UTF8`
  to `Set-Content` / `Out-File` (the registry write and sparse-checkout write already do this) — any
  future file-writing code in `mimp.ps1` must follow suit.
- Low blast radius, fully reversible; no schema or interface change.
