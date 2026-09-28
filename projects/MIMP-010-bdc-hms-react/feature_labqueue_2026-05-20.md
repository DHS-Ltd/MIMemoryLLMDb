---
name: feature-labqueue-2026-05-20
description: "LabQueue overhaul 2026-05-20 — test name badges, Delivered tab, drawer for delivered cards, removed Result Uploaded intermediate step"
metadata: 
  node_type: memory
  type: project
  originSessionId: eec81d51-6923-4606-b9d3-db292eb6c697
---

## LabQueue — what changed (2026-05-20)

### 1. Test name badges instead of count
- `src/pages/lab/LabQueue.jsx` — `InvoiceCard` renders `invoice.tests[]` as pill badges
- Falls back to count-only if `tests` array is empty (backward compat with stale cache)
- GAS already returns `tests: [{ testName, lineAmount }]` in `getLabInvoices` response

### 2. Delivered tab / "সম্পন্ন"
- STATUS_CONFIG now has `'Delivered'` entry (`tabKey: 'delivered'`, no button)
- TABS includes `{ key: 'delivered', label: 'সম্পন্ন' }`
- Delivered cards get a teal urgency stripe (`bg-[#00897B]`) instead of red overdue — uses `isDelivered` flag to override `urgencyLevel()`

### 3. Delivered card click → ResultDrawer (not blank page)
- `isDrawerStatus` in `InvoiceCard` includes `'Delivered'`
- `ResultDrawer.jsx`: `isModificationMode = workflowStatus === 'Result Uploaded' || workflowStatus === 'Delivered'`
- Drawer title for Delivered: "ফলাফল দেখুন / সংশোধন"
- Modification mode shows single "সংশোধন সংরক্ষণ করুন" button, submits `status: null` → preserves Delivered

### 4. 'Result Uploaded' intermediate step REMOVED
- Removed from STATUS_CONFIG and TABS — 'Result Uploaded' is no longer a visible status in the queue
- ACTIVE_STATUSES (derived from STATUS_CONFIG keys) no longer includes 'Result Uploaded', so those invoices are filtered out if they exist
- `ResultDrawer` "ফলাফল সম্পন্ত করুন" button now submits `status: 'Delivered'` directly (was `'Result Uploaded'`)
- `LabDashboard.jsx` "আজ সম্পন্ন" stat now counts `workflowStatus === 'Delivered'` (was `'Result Uploaded'`)
- `dashUtils.js STATUS_DOT_COLOR` — removed `'Result Uploaded'` entry, updated `'Delivered'` dot color to `#00897B` (teal)
- `Sample Collected.nextStatus` in STATUS_CONFIG updated to `'Delivered'` (was `'Result Uploaded'`; never used since button opens drawer)

### Workflow after changes
```
Pending → [confirm sample] → Sample Collected → [open drawer, upload results] → Delivered
```
No intermediate 'Result Uploaded' state. "ফলাফল সম্পন্ত করুন" in the drawer marks directly as Delivered.

### Cache
- `LAB_INVOICES`: `{ ttl: null, storage: 'session' }` — in-memory, clears on page reload
- Cache is pre-warmed by `LabDashboard.jsx` (uses same `CACHE_KEYS.LAB_INVOICES`) — navigating from dashboard to queue serves data instantly
- After any mutation: `invalidateCache(CACHE_KEYS.LAB_INVOICES)` + `refetch()` pattern used throughout

**Why:** 'Result Uploaded' → Delivered manual confirmation step was not being used by lab staff. Removing it simplifies the workflow to one confirm-then-deliver step.
