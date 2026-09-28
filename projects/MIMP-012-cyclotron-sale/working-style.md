---
name: working-style
description: "How the user likes to drive report-building on this project (grill interview, CONTEXT.md steering)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0a2f3aa2-2865-4ac7-aa24-4ff624892a39
---

The user builds the reports via the **`/grill-with-docs` skill**: a relentless, one-question-at-a-time
interview with a recommended answer per question, walking the decision tree before any drafting.
They generally accept the recommended option, and occasionally give a richer custom answer that
reframes scope (e.g. "mixed committee audience", "full vertical build", "Bangladesh").

They sometimes **edit `CONTEXT.md` directly to steer** rather than answering in chat — e.g. they
rewrote the "Format & stance" line to demand a detailed (~10+ page), aggressive, go-framed brief
("No-go is not an option"). Always re-read `CONTEXT.md` for mid-stream edits and honor them.

**Why:** they want every aspect of a report finalized and agreed before it's written.
**How to apply:** for new reports, run the grill interview, give recommendations, pin decisions into
`CONTEXT.md` inline, and respect their direct CONTEXT edits as authoritative. Relates to
[[reports-evidence-discipline]] and [[user-profile]].
