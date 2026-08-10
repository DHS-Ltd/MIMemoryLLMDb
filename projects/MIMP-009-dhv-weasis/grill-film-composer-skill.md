---
name: grill-film-composer-skill
description: "The grill-film-composer project skill — a self-growing, codebase-aware planner for turning hospital field observations into Film Composer implementation plans."
metadata: 
  node_type: memory
  type: project
  originSessionId: 6895c065-c5bb-4ae3-8b97-098d836a47c2
aliases: [grill_film_composer_skill]
---

Built a project-scoped skill **`grill-film-composer`** at
`e:\DHV-Weasis\.claude\skills\grill-film-composer\` (SKILL.md = the engine,
architecture-map.md = the as-built codebase knowledge). It turns one observed
hospital printing practice into a locked, architecture-mapped implementation plan
for the DHV Film Composer (`weasis-dicom-filmcomposer`), then updates the project
docs and stops for build confirmation.

**Locked design decisions (do not re-litigate):**
- **Project scope, not global** — it's married to this one module/repo; global would pollute other projects and drift from the code it points at.
- **Plan-only with a hard confirmation gate** — job is Grill → Reason → Plan → Update docs → Ask before build. On "yes" it does a clean handoff to the normal TDD/code-review flow; it never writes production code itself.
- **Knowledge base = the existing four repo docs**, extended in place (`CONTEXT.md`, `docs/Printing_module/film-composer-design-decisions.md`, `docs/adr/*`, `CLAUDE.md` phase notes) — not a new parallel catalog.
- **8-stage grill backbone** with **gated** industry research (only researches vendor/DICOM specifics when the standard is genuinely uncertain).
- **Session unit = one atomic feature** + a triage front-door for whole-visit batches, parked in `docs/Printing_module/field-findings-backlog.md`.
- **Self-growth** = mandatory Stage-6 doc append (knowledge grows in repo) + add a pointer to architecture-map.md whenever priming was slow (skill primes faster over time). The SKILL.md procedure itself changes only when the *way to grill* is wrong.
- New field-driven phases number **6A, 6B, …** (v1 build ended at the 5x phases; 5H is vendor validation).

No ADR was created for the skill itself — it's dev tooling, not a Film Composer architecture decision (fails the 3-part ADR test). A pointer was added to `CLAUDE.md` under "Film Composer field-study workflow". Built via a `/grill-with-docs` session on 2026-07-03.

Related: [[film-composer-module]]
