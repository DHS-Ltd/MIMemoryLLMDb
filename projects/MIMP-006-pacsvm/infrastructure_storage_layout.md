---
name: infrastructure-storage-layout
description: "PACS host disk layout, VHDX location, D: drive constraint (Immich blocks move), migration runbooks, and disk-alert setup. Last verified 2026-06-12."
metadata: 
  node_type: memory
  type: project
  originSessionId: dc36e067-b754-4f66-b127-5467b8ee3ecb
---

# PACS Host Storage Layout — 2026-06-12

## Current layout

Everything lives on the **C: drive** inside a single Dynamic VHDX:

```
C:\Hyper-V\PacsVM\PacsVM.vhdx   ~128 GB on disk / 700 GB max
  └─ (inside VM) /dev/mapper/ubuntu--vg-ubuntu--lv  590 GB, ~33 GB used
       ├─ /srv/pacs/data/orthanc   (bind mount — DICOM pixel data)
       ├─ /srv/pacs/data/minio     (bind mount — object storage)
       └─ Postgres                 (Orthanc index + app DB)
```

No named Docker volumes — all persistent data is bind-mounted onto the VM's single root FS inside the VHDX.

## Host drive free space (2026-06-12)

| Drive | Total | Free | Notes |
|---|---|---|---|
| C: | 975.7 GB | **653.4 GB free** | PACS VHDX lives here |
| D: | 2748.4 GB | **208.1 GB free** | `D:\Images` = 2.5 TB Immich — **do NOT touch** |

⚠️ **Do NOT migrate PACS to D: yet.** D: is ~92% full (Immich). C: has 653 GB free — more headroom. Only proceed after Immich's `D:\Images` is relocated/trimmed or new disks added.

## Migration runbooks (ready to execute when D: has room)

**Method A — Move whole VM live (no downtime):**
```powershell
Move-VMStorage -VMName PacsVM -DestinationStoragePath "D:\Hyper-V\PacsVM"
# Rollback: Move-VMStorage -VMName PacsVM -DestinationStoragePath "C:\Hyper-V\PacsVM"
```
Cons: OS + data land together on D:.

**Method B — Data-only second disk (recommended long-term):**
1. Host: `New-VHD "D:\Hyper-V\PacsVM\pacs-data.vhdx" -Dynamic -SizeBytes 1500GB` + `Add-VMHardDiskDrive`
2. VM: `mkfs.ext4 /dev/sdb` → stop stack → `rsync -aHAX /srv/pacs/data/ /mnt/pacsdata/` → mount as `/srv/pacs/data` → fstab UUID entry → restart stack → verify → delete old copy
3. Bind mounts (`/srv/pacs/data/orthanc`, `/srv/pacs/data/minio`) need **no changes** — parent dir is the new mount point.
4. Grow later: `Resize-VHD -SizeBytes 2500GB` (host) + `resize2fs /dev/sdb` (guest)

Full runbook in `docs/tutorial/Move_PACS_Storage_C_to_D_and_Disk_Alerts.md`.

## Disk-space alerts

**Windows host** — `C:\Scripts\Check-DiskSpace.ps1` scheduled hourly (Task Scheduler). Fires when C:/D: free < 100 GB or VHDX > 600 GB. Writes to Windows Event Log source `PACS-DiskMonitor` (EventId 4001). Email hook is in the script but commented out.

**VM (guest)** — `/usr/local/bin/check-pacs-disk.sh` in root crontab hourly. Fires at ≥ 85% usage on `/`. Logs via `logger -t pacs-disk`.

Full alert scripts in `docs/tutorial/Move_PACS_Storage_C_to_D_and_Disk_Alerts.md`.

## Alert thresholds

| Signal | Warn at | Reason |
|---|---|---|
| C: free | < 100 GB | VHDX can still grow to 700 GB max |
| PACS VHDX size | > 600 GB | Approaching max |
| VM root FS | ≥ 85% | Orthanc/Postgres need slack |
| D: free (post-move) | < 150 GB | Early warning before DICOM growth stalls |

**Why:** Advance notice (weeks of runway) before ingestion fails or disk fills silently.

**How to apply:** Before recommending PACS data migration to D:, check if D: is freed first. Default advice = stay on C: until D: headroom is confirmed.
