---
name: feedback-opus-plans-sonnet-builds
description: "For features, user wants Opus to plan/decide and verify, a Sonnet subagent to build; also used in DH PACS dental"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b180ad2c-9935-4c54-8aa8-647880ce7524
  modified: 2026-10-23T15:39:04.366Z
---

For new features, the user wants the grilling/planning and the verification done on Opus, and the build done by a Sonnet subagent on a branch. They used the same split in DH PACS dental. In this repo it is now a written rule (CLAUDE.md "Features: Opus plans, Sonnet builds, Opus verifies", 2026-10-23); small content edits stay single-agent.

**Why:** on the Page reports build (2026-10-23) Sonnet's own checks passed while 7 bugs remained, 4 visible only on a phone or in a captured picture; the Opus pass caught them by testing in a phone-sized touch browser and looking at the output images.

**How to apply:** if the user asks for this split, say plainly which model is running (a model cannot switch itself; the user runs `/model opus`). Brief the builder with every decision plus "don't push, don't call real external services"; as verifier, read every changed file, re-run tests/build, and test on emulated touch at phone width, viewing screenshots. Related: [[feedback-guided-stepwise-pacing]], [[feedback-owner-judges-design-when-deployed]].
