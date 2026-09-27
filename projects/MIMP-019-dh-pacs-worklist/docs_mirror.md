---
name: docs-mirror
description: "The docs/IbnSinaCancerPacs/ folder here is a non-authoritative mirror of dh-pacs-central's design-authority docs — where the real source lives"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 3e795962-3582-4ffc-8110-cfb79f47f1ac
  modified: 2026-09-07T09:40:26.919Z
---

`d:/IBNSinaPacs/docs/IbnSinaCancerPacs/` (CONTEXT.md, ARCHITECTURE.md, BUILD_PLAN.md, README.md, PITCH.md, OFFER_READINESS.md, SERVER_SPEC.md, adr/0001–0012, etc.) is a **read-only snapshot copied 2026-09-07**. It is not kept in sync automatically.

**Canonical source:** `D:\Pacs_Viewer_Storage_Project\docs\IbnSinaCancerPacs\` — inside the `dh-pacs-central` repo, which is the design-authority repo per [[repo_identity]] / ADR 0009. That repo's `CLAUDE.md` also links back to `d:/IBNSinaPacs` under a "Companion project — DH Worklist" section (added 2026-09-07).

User explicitly chose "keep the copy as read-only reference" over deleting it or symlinking it, accepting drift risk in exchange for being able to read design context offline without depending on the other repo's filesystem path.

**How to apply:** Before trusting anything in the local mirror as current, especially ADR numbers, glossary terms, or open confirmations (C1–C13), cross-check against the canonical path — it may have moved on since 2026-09-07. This repo's own `docs/adr/` and `CONTEXT.md` (implementation-level decisions, not domain ones) don't exist yet — see [[grilling_plan]].
