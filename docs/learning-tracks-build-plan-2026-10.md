# Learning Tracks — Build Plan (BUILT 2026-10-26)

> **BUILT 2026-10-26.** Q7 approved with one change (row 8: Lessons 03, 04 and 05, since 04/05 finished
> 2026-10-25). Brain side in commit `16520ef`; Lessons pushed in `01f3eb3`; ADR-0010. Section 7 checks
> 1–4 passed with output. Still open: the scenario test (he judges), SQA Lesson #27 at SQA's next
> Return, and section 8 items 1 and 3.
>
> **Historical record — do not re-run it.** Everything below is the plan as parked on 2026-10-24
> (Q1–Q6 decided in `/grill-with-docs`). Its instructions ("show the table", "do not build") are
> done. For the as-built system read ADR-0010, CONTEXT.md `## Learning`, and MIMP-002's
> `current-state.md`. Section 6's Antigravity task ran with Lessons 03–05, not just 03.

## 0. Start here (build session — DONE 2026-10-26)

1. Read this whole file before touching anything.
2. Show Maidul the section 5 table and get **approval, or the row numbers he wants changed**. Do not
   build before that.
3. Build in the order of section 6. Check each step against section 7.
4. Commit and push **only when he says**. Never start between 22:55 and 23:10 (nightly sync at 23:00).
5. Work with him per `E:\Self_project\AILearning\Agent_Harness\PROFILE.md`: chat-first, one change
   for him to judge, "verified" only next to proof.

## 1. Goal, in his words

"Make my learnings not connected to any specific products, rather open to any projects to pick it
up." And: "the tools get to pick up the learning done by me and suggest me along the way when I am
working on any project." His reason: the business is expanding, and his shiny-object pattern means
learning will spread across many topics. That pattern has also brought him success.

## 2. State when parked

- **MIMP-021 `system-design`** (`D:\System_Design`) was registered 2026-10-24 by Antigravity with
  `classification: "personal"`, entity, pillar and product all null. Row 7 changes it.
- **Duplicate-copy fix: DONE and verified** (commit `8de8b1f`). The single source is
  `C:\Users\maidu\.claude\projects\D--System-Design\memory\` (4 files). `D:\System_Design\AGENTS.md`
  forbids a `memory\` folder in the project.
- **The old "Prompt 2" is SUPERSEDED. Never run it.** It reclassified MIMP-021 as
  business/DHS/Build/PRD-001 and added a "DH PACS" purpose line. Both contradict Q1–Q6.
- `registry.json` has had **no UTF-8 BOM and no final newline** since Antigravity's script wrote it.
  That's harmless today (all ASCII), but `mimp.ps1` reads it with Windows PowerShell 5.1
  `Get-Content` and no `-Encoding`, which decodes a BOM-less file as ANSI. Restore the BOM when
  editing (section 6, step b).
- **`mimp lint`** already has 7 errors (2 `deadline-passed`, 5 `source-drift`) and 25 warnings, all
  unrelated to this work. Don't fix them here; just confirm the build adds none.
- **MIMP-015 `sqa-learning`** has been parked since lecture #27 (2026-09-25).

## 3. Decisions (Q1–Q6, decided)

| Q | Decision | Why / scenario he accepted |
|---|---|---|
| 1 | A Learning Track is a **Project** (MIMP-XXX), tied to the business but to no Product and no Pillar. Not a new node type, not Wiki pages. | Changes what fields mean; builds nothing new. Wiki pages track DHS facts with Authority, and general engineering knowledge has none. |
| 2 | Suggestions come from **the brain handing Lessons to the agent when project memory loads**, plus a standing rule that the agent speaks up when one applies. | Principle: no tool watches work and interrupts; the agent you talk to suggests. Antigravity already calls `whats_next` and then `get_project_memory` every session (`~/.gemini/config/AGENTS.md`). Scenario: in DH Worklist (MIMP-019, machineB), "should we cache the worklist query?" gets the answer "Your Lesson 03 says batching raises throughput but hurts tail latency; check P99 first." |
| 3 | Each finished lesson gets a small **Lesson** file (about 20–30 lines: Use when, 3–5 Rules, path to the Lesson write-up) stored in the brain. | A Lesson write-up is 380 lines / 22 KB and exists only on machineA `D:`. "Card" was rejected because the glossary already has **Source card**. |
| 4 | A Lesson exists **as soon as its write-up is finished**, marked *not studied yet*. Both kinds are suggested, and the line says which. **Only Maidul marks a Lesson Studied.** | An unstudied Lesson that turns up in real work becomes a **Return** for a parked track (PROFILE L6, L7). Scenario: Lesson 01 is suggested during a DH Worklist report-screen task a month after Ibn Sina work interrupted the track. |
| 5 | **Every** Lesson goes in the list (one line each) and the agent matches by meaning. **Ceiling: revisit at 60 Lessons.** | Tag matching fails: MIMP-019's tags are `worklist, mwl, ibn-sina, dcm4chee`, so Lesson 03 would never show. Project tags describe what a project *is*; Lessons are about problems. About 35 tokens per line. |
| 6 | **SQA (MIMP-015) becomes a Learning Track too**, with its two outputs separated: product-free Lessons in the track, and the DH PACS Test Plan staying DH PACS work. DH PACS remains its **Practice ground**. Registry changes now; the Lesson for #27 is written at SQA's next Return. | Scenario: in BDC HMS React before a release, "SQA Lesson 27: test integrity risks first; here, a payment posted to the wrong patient." The rule was sharpened: **a Lesson never names a Product; the track may name where it practises.** |

## 4. Glossary terms (add to `CONTEXT.md` verbatim)

These were written into `CONTEXT.md` during the grill, then **taken back out when parking**: a
modified tracked file makes the nightly `git pull --rebase` refuse (`rebase.autoStash` is unset),
which would fail every push. Insert them as a new section between the `**Pillar**` entry (end of
`## Products`) and `## Reserved words`:

