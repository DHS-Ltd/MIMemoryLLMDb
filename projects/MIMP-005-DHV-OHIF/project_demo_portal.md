---
name: project-demo-portal
description: "Demo portal — architecture, files, deploy sequence, orthanc-demo data, UI customizations, and critical gotchas"
metadata: 
  node_type: memory
  type: project
  originSessionId: d494ecde-f466-4e79-bee9-6bbafb152a20
---

## Demo portal — status as of 2026-06-01

**FULLY LIVE and verified in browser.** Gateway at `https://pacs.dhsolutions.com.bd/demo` loads correctly. "Launch the Viewer →" opens DHS-branded OHIF with the self-hosted orthanc-demo study list. Images render on both desktop and mobile.

**CloudFront CDN replaced with self-hosted `orthanc-demo`** hosting 11 curated open-source DICOM studies (4 357 instances). No external CDN dependency.

---

## Architecture

```
dhsolutions.com.bd → pacs.dhsolutions.com.bd/demo (gateway page)
                           ↓ "Launch the Viewer →"
                   pacs.dhsolutions.com.bd/demo-viewer/
                           ↓
                   nginx proxies to ohif:80/
                   EXCEPT /demo-viewer/app-config.js → demo-app-config.js (nginx alias)
                           ↓
                   DHS-branded OHIF, showStudyList: true
                   datasource: /demo-dicom-web/ → orthanc-demo:8042/dicom-web/
```

`orthanc-demo` is a separate Orthanc instance inside `pacs-net`. It has **no exposed host port** — nginx is the sole gateway via `/demo-dicom-web/`.

---

## Files (PACS repo `D:\Pacs_Viewer_Storage_Project`)

| Action | File | Notes |
|---|---|---|
| CREATED | `deploy/config/orthanc/orthanc-demo.json` | No auth, no DICOM port, DICOMweb+CORS. **Must use `"Full"` metadata mode.** |
| CREATED | `deploy/config/nginx/demo.html` | Branded gateway: navy/teal palette, DHS logo, "Launch the Viewer" CTA |
| MODIFIED | `deploy/config/ohif/demo-app-config.js` | `/demo-dicom-web` datasource, `routerBasename: '/demo-viewer'`, `showStudyList: true`, DHS `whiteLabeling` |
| MODIFIED | `deploy/config/nginx/nginx.conf` | `/demo`, `/demo-viewer/app-config.js` (alias intercept), `/demo-viewer/` (proxy+sub_filter), `/demo-dicom-web/` (proxy to orthanc-demo) |
| MODIFIED | `deploy/compose/docker-compose.yml` | Added `orthanc-demo` service; nginx `depends_on` includes `orthanc-demo`; 2 new nginx volume mounts |

## Files (ohif-fork `d:\ohif-fork` — baked into the Docker image)

| File | What changed |
|---|---|
| `platform/app/src/routes/WorkList/filtersMeta.js` | Only modalities entry kept (used by desktop InputGroup); no filter bar shown to users |
| `platform/app/src/routes/WorkList/WorkList.tsx` | Default sort → mrn; mode buttons filtered to `['viewer', 'segmentation']` only |
| `platform/ui/src/components/StudyListFilter/StudyListFilter.tsx` | Stripped to simple "Study List · count" header only — no filter inputs, no sticky bar |
| `platform/ui/src/components/StudyListTable/StudyListTable.tsx` | Body background → `bg-bkg-full` (DHS dark) |
| `platform/ui/src/components/StudyListTable/StudyListTableRow.tsx` | Mobile card layout; desktop hover → teal |
| `modes/longitudinal/src/index.ts` | `displayName` → `'DH Dicom Viewer'` (was `'Basic Viewer'`) |
| `Docs/Demo_Build/ADDING_DICOM_TO_DEMO.md` | Self-service guide for uploading new studies |

---

## Demo viewer UI state (as of 2026-06-01)

