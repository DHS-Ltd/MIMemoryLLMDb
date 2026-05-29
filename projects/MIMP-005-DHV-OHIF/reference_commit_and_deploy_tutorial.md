---
name: reference-commit-and-deploy-tutorial
description: In-repo manual at Docs/Tutorial/COMMIT_AND_DEPLOY.md is the canonical end-to-end deploy workflow — local edit → commit (PowerShell) → push → SSH VM → docker compose → cache-bust
metadata: 
  node_type: memory
  type: reference
  originSessionId: dae93935-5b9a-4c53-a297-203db49c3279
---

**Where:** [d:\ohif-fork\Docs\Tutorial\COMMIT_AND_DEPLOY.md](Docs/Tutorial/COMMIT_AND_DEPLOY.md) (in-repo, on `dhs-main`).

**What it covers:**
- The 3-place mental model (Windows dev → GitHub → VM → Cloudflare CDN) and how the steps differ in each.
- Local edit + `yarn dev` smoke test workflow.
- Commit discipline — one logical change per commit, conventional message format, the PowerShell-vs-bash rule for the husky hook, no `--no-verify`.
- Push via the `github-ohif` SSH alias to `DHS-Ltd/ohif-viewer-dhs`.
- VM deploy: `ssh pacsvm` → `/srv/pacs/ohif-fork && git pull` → `/srv/pacs/compose && docker compose build ohif && docker compose up -d ohif`.
- The mandatory **cache-bust sequence** after every deploy: Service Worker "Relaunch to update" badge → DevTools SW unregister → Cloudflare CDN purge. See also [[project-v11-palette-shipped]] §"Operational gotcha."
- Verification with AYESHA's gold-path token URL.
- Optional version tagging (`docker tag pacs-ohif-dhs:v1 :v1.2`) AFTER verification, not before.
- Rollback paths — re-tag a previous image, or `git revert` + rebuild.
- Troubleshooting table for the common failure modes seen in earlier sessions: Node/Yarn PATH issues, husky hook failures, SSH key/alias problems, divergent-branch handling, stale Docker layers, missing "Relaunch to update" badge.

**When to consult:**
- Anyone shipping a change from this fork — point them here first instead of re-deriving the workflow.
- When a deploy "looks broken" — the cache-bust section probably solves it (don't rebuild with `--no-cache` until cache-bust has been tried).
- When something feels off with git state (ahead/behind/diverged) on `dhs-main` — see the divergence handling note.

**When NOT to consult:**
- Pure code-change recipes — those live in topic-specific docs ([[reference-tutorial-docs]] for colors, `Docs/TOOLBAR_TRIM.md` for toolbar layout).
- PACS-repo backend changes — those have a separate deploy path (`/srv/pacs/backend`, not `/srv/pacs/ohif-fork`).

**Maintenance:** If the deploy workflow changes (e.g., GitHub Actions CI added per ImplementationSteps D5, new VM, different remote), update the doc and bump the "Stage 4" instructions. Keep the troubleshooting table appended-to as new failure modes are observed.