<!-- GLOSSARY:BEGIN -->
## Learning

**Learning Track**:
A Project whose output is knowledge for the whole business, tied to no Product and no Pillar.
Projects cite the Lessons they draw on; a Lesson never names a Product.
_Avoid_: course, side track, personal project, self-learning

**Practice ground**:
The real Project where a Learning Track's exercises are run. Naming it does not tie the track to it.
_Avoid_: target product, use case, medium

**Lesson**:
The brain's compact record of one finished unit of a Learning Track: the situations it applies to and
the rules it teaches.
_Avoid_: lesson card, card (that is a Source card), note, summary

**Lesson write-up**:
The full document a Lesson stands in for, kept in the Learning Track's own repository.
_Avoid_: lesson (bare), lesson output, deep dive

**Studied**:
A Lesson the user has declared they have learned. Only the user declares it; an agent never infers it
from a finished Lesson write-up.
_Avoid_: done, completed, learned, finished

<!-- GLOSSARY:END -->

## 5. Build plan — Q7, AWAITING APPROVAL (verbatim as presented)

| # | Decision | Default | Why |
|---|---|---|---|
| 1 | How the brain knows a project is a Learning Track | Registry `classification: "learning"`, with entity `DHS`, no pillar, no product, serves `DHS` | The field exists and **nothing reads it today**, so this gives it its first reader instead of adding a new field. Entity `DHS` also stops MCP labelling the project "personal". |
| 2 | How the brain finds Lessons | Files named `lesson-NN-<slug>.md` in the track's memory folder, with three frontmatter keys: `use_when`, `studied` (a date; left out means not studied yet) and `write_up` (path to the full document) | You can see Lessons by filename. The existing parser handles flat keys, and SCHEMA.md's key table gains three rows. |
| 3 | Where the list appears | One shared function, used in two places: added to the end of `get_project_memory` for **every** project (Antigravity's path), and a new small tool `get_lessons` (Claude Code's path) | Claude Code already loads project memory by itself, so having it call `get_project_memory` would load that memory twice. |
| 4 | Standing instructions | Both `~/.claude/CLAUDE.md` and `~/.gemini/config/AGENTS.md` get two rules. **When a listed Lesson applies:** say so in one line, saying whether it's Studied or not studied yet. **When you say you've studied a Lesson:** set `studied:` at the source, then `mimp push`. Claude's file also gets **call `get_lessons` at session start**. | Covers both tools. Only you mark a Lesson Studied. |
| 5 | Lint guards (deterministic, no tokens) | **ERROR** if a Lesson names a Product. **WARN** past 60 Lessons, so your ceiling announces itself (L6: nothing brings you back by itself). **WARN** if a Lesson has no `use_when`. | Enforces the core rule, so nobody has to remember it. |
| 6 | Pipeline | The video-to-lesson SOP gains a last step: write the Lesson, marked not studied | Q4: the Lesson exists as soon as the write-up is finished |
| 7 | Registry, now | MIMP-021 and MIMP-015 change to `learning` / DHS / no pillar / no product. Roles rewritten without products (SQA's may name DH PACS as its practice ground). | Q1 and Q6 |
| 8 | First Lessons | Lesson 03 (Latency vs Throughput) now, from the existing write-up. SQA #27 at SQA's next Return. | Q6 timing, one thing at a time |
| 9 | Who builds | **I build the brain side** (rows 1–5 and 7: MCP tool and tests, lint, registry, SCHEMA.md, the two instruction files). **Antigravity builds the System Design side** (rows 6 and 8, plus a rewritten Purpose line) from a new Prompt 2. I check its output. | The code lives in this repo, where I can test it. The write-up lives where Antigravity made it. |
| 10 | Decision record | Write **ADR-0010**: "Learning Tracks: product-free Lessons served to every project" | It meets all three ADR tests. It's **hard to reverse** (it changes what every session receives), **surprising** (a future reader will ask why DH Worklist's memory includes System Design content), and **a real trade-off** (tags vs everything, studied vs not, hook vs MCP). |