**Study list header:** Single row — "Study List" (left), "11 Studies" count (right, teal). No filter inputs, no dropdowns. Clean.

**Table columns (desktop):** MRN · Description · Modality · Accession # · Instances (gridCol: 5+8+4+5+2=24). Patient Name and Study Date removed.

**Mobile card layout (< 640 px):**
```
›  Digital Left Mammogram Diagnostic       MG·SR
   BreastDx-01-0003
   43618148883895900                   4 instances
```
- Row 1: Description (bold teal) + Modality badge (right)
- Row 2: MRN (small, dim)
- Row 3: Accession (dim, left) + Instances (right)

**Mode buttons (both mobile + desktop):** Only two buttons appear when a study row is expanded:
- **DH Dicom Viewer** (longitudinal mode, routeName `'viewer'`)
- **Segmentation** (routeName `'segmentation'`)
All other modes (Microscopy, Preclinical 4D, TMTV) are suppressed.

**Brand colors:** Header + filter area uses `bg-secondary-dark` (`#1a3e3a` DHS teal). Row hover → `bg-secondary-dark`. Table body → `bg-bkg-full` (`#041c4a`).

---

## Critical gotcha: orthanc-demo metadata mode MUST be "Full"

`orthanc-demo.json` DicomWeb section **must** have:
```json
"StudiesMetadata": "Full",
"SeriesMetadata": "Full"
```

**Why:** `"MainDicomTags"` omits tag `00080016` (SOPClassUID). OHIF throws **"Display set is missing a sop class UID"** and images appear to load but viewports are blank. `"Full"` returns the complete DICOM tag set.

---

## Critical gotcha: nginx 502 after ohif container restart

After `docker compose up -d --no-deps ohif`, the outer nginx proxy caches the old container IP. The new container gets a new IP → nginx returns 502.

**Fix:** `docker exec pacs-nginx nginx -s reload` — forces nginx to re-resolve the `ohif` hostname via Docker DNS.

---

## orthanc-demo data inventory (as of 2026-05-31)

- **11 studies**, 51 series, 4 357 instances, ~5.7 GB on disk
- Downloaded via IDC (Imaging Data Commons) Python package
- Stored at `/srv/pacs/data/orthanc-demo/` on VM (persistent Docker volume)
- Self-service upload guide: `Docs/Demo_Build/ADDING_DICOM_TO_DEMO.md`

---

## Deploy sequence

**VM path mapping rule:** strip `deploy/` prefix, prepend `/srv/pacs/`:

```powershell
# Windows — commit + scp (PACS repo changes)
git add deploy/...
git commit -m "..."
git push origin main
scp deploy/config/orthanc/orthanc-demo.json maidul@pacsvm:/srv/pacs/config/orthanc/orthanc-demo.json
# etc.
```

```bash
# VM — ohif-fork source changes → rebuild image (ONE build at a time)
cd /srv/pacs/ohif-fork && git pull origin dhs-main
cd /srv/pacs/compose && docker compose build ohif
docker compose up -d --no-deps ohif
docker exec pacs-nginx nginx -s reload   # ← always do this after ohif restart
```

```bash
# VM — nginx/orthanc-demo config changes (no rebuild needed)
docker exec pacs-nginx nginx -t && docker exec pacs-nginx nginx -s reload
docker compose restart orthanc-demo      # only if orthanc-demo.json changed
```

---

## Critical nginx detail: sub_filter in /demo-viewer/

OHIF `index.html` always contains `src="/app-config.js"` (absolute path). Without intervention, the production Orthanc config loads.

```nginx
proxy_set_header Accept-Encoding "";
sub_filter 'src="/app-config.js"' 'src="/demo-viewer/app-config.js"';
sub_filter_once on;
```

**Scoped to `/demo-viewer/` only — zero effect on production viewer.**

---

## Marketing site link placement (not yet done)

1. Hero section — ghost "Try the Viewer Now →" button
2. Features section — "See it live → Try the interactive demo"
3. How It Works section — contextual inline link at step 3
