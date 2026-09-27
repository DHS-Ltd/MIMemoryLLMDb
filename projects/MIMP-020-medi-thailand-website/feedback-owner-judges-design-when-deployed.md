---
name: feedback-owner-judges-design-when-deployed
description: "The owner evaluates design by looking at the deployed site, and will reverse locked spec decisions on sight — deploy early, don't over-lock in docs"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8105b859-10e0-43f1-9dcf-934d80fe51af
  modified: 2026-08-13T09:12:26.320Z
---

The owner cannot evaluate a design from a written spec. On 2026-08-13 he reversed the palette
decision he had personally approved in the 2026-07-18 design session — "I know I made a choice to
the global color scheme which is a bit more aggressive. But now after seeing the site I am not
liking this at all" — after viewing the deployed preview. That palette had been marked **LOCKED**
in `docs/design/visual-design-system.md` and recorded in ADR 0003.

**Why:** written specs with hex tables and posture dials read as agreeable to a non-technical
owner in a way the rendered result does not. He also chose "build and review live" over a
mockup stage when offered, which is consistent — he wants to look at the real thing.

**How to apply:** get something deployed to https://med-i-thailand-website.pages.dev early and
let him look, rather than seeking sign-off on more written design detail. Treat "LOCKED" in the
design spec as provisional until he has seen it rendered. Expect visual decisions to move after
first sight and budget for it — that is not churn, it is how he reviews. Note the corollary
observed in the same session: his reaction was partly to an *unstyled scaffold*, so when he
reacts to something half-built, separate "the design is wrong" from "this isn't the design yet"
before acting. See [[feedback-recommend-and-defer-design]] and
[[project-medi-website-rebuild]].
