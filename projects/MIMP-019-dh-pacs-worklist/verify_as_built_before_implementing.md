---
name: verify-as-built-before-implementing
description: "Standing instruction — before implementing any designed piece, research what is actually built/running on that date and propose changes against the live system, not the docs"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 617f85e1-ad3f-437d-bf93-70fed61103f7
  modified: 2026-09-27T16:47:06.789Z
---

**Given 2026-09-27** while approving a design decision: "Approve, but before implementing, research
properly what is actually built as of the current date and propose changes accordingly."

**Why:** documents describe intent, and the live system has diverged from git before. Central ADR
0022 exists because the production VM matched no commit at all. A design approved against docs can
be wrong against reality.

**How to apply:** when a design moves to implementation, first re-check every assumption it rests
on against the live system: deployed code, running config, schema, tailnet ACL, hardware. Then
propose changes against what is found. For the dental project this is written out as
`D:\dh-pacs-dental\docs\AS_BUILT_AUDIT_BEFORE_IMPLEMENTATION.md`, one row per assumption. Read-only
probes are fine; production-touching or PHI-returning probes need the user's say-so. Related:
[[no_building_during_design]], [[working_style]], [[dental_cbct_project]].
