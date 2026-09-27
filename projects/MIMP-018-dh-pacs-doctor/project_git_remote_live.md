---
name: project-git-remote-live
description: "dh-pacs-doctor now has a GitHub remote (DHS-Ltd/dh-pacs-doctor, main) as of 2026-07-12 — previously this repo had zero remote and multiple sessions of production code that was deployed but never committed"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1478aad1-3cdb-44d9-8cbe-a6620ea7ca88
---

`origin` → `https://github.com/DHS-Ltd/dh-pacs-doctor.git`, default branch `main`. Local branch was renamed `master` → `main` to match when the remote was added.

**Why this matters:** before 2026-07-12, this repo had no remote at all. Two features (Doctor Reports Phase 10, and the frictionless patient list — see [[project_frictionless_patient_list_live]]) were designed, built, and deployed to production across sessions while sitting as uncommitted/untracked working-tree state, because there was nowhere to push and no established commit discipline. Both were finally committed as two scoped commits (not a single `git add -A` dump — reviewed via `git diff`/`git status` first, split so each commit stays independently buildable) once the user created the GitHub repo and asked for it to be pushed.

**Still true, not changed by having a remote:** this repo has **no CI/CD**. Pushing to `main` does not deploy anything — deploy is still the manual `scp` + `docker compose build/up` flow documented in `CLAUDE.md` § Deploy. Commit and deploy are two separate steps that don't trigger each other; watch for them drifting apart in future sessions (check `git status` / `git log` vs. what's actually running on the VM before assuming they match).

**How to apply:** for any future session in this repo — commit *and* push after source changes now that there's somewhere to push to, but still deploy manually and don't assume a push means the VM is updated. See [[feedback-production-deploy-verification]] for the broader "ask before touching the VM or a shared branch" rule this repo pairing operates under.
