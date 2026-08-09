---
name: cicd-pipeline-live
description: "dh-pacs-central CI/CD pipeline (ADR 0011) is built and verified live as of 2026-06-17 — what exists, how to use it, and the one real failure hit during first deploy"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4a1b770e-8ea6-4b4c-a188-2bed29f37d05
aliases: [cicd-pipeline-live, cicd_pipeline_live, project-cicd-pipeline-live]
---

The pipeline designed in [[project_marketing_site_central_integration]] / ADR 0011 is built and working in production as of 2026-06-17.

**What exists:**
- Self-hosted GitHub Actions runner installed on the VM at `/srv/actions-runner`, systemd service `actions.runner.DHS-Ltd-dh-pacs-central.pacs-vm-runner.service`, runs as `maidul`.
- `.github/workflows/ci.yml` — build+test on every push to `main`, GitHub-hosted runners (not the VM), deliberately does NOT run `deploy/scripts/test_e2e.py` (that script inserts a real `TEST^PATIENT` study into production Orthanc/Postgres — it stays a manual diagnostic tool only).
- `.github/workflows/deploy.yml` — manual `workflow_dispatch` only, `ref` input defaults to `main`, runs on the self-hosted runner.
- `deploy/scripts/ci_deploy.sh` — the actual deploy logic: validates nginx config first (`nginx -t` against a candidate, before any reload), syncs `deploy/{backend,admin-ui,patient-ui}/` AND `deploy/compose/docker-compose.yml` to the VM, builds, SHA-tags images, recreates containers, reloads nginx, health-checks (`/api/health`, `/admin/`, `/patient/`), auto-rolls-back to the previous recorded-good SHA on failure. Last known-good SHA tracked in `/srv/pacs/.last_deployed_sha`. Keeps last 5 SHA-tagged images per service.
- Manual rollback = re-run `deploy.yml` with `ref` set to an older commit SHA (a normal forward deploy of older code, not a special code path).

**Real failure hit on the first production run (and fixed immediately after):** the script synced `deploy/backend/`, `deploy/admin-ui/`, `deploy/patient-ui/` to the VM but never synced `deploy/compose/docker-compose.yml` itself. The VM's compose file was stale, so `backend` built under its old auto-generated image name (`compose-backend`, derived from the `/srv/pacs/compose` directory name) instead of the explicit `pacs-backend:latest` name added this session — the SHA-tag step then failed with "No such image: pacs-backend:latest". Production was completely unaffected (containers were never recreated before the failure — confirmed via unchanged container uptimes), but it surfaced a real gap: a failure between the nginx backup and the explicit rollback branch had no safety net. Fixed by (1) syncing the compose file every deploy, and (2) adding a bash `trap ... EXIT` that restores the nginx config from backup on ANY unexpected exit, not just a failed health check. Second run succeeded cleanly end-to-end.

**Why:** Anyone touching `ci_deploy.sh` should know the compose file is part of the deploy footprint now (not just app source folders), and that the EXIT trap is load-bearing — don't remove it without understanding why it's there.

**How to apply:** To deploy: push to `main` (CI runs automatically), then manually trigger `deploy.yml` via `gh workflow run deploy.yml -f ref=main` or the GitHub UI when ready to go live. To roll back: trigger `deploy.yml` with `ref` set to the desired older commit SHA. Don't add new services to the deploy footprint without also adding them to `ci_deploy.sh`'s `SERVICES` list and `IMAGE_NAME` map.

**Second-machine setup — resolved, not needed.** User clarified their second machine only runs `dh-pacs-website` (separate repo, already deploys automatically via Cloudflare Workers Builds — no action needed there). The SSH-key/clone instructions were for `dh-pacs-central` specifically; user confirmed they don't need to edit central's code from that machine, so this task was dropped entirely, not deferred.

**Scope boundary explained to user (important — don't assume this pipeline covers more than it does):** this pipeline ONLY touches `backend`, `admin-ui`, `patient-ui`, and `nginx.conf` from `dh-pacs-central`. Everything else on the VM is unaffected and still deploys exactly as before:
- `ohif` (DHV viewer, repo `ohif-viewer-dhs`) — still 100% manual: SSH in, `git pull origin dhs-main` in `/srv/pacs/ohif-fork`, `docker compose build ohif && up -d ohif`.
- `doctor-ui` (repo `dh-pacs-doctor`) — still 100% manual, same shape (sync to `/srv/pacs/doctor-ui`, build, up -d).
- `dh-pacs-website` — automated, but entirely via Cloudflare Workers Builds, outside this VM/pipeline.
- `postgres`/`minio`/`orthanc`/`orthanc-demo`/`cloudflared` — stock images, no custom source; their config files (`orthanc.json`, `init.sql`) are NOT wired into the pipeline the way `nginx.conf` is — still manual.

**If OHIF or doctor-ui should get the same automatic treatment later:** the self-hosted runner is currently registered at the **repo level** to `dh-pacs-central` only — it is not visible to `ohif-viewer-dhs` or `dh-pacs-doctor`. Extending coverage would need either an org-level runner (visible to all `DHS-Ltd` repos) or a second dedicated runner, plus a `deploy.yml`-style workflow added to each of those repos. Not done — flagged as a deliberate future option only, user has not requested it.
