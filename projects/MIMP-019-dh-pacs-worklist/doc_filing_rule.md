---
name: doc-filing-rule
description: "Standing instruction for d:/IBNSinaPacs — every document generated must be filed into the right folder with a proper name as it is created, never left at the root or under a scratch name"
metadata: 
  node_type: memory
  type: feedback
  modified: 2026-09-07T11:25:12.557Z
  originSessionId: 72f28569-2532-4d52-a83c-54dd220c66b0
---

**Standing instruction, given 2026-09-07:** whatever documents get generated in `d:/IBNSinaPacs`, sort them into the repository with proper naming and placement — as part of creating them, not as a cleanup pass afterwards.

The authoritative rules live in the repo at **`docs/README.md`**, with a short version in `CLAUDE.md` under *"Where documents go"*. Read `docs/README.md` before writing a document, not after. Current shape:

- `docs/adr/` — implementation decisions, `NNNN-a-sentence-in-kebab-case.md`
- `docs/demobuilder/` — Stage 1 demo docs, `SCREAMING_SNAKE_CASE.md`
- `docs/demobuilder/probes/` — raw transcripts, `YYYY-MM-DD-NN-what-it-probed.md`
- `demo/` — artifacts the build reads (CSV, templates), lowercase
- `docs/IbnSinaCancerPacs/` — read-only mirror, never edited here
- Root — only `CLAUDE.md` and `CONTEXT.md`, and `CONTEXT.md` is a glossary and nothing else

**Why:** the first pass of this work left `survey.md`, `survey-2.md`, `s3.md`, `s4.md` and four `SCREAMING_CASE` docs loose in `docs/`, and the user asked for a restructure. Scratch names are unreadable to anyone who was not in the session, and one of those files was ~9,000 lines of `node_modules` JSON that would silently poison future context. A new stage gets a **new sibling folder** rather than growing `demobuilder/`, so each stage stays readable as a finished thing.

**How to apply:** name the file for what it contains before writing it; never emit `notes.md`, `output.txt`, `s5.md` or anything else that needs the conversation to decode. When a raw transcript is captured, file it *and* distil its durable facts into a normal document — a transcript is never the only home of a fact anyone needs. When a document moves, fix every relative link to it in the same change. Related: [[repo_identity]], [[working_style]].
