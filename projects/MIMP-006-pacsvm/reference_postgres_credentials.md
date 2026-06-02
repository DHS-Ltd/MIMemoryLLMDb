---
name: PostgreSQL Credentials (Central Server)
description: Actual postgres user/db inside the pacs-postgres container is `pacs`/`pacs` — NOT `maidul` as the CLAUDE.md .env example suggests
type: reference
originSessionId: 77066828-a207-40dd-aa16-827a71eb1050
---
**Container:** `pacs-postgres` on the central VM (192.168.1.10)

**Verified 2026-05-19 via `docker exec pacs-postgres env | grep POSTGRES`:**
- `POSTGRES_USER=pacs`
- `POSTGRES_DB=pacs`
- `POSTGRES_PASSWORD=dhmiPost` (confirmed 2026-05-25 — password was changed via ALTER USER, .env had stale value `uhBUaIbD7fONv3nwYpT1Vs8Q`; .env now corrected to dhmiPost and DATABASE_URL=postgresql://pacs:dhmiPost@postgres:5432/pacs added)

**Correct psql invocation from the VM:**
```
docker exec -it pacs-postgres psql -U pacs -d pacs
```

**Gotcha:** The `.env File` example block in [CLAUDE.md](../../../../d--Pacs-Viewer-Storage-Project/CLAUDE.md) shows `POSTGRES_USER=maidul`, which is stale — that role does **not** exist in the cluster, so any `-U maidul` query fails with `FATAL: role "maidul" does not exist`. The `maidul` name is correct **only** as the SSH login on the host VM (see `project_vm_credentials.md`); it is not a database role. If updating CLAUDE.md, change the .env example to `POSTGRES_USER=pacs`.
