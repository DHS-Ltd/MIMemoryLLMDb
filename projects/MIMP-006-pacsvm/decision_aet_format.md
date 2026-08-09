---
name: decision-aet-format
description: "AET format decision (2026-06-02): new sites use SITE${nnn}_DHPACS (3-digit, underscore). Legacy SITExx_ORTHANC sites stay as-is. Allocator spans both patterns."
metadata: 
  node_type: memory
  type: project
  originSessionId: d08a4847-734e-47e9-8ccf-1d4ea7106f45
aliases: [decision-aet-format]
---

## Decision (2026-06-02)

New sites are assigned AETs in the format **`SITE${nnn}_DHPACS`** — 3-digit zero-padded sequence, underscore separator, `DHPACS` suffix. Example: `SITE004_DHPACS`.

Legacy sites `SITE01_ORTHANC` (Ibn Sina) and `SITE03_ORTHANC` (Cumilla Medical College) are **NOT renamed** — they keep the old 2-digit `_ORTHANC` format permanently.

**Why:**
- `DHPACS` brand-aligns with the product name (DH PACS) instead of leaking the underlying server implementation (Orthanc).
- 3 digits gives headroom past 99 sites.
- Underscore (not hyphen) keeps full DICOM AE Title vendor compatibility — some hospital PACS forwarders reject hyphens in AETs.
- Renaming live workstations was rejected as too costly: it requires editing each site's `site-config.json`, restarting NSSM, and re-coordinating with hospital IT to update their PACS destination AET.

**How to apply:**
- For **new** site onboarding: nothing to do — allocator in [deploy/backend/src/routes/sites.js](../../../../Pacs_Viewer_Storage_Project/deploy/backend/src/routes/sites.js) mints the new format automatically.
- For the **two existing sites** (SITE01, SITE03): do not touch the AET. Their `site-config.json`, hospital PACS destinations, patient records, and audit history all reference the old AET — leave aligned.
- If asked to "rename SITE01 to the new format": push back. The cost is hospital IT change-management, not code. See [[feedback-site-onboarding-lessons]].

---

## Implementation

**File changed:** [deploy/backend/src/routes/sites.js](../../../../Pacs_Viewer_Storage_Project/deploy/backend/src/routes/sites.js) (POST `/api/admin/sites` allocator)

The allocator queries across **both** patterns to determine the next sequence number, so SITE03_ORTHANC bumps the next mint to `SITE004_DHPACS` (not `SITE001_DHPACS`):

```sql
WHERE aet ~ '^SITE[0-9]+_(ORTHANC|DHPACS)$'
ORDER BY (SUBSTRING(aet FROM '^SITE([0-9]+)_'))::int DESC
LIMIT 1 FOR UPDATE
```

Template: `SITE${String(next).padStart(3, '0')}_DHPACS`.

**No other code changes needed** — AET is treated as an opaque string downstream:
- `app.sites.aet VARCHAR(20)` — fits (`SITE999_DHPACS` is 14 chars).
- `app.patients.site_id VARCHAR(20)` — same.
- [deploy/scripts/autolink.lua](../../../../Pacs_Viewer_Storage_Project/deploy/scripts/autolink.lua) reads `RemoteAET` metadata verbatim, no format assumption.
- [deploy/backend/src/templates/instructions.js](../../../../Pacs_Viewer_Storage_Project/deploy/backend/src/templates/instructions.js) interpolates `site.aet` into onboarding docs verbatim.
- Admin UI displays the AET as a string only.

---

## Constraints respected

- **DICOM AE Title cap:** 16 chars. `SITE999_DHPACS` = 14 chars ✓.
- **Character set:** `[A-Z0-9_]` only — underscore is safe across all enterprise PACS vendors. Hyphens were considered and rejected.
- **`CENTRAL_AET = PACS_CENTRAL`** is a separate identity for the central receiver — not affected by this decision (still set in [deploy/config/orthanc/orthanc.json](../../../../Pacs_Viewer_Storage_Project/deploy/config/orthanc/orthanc.json) and [deploy/compose/docker-compose.yml](../../../../Pacs_Viewer_Storage_Project/deploy/compose/docker-compose.yml)).

---

## Outstanding doc churn (low priority)

These files reference `SITExx_ORTHANC` in templates / examples and are now stale for new-site onboarding. Not blocking — they describe past state truthfully and the live onboarding doc is server-rendered from `instructions.js`:

- `docs/PacsBuild/DH_PACS_WORKSTATION_BUILD_MANUAL.md`
- `docs/tutorial/NEW_SITE_ONBOARDING_GUIDE.md`
- `docs/tutorial/site-config.json`
- `docs/260525_ServerSiteDocs/ADMIN_PANEL_USER_MANUAL.md`
- `docs/Site01Docs/*` (historical SITE01 build, leave as-is)

Update these on next docs pass, or when onboarding SITE004.
