---
name: feedback-deploy-pipeline-and-pr-base-gotchas
description: "main is stale vs production; deploy.yml needs a full SHA or branch name not a short SHA; a PR based on main can silently bundle an unrelated unmerged branch's whole history"
metadata:
  node_type: memory
  type: feedback
  originSessionId: d06b5724-4ad2-45a7-84b0-94cfc0a2baf2
  modified: 2026-09-27T18:53:48.772Z
---

**`origin/main` is not what's running in production — don't assume it.** Deploys here go through `deploy.yml` (`workflow_dispatch`, arbitrary `ref` input, defaults to `main` but is routinely overridden), and in practice releases have shipped straight off a feature branch before it ever merged to `main` (e.g. Doctor DH Viewer M1 device-token routes, the `/desk-updates/` nginx block, and JPEG-LS ingest transcoding were all live on the VM while missing from `main` entirely, discovered 2026-09-28 while starting the API-exposure security fix).
**Why:** building a hotfix on `origin/main` and deploying it would have silently regressed those already-live features.
**How to apply:** before branching for any change destined for production, confirm the real baseline by checking the VM directly — `docker inspect <container> --format '{{.Image}}'` then match that sha256 against `docker images` tags on the VM (the tag *is* the git commit the image was built from), not `git log origin/main`. Branch from that commit.

**`deploy.yml`'s `ref` input must be a full 40-char SHA or a branch/tag name — a short SHA (e.g. `e71f688`) fails.** `actions/checkout@v4` does `git fetch ... +refs/heads/<ref>*:...` when the ref isn't a recognized full SHA, which silently 404s for an abbreviated hash after 3 retries. The workflow run shows `in_progress` then fails at the checkout step with a bare `git failed with exit code 1` — easy to misread as an infra problem rather than a ref-format mistake. Always pass the branch name, or `git rev-parse HEAD` for the full SHA.

**A PR's diff is base..head, not "what this branch added" — if `head` was cut from a commit that's already many commits ahead of `base`, the PR silently includes all of that gap.** Cutting a hotfix branch from a live-but-unmerged feature branch's tip (per the gotcha above) and opening a PR against `main` produces a PR that looks like it's about the hotfix but whose merge would actually fold months of that unrelated feature branch into `main`.
**Why:** almost merged PR #7 into `main` this way before catching it — would have force-merged `feat/patient-pdf-redesign-settings`'s entire unmerged history under the guise of "merge the security fix."
**How to apply:** when a fix/hotfix branch must be cut from a non-`main` tip, either base the PR against that real parent branch (what was actually done for PR #8, based on `fix/close-unauthenticated-routes` rather than `main`) or deploy directly by SHA/branch via `workflow_dispatch` without merging at all, and leave the `main` merge question for later, separately. Related: [[project_security_api_exposure_remediation]].
