---
name: feedback-db-migration-ahead-of-code-deploy
description: "A prod DB can already have a migration/rows applied while the code that uses them was never deployed — check both independently when a 'feature is missing' report turns out surprising"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 54033d90-dd43-40a3-9da6-63d13e76bea5
  modified: 2026-08-30T12:17:21.918Z
---

When a built feature appears to be "missing" in production, check the deployed **code** and the deployed **database** as two independent facts — don't assume DB schema state implies code deploy state, or vice versa. This project's `ci_deploy.sh` deliberately never runs SQL migrations (ADR 0011); migrations get applied by hand, separately from `docker compose build`/`up`. That split means it's possible for someone to run a migration and even insert real rows (e.g. a new admin account) against production, while the corresponding backend/frontend code sits unmerged on a feature branch for weeks — and nothing in the DB state hints at that gap.

**Why:** Investigating "can't see the Business Admin creation UI" (2026-08-30) led to assuming the feature was "half-missing" (just a hidden nav item) when actually the entire feature — new auth model, new routes, new UI — had never been deployed at all, despite the DB already having the new schema *and* a real business_admin account row with a password hash set. Confirmed by `docker exec`-ing into the live `pacs-backend`/`pacs-admin-ui`/`pacs-nginx` containers and diffing what's actually running against what the git history claims — the two had diverged by 7 weeks and 1 whole PR. See [[business_admin_role_live]] for the full incident.

**How to apply:** When a user reports a built feature "isn't showing" or "isn't working" in this project, don't trust `git log` alone to say what's live. Verify directly: `docker exec` into the relevant container and check for a specific file/string/export that only exists in the new code (e.g. `grep -n 'requireRole' auth.js`, or grep the built JS bundle for a literal UI string). Cross-check that against the DB state (`\d table_name`, `SELECT` the relevant rows) separately — a match on one says nothing about the other. If they disagree, the fix is a code deploy (`Deploy` GH Actions workflow, `workflow_dispatch`, self-hosted runner) — cherry-pick just the needed commit onto a fresh branch off latest `origin/main` first if the source branch also carries unrelated in-flight work, rather than merging everything.
