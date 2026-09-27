---
name: feedback-production-deploy-verification
description: "How this user wants risky/production work handled — grill thoroughly before building, verify functionality with real executable tests (not just a read-through) even without local infra, confirm deploy scope explicitly before touching the live VM"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d7ac5143-dca4-4bdc-958f-0dff1b91acfd
  modified: 2026-09-05T12:52:53.395Z
---

Before implementing a cross-repo feature ported from another of the user's projects, run a full `/grill-with-docs`-style interview resolving each domain/architecture fork one question at a time (with a recommendation) before writing code. This user confirmed every fork explicitly (entity naming, data anchoring, PDF generation approach, permissions model, catalog moderation) rather than wanting assumptions made silently — the grill session directly shaped the schema (see [[project-doctor-reports-live]]).

**Why:** The user said "grill me extensively" up front and engaged substantively with every question, correcting scope (e.g., insisted real medication prescribing, not just a read-only radiology report) in ways that would have produced a wrong data model if assumed.

**Verification standard:** when asked to "verify functionality," build something that actually executes the code path, not just a code read-through — even with no local Docker/Postgres available. An in-memory fake-`db` module injected via `require.cache`, wired into the *real* Express routers + JWT middleware, running through `node --test`, caught two real bugs (a `℞` Unicode glyph pdfkit couldn't render, and a missing "days" unit) that a static read would have missed. Also generate a real sample artifact (the PDF) and visually inspect it via the Read tool's PDF support — don't just assert byte length.

**Production deploy — CORRECTED 2026-09-05, see [[project_central_repo_deploy_pipeline_bypassed]]:** earlier guidance here said to prefer scoped manual `scp` deploys over pushing to `main` when a branch had unrelated uncommitted WIP. That was wrong and is exactly the practice that caused a real incident — months of manual SSH patches left the VM matching no git ref at all, which directly caused Doctor Reports to silently 404 in prod for weeks. The corrected approach: `deploy.yml`'s `workflow_dispatch` trigger accepts **any** git ref, not just `main` — so a scoped fix can be committed to a small branch/commit (excluding the unrelated WIP, verified via careful `git diff`/byte-for-byte comparison against what's actually live on the VM to tell "already deployed, just uncommitted" apart from "genuine WIP") and deployed via `gh workflow run deploy.yml -f ref=<branch>`, getting the real pipeline's health-check + auto-rollback safety net instead of a blind manual patch. Never `scp` individual backend files or SSH-edit them directly again (central ADR-0022 now codifies this).

**How to apply:** For any new cross-repo feature request in this project pairing (`dh-pacs-doctor` + central `Pacs_Viewer_Storage_Project`): grill first, build a real test harness before claiming "verified," always ask before touching the production VM or triggering a deploy — even if a prior message in the same session sounded like a general go-ahead — and when a fix is scoped, deploy it through the official pipeline against a scoped branch, never by hand.