Nothing gets pushed to GitHub until Maidul says so.

## 6. Build order and code facts (assumes rows approved unchanged)

**Brain side (Claude Code, `E:\MIMemoryLLMDb`):**

a. **Glossary.** Insert section 4 into `CONTEXT.md`.

b. **Registry** (row 7). Edit `registry.json` in place; never re-dump it with a JSON library. For
   MIMP-021 and MIMP-015 set `classification: "learning"`, `entity: "DHS"`, `pillar: null`,
   `product: null`, `serves: ["DHS"]`, and write product-free roles. MIMP-015 is currently
   `Build / PRD-001`. Then restore the BOM and final newline:
   ```powershell
   $p = 'E:\MIMemoryLLMDb\registry.json'
   $t = [IO.File]::ReadAllText($p).TrimStart([char]0xFEFF).TrimEnd() + "`r`n"
   [IO.File]::WriteAllText($p, $t, (New-Object System.Text.UTF8Encoding($true)))
   ```
   Commit it on its own before any `mimp push`, because `Git-Sync`'s `pull --rebase` refuses to run
   over a dirty `registry.json`.

c. **SCHEMA.md** rule 5 key table: add `use_when`, `studied`, `write_up` (used by Lessons).

d. **MCP** (rows 2–3). `mcp-server/lib/repo.js` already has `readRegistryFromGit` (returns the
   `projects` map, including `classification`), `gitListMdPaths`, `gitReadFile` and
   `parseFrontmatter` (scalars and inline arrays only). Add one shared function that lists
   `lesson-*.md` files in every `classification: "learning"` project and returns one line each
   (studied date or "not studied yet", track, title, Use when). Append its output to
   `mcp-server/tools/get-memory.js` (60 lines; add the block after the referenced files). Add
   `tools/get-lessons.js` and register it in `mcp-server/index.js` next to the other `register*`
   calls. Extend `mcp-server/test-brain-tools.mjs` (it spawns the real server over stdio).
   **The MCP server reads `origin/master`**, so nothing shows until it is pushed.

e. **Lint** (row 5). Add the three checks to `tools/lint.mjs`; registry products are under
   `registry.products[*].name`. **Known snag:** PRD-005 is named `HMS`, which is also a generic word,
   so expect false positives. Decide the matching rule with Maidul (see section 8).

f. **Instruction files** (row 4). `~/.claude/CLAUDE.md` and `~/.gemini/config/AGENTS.md` are global
   and live outside this repo. Show him the exact lines before editing them.

g. **ADR-0010** (row 10) in `org/decisions/`, from `_TEMPLATE.md` (frontmatter keys: id, date,
   status, scope, tags, supersedes, superseded_by).

h. **Checks:** `node mcp-server/test-brain-tools.mjs`; `node tools/lint.mjs` must still show 7 errors
   and nothing new; `git status` must show only intended files. Stage with explicit paths, never
   `git add -A` (the two `docs/*-2026-08.md` files must stay untracked).

**System Design side (Antigravity, from a new Prompt 2 written at build time, rows 6 and 8):**

- Write `lesson-03-latency-and-throughput.md` in
  `C:\Users\maidu\.claude\projects\D--System-Design\memory\`, drawn from
  `D:\System_Design\lesson-output\03_Latency_and_Throughput_Deep_Dive.md` (its sections 1
  "Executive Summary", 9 "Architectural Playbook" and 10 "Common Pitfalls" feed Use when and Rules).
  No product names and no `studied` key. Link it from that folder's `MEMORY.md`, so
  `get_project_memory system-design` returns it; that is also how an agent opens a Lesson.
- Rewrite the Purpose line with no product in it.
- Add the final step to `video-to-lesson-pipeline.md`: write the Lesson, marked not studied.
- `mimp push system-design`. Every rule in the old Prompt 1 still applies: no hand edits under
  `projects/`, no `memory\` folder in `D:\System_Design`, scoped git, stop and report on any surprise.

## 7. Done means (check each with output)

- `get_project_memory dh-pacs-worklist` (any non-learning project) ends with a "Lessons that may
  apply" block listing Lesson 03 as **not studied yet**.
- `get_lessons` returns the same list.
- `get_business_overview` shows MIMP-021 and MIMP-015 under DHS, with no "personal" label.
- Lint: no new errors. The product-name check fires on a planted fixture inside the test, never on
  real memory.
- **Scenario test** (he judges): in a session in another project, ask "should we cache X?" The agent
  cites Lesson 03 in one line and says it isn't studied yet.

## 8. Open items found while planning (outside the table; raise, don't decide alone)

1. `mimp init` option `[2] Personal` (`tools/mimp.ps1:313-320`) writes `classification: "personal"`,
   which contradicts the 2026-09-27 business-only rule, and init doesn't know `learning`.
2. Row 5's product-name check vs the generic word `HMS` (PRD-005).
3. `mobile-remote-operations.md` sits in MIMP-021's memory although it is operations, not learning.
   Parked (PROFILE L4).
