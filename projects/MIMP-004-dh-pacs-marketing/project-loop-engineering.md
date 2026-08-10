---
name: project-loop-engineering
description: "Loop engineering doctrine studied 2026-08-08 and PARKED — Loop Spec as the unit, evaluator-first sequencing, convergent vs perpetual runtimes, clinical memory-leak guardrail; do not propose building until Maidul identifies an application"
metadata: 
  node_type: memory
  type: project
  originSessionId: 13b278a4-36ad-47f9-85ee-263cd946ce84
  modified: 2026-08-08T11:44:34.041Z
aliases: [project_loop_engineering]
---

Loop engineering was studied and mapped to DHS work on **2026-08-08**, from a video in `E:\DHS-PACS\Loop_engineering\`. Three docs exist there: `LOOP_ENGINEERING_EXTRACTION.md` (the source content), `CONTEXT.md` (glossary), `LOOP_ENGINEERING_APPLICATION.md` (the DHS map). **Nothing has been built yet.**

**PARKED 2026-08-08 by Maidul's explicit decision** — the learning is banked; the trigger to build is his, not the agent's. Do **not** proactively pitch building the evaluator or any Loop Spec, and do not treat the "sequenced path" in the application doc as a backlog. The right move is to recognise the shape when it appears in real work — a task done 3+ times with a checkable output — name it, point at the relevant loop shape, and let him decide.

Decisions made in that session:

- **"Loop Spec" is the unit of work**, because "loop" is already taken four times over in this environment (`/loop`, `autonomous-loops`, `continuous-agent-loop`, `loop-operator`). `/loop` is a *scheduler* — wrapping a prompt in it produces the video's "slot machine," not a loop. The test: **no Loop Spec, no loop.**
- **Evaluator-first sequencing.** Build the judge before any loop. The DHS copy rubric already exists in prose in `CLAUDE.md` + `DH_PACS_BRAND_VOICE.md`; 5 of its 9 checks are pure regex. This dissolves the champion loop's ~40-graded-case prerequisite, because the dataset accretes from real work.
- **Convergent vs perpetual** determines runtime. Convergent (finite, stops itself) → **Claude Code, artifacts in-repo**; budget must be a *round cap* because a dollar cap isn't enforceable there. Perpetual (world-triggered) → the existing Worker cron + Notion + Telegram stack.
- **Placement deliberately deferred** — `Loop_engineering/CONTEXT.md` is intentionally NOT registered in `CONTEXT-MAP.md` until one Loop Spec has actually run. Do not "fix" this.

Two findings worth keeping:

- **A prohibition is gameable by silence.** Every DHS hard line is phrased as a prohibition, so a loop optimising against them learns to say less while its score rises. Tier-matched proof is the highest-risk check and needs a companion check rewarding *presence*, plus permanent human eyes.
- **Memory is the leak vector.** A loop's log is durable and re-read by design, so [[project-dhs-crm]]'s ADR-0004 rule (case shape, never case identity) must be enforced at the **tool boundary**, not as a rubric check — an eval that catches an identifier fires after it is already in the log. Blocks `Marketing/Popular_Diagnostic/` from ever being loop input until cleaned.

**Why:** DHS is a solo operation where judgment quality is the bottleneck and drift at volume is the real failure. **How to apply:** before proposing any agentic automation for DHS-PACS, DHS-CRM, Personal_Branding, DHV or DHDicomAnalyzerPro, check it against the transferable test in the application doc — checkable → loop it; consequential → escalate; no stop written → don't run it. Never loop positioning decisions (see [[project-dhs-brand-strategy]]); never put pricing figures or patient identity in a loop's context.
