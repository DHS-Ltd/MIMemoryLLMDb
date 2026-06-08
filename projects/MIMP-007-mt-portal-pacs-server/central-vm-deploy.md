---
name: central-vm-deploy
description: "How to connect to and rebuild/redeploy the DH PACS Central VM (dh-pacs-central) from this workstation project — SSH, compose layout, per-service rebuild, migrations"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2357d0a8-f0ff-4914-be71-8f40e86b4086
---

How to deploy changes to **DH PACS Central** (companion repo `D:\Pacs_Viewer_Storage_Project`,
running on the central VM). Verified working 2026-06-06 by hot-fixing the admin-ui `LinkModeToggle`.

## Connect
- From this Windows host: **`ssh pacsvm`** (alias) — key auth works fine from **PowerShell** OpenSSH
  (`ssh -o BatchMode=yes pacsvm "..."`, `scp ... pacsvm:...`). Note: the central project's memory
  says key auth is "unreliable from Bash" — so use the **PowerShell tool**, not the Bash tool, for ssh/scp.
- VM: Ubuntu `dhserver`, user `maidul` (passwordless sudo), LAN `192.168.1.10`, Tailscale `100.118.47.99`.
  Key: `C:\Users\Administrator\.ssh\pacsvm_ed25519`. VM login password is NOT stored (user holds it; key auth avoids it).

## Layout on the VM
- Compose stack: **`/srv/pacs/compose/docker-compose.yml`** (`cd /srv/pacs/compose` to run compose).
- Build contexts are **plain directories, NOT git repos** — synced by scp from the Windows working
  copy. Path map (Windows repo -> VM):
  - `deploy/backend`   -> `/srv/pacs/backend`   (service `backend`, image built there)
  - `deploy/admin-ui`  -> `/srv/pacs/admin-ui`  (service `admin-ui`, `pacs-admin-ui:latest`)
  - `deploy/patient-ui`-> `/srv/pacs/patient-ui`(service `patient-ui`)
  - `deploy/config`    -> `/srv/pacs/config`    (mounts: nginx conf, postgres init/migrations, orthanc)
  - ohif-fork -> `/srv/pacs/ohif-fork`. Other services use upstream images (postgres:15-alpine, minio, orthanc, nginx:alpine).

## Deploy a code change (per service)
1. **scp** the changed file(s) Windows -> VM, e.g.
   `scp "D:\Pacs_Viewer_Storage_Project\deploy\admin-ui\src\components\LinkModeToggle.tsx" pacsvm:/srv/pacs/admin-ui/src/components/LinkModeToggle.tsx`
2. Rebuild **with --no-cache** (the `COPY . .` layer caches host edits otherwise — documented gotcha):
   `ssh pacsvm "cd /srv/pacs/compose && docker compose build --no-cache <service>"`
3. Recreate: `ssh pacsvm "cd /srv/pacs/compose && docker compose up -d <service>"`; check `docker compose ps <service>`.
4. Browser: **hard-reload (Ctrl+F5)** — Vite hashes bundle names but `index.html`/Cloudflare may cache.
- admin-ui/patient-ui Dockerfiles run `tsc && vite build`, so a green build also type-checks the change.
- nginx **conf** changes are NOT picked up by `compose up -d nginx` — run `docker compose exec nginx nginx -s reload`.

## DB migrations (for the MT-gated work: `2026-06_p1_mt_push.sql`)
- DB is Postgres container, db/user `pacs`/`pacs` (password in the **central** project memory
  `reference_postgres_credentials`). Apply:
  `scp deploy/config/postgres/migrations/<file>.sql pacsvm:/srv/pacs/config/postgres/migrations/`
  then `ssh pacsvm "cd /srv/pacs/compose && docker compose exec -T postgres psql -U pacs -d pacs -f /<mounted-path>/<file>.sql"`
  (confirm the mount path; migrations dir is bind-mounted under the postgres service). `init.sql` only
  runs on a fresh volume, so existing DBs need the migration applied explicitly.

## Companion-repo deploy note + KNOWN DRIFT
`/srv/pacs/*` is not git, so a scp'd hot-fix lives only on the VM until the source is committed in
`D:\Pacs_Viewer_Storage_Project` (branch `feat/safety-mt-gated`). Commit there so a future full sync
doesn't lose it.

**The VM source can lag committed HEAD — always verify the deployed file before assuming a fix is
live.** Found 2026-06-06: the `link_mode` PATCH support in `sites.js` was committed (`d82b1aa`) but
the VM's `/srv/pacs/backend/src/routes/sites.js` still had the OLD handler (no `link_mode`), so the
admin link-mode toggle silently never persisted. Fixed by scp'ing `sites.js` + rebuilding `backend`.
Lesson: `grep` the actual VM/container file (`docker exec pacs-backend grep ... /app/src/...`) rather
than trusting "deployed from branch X".

### Audit result (2026-06-06) — drift in BOTH directions
Compared VM `/srv/pacs/*` vs git HEAD via git blob hashes (`git hash-object` on the VM).
- **backend**: all 36 files now == HEAD (after the `sites.js` fix). Clean.
- **admin-ui**: == HEAD except `LinkModeToggle.tsx`, where the VM is AHEAD (my hotfix). Now committed
  (`1125ab1`).
- **patient-ui**: was UNTRACKED in git (live but never committed); VM == working tree. Now committed
  (`38fb8c5`).
- **config — hash mismatches, but on inspection mostly cosmetic (RESOLVED 2026-06-06):** pulled the
  VM copies and diffed:
  - `nginx/viewer.html` — VM only collapsed CSS onto single lines; functionally identical. Kept the
    repo's tidier version (discarded the pull). Harmless cosmetic hash drift remains.
  - `ohif/app-config.js` — VM merely stripped comments; every config VALUE identical. Kept the repo's
    documented version (the comments capture real OHIF/Orthanc DICOMweb gotchas). Cosmetic drift remains.
  - `orthanc/orthanc.json` — REAL diff: the live box does NOT set `IndexConnectionsCount`/`TransactionMode`/`Lock`
    that the repo had (so live runs on Orthanc defaults, incl. `Lock` default true). User ruled the LIVE
    box canonical -> committed the live version (`625664d`); repo now == production.
  - `postgres/init.sql` — VM, HEAD, and working tree all differ (working tree has my MT-push edit). Left
    as-is; low runtime risk (init.sql only runs on a fresh volume). The repo's init.sql does not fully
    reflect the live DB schema history.
  - `nginx/nginx.conf` — VM == working tree but uncommitted (a pre-existing, not-mine working change).
  - Lesson: a hash mismatch is NOT necessarily dangerous — diff before acting; here 2 of 3 were
    cosmetic. Still, **diff the VM copy before rebuilding nginx/ohif/orthanc from the repo.**
- **Migrations are NOT kept on the VM** — `/srv/pacs/config/postgres/migrations/` does not exist; the
  p0_5 migration was applied ad-hoc. So apply `2026-06_p1_mt_push.sql` by scp'ing to a temp/home path
  and `docker compose exec -T postgres psql -U pacs -d pacs -f <path>` — NOT via a bind mount.

Related: [[dh-pacs-program-status]], [[dh-pacs-mt-push-architecture]].
