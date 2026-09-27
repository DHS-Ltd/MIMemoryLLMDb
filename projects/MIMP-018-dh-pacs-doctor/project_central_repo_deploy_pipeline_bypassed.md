---
name: project-central-repo-deploy-pipeline-bypassed
description: "Central repo has a real CI/CD deploy pipeline that was bypassed for months via manual SSH patches, causing prod drift; fixed via central ADR-0022, but a branch/main merge conflict remains open"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7ad2b62b-1f1e-4ab7-962f-abc08cda76e4
  modified: 2026-09-05T12:52:33.612Z
---

The central repo (`d:\Pacs_Viewer_Storage_Project`) has a working GitHub Actions CI/CD pipeline for the backend/admin-ui/patient-ui (`.github/workflows/deploy.yml` → `deploy/scripts/ci_deploy.sh`, self-hosted runner on the VM, `rsync -a --delete` from a chosen git ref, health check, auto-rollback — see central ADR-0011). Despite this, changes were repeatedly pushed to the VM by hand (`scp` of individual files, direct SSH edits) instead of through the pipeline — discovered 2026-09-05 while fixing [[project_doctor_reports_live]] being missing from prod.

**Why this matters:** hand-patching caused the VM's real `index.js` and `admin-doctor-users.js` to match **no git ref at all** — not `main`, not any branch. Diagnosing "why doesn't X work in prod" required SSHing in and diffing files directly against every local branch, because `git log` could no longer answer "what's actually running." This is now documented as central repo ADR-0022 ("Backend changes reach production only through the deploy.yml pipeline — never by hand-editing files on the VM").

**Open follow-up, deliberately not done 2026-09-05:** `feat/patient-pdf-redesign-settings` (the branch the doctor-reports fix was deployed from) still needs merging into `main`, and it is **not a simple fast-forward**. History: this exact branch name was already merged into `main` once before via PR #2 (at commit `f560ceb`), then kept accumulating new commits afterward (including the doctor-reports work). Meanwhile `main` independently grew its **own, separately-implemented** Business Admin Role/Capability system (commit `9cec191`, PR #6) — while the branch *also* has its own independent implementation of the same feature (`d6fcec2`), which the doctor-reports code depends on. Merging will require reconciling two different implementations of the same auth system in `middleware/auth.js` and `admin-users.js`, not just resolving text conflicts. Needs its own dedicated session — do not attempt as a quick tail-end task.

**How to apply:** before assuming any central-repo backend file's state from git, verify — this project's history shows git and prod can and did diverge silently for months. When picking up the branch-merge follow-up, expect real semantic conflicts in the Role/Capability code, not just line conflicts.
