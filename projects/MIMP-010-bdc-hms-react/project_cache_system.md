---
name: project-cache-system
description: "SWR cache system — useCachedApi is MANDATORY for all list/read pages. Full pattern, all cache keys, mutation handling, and pages already migrated."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4dba5c16-e93f-4b43-a287-220ba713f427
---

## Rule: All data pages MUST use `useCachedApi`

Never use `useEffect(() => { fetch(); }, [deps])` + `useState([])` for fetching list data. That pattern hits the slow GAS API (~2-3s) on every navigation. `useCachedApi` serves cached data instantly and revalidates silently.

This rule is also documented in the project `CLAUDE.md` under **Data Page Cache Rule**.

**How to apply:** When building any new page that loads a list or table, use `useCachedApi` from day one. If you encounter an existing page still on the old `useEffect` pattern, migrate it before adding features.

---

## Key Files

| File | Role |
|---|---|
| `src/hooks/useCachedApi.js` | SWR hook — `{ data, loading, error, refetch }` |
| `src/utils/cacheManager.js` | `cacheGet`, `cacheSet`, `invalidateCache`, `clearAllCache` |
| `src/constants/cacheKeys.js` | All `CACHE_KEYS` constants with TTL and storage config |

---

## Imports (copy-paste)

```js
import useCachedApi from '../../hooks/useCachedApi';
import { CACHE_KEYS } from '../../constants/cacheKeys';
import { invalidateCache } from '../../utils/cacheManager';
```

---

## `useCachedApi` Signature

```js
const { data, loading, error, refetch } = useCachedApi(
  apiFn,        // () => Promise — the fetch function
  cacheKey,     // CACHE_KEYS.* constant
  deps,         // optional array — scopes cache per unique combo (e.g. [month, year])
);
```

- **Cache hit**: returns data immediately, `loading = false`, then silently revalidates in background
- **Cache miss**: `loading = true`, fetches from GAS, stores result, `loading = false`
- **`refetch()`**: forces a real fetch with spinner — use only after a confirmed mutation

Cache is stored in localStorage (survives page refresh within TTL). Each `CACHE_KEYS.*` entry has its own TTL configured in `CACHE_CONFIG`.

---

## Pattern: No server-side filter

```js
const { data: raw, loading, error, refetch } = useCachedApi(
  getAllDueInvoices,
  CACHE_KEYS.DUE_COLLECTION,
);
const rows = Array.isArray(raw?.rows) ? raw.rows : Array.isArray(raw) ? raw : [];
```

## Pattern: With server-side filter (e.g. month/year)

`deps` scopes the cache — each `[month, year]` pair gets its own entry:

```js
const { data: raw, loading, error, refetch } = useCachedApi(
  () => getExpenses({ month, year }),
  CACHE_KEYS.EXPENSES,
  [month, year],
);
const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.expenses) ? raw.expenses : [];
```

## Pattern: Mutation (simple modal — no drawer)

After add/update/delete, invalidate the cache entry then refetch:

```js
onSuccess={() => { invalidateCache([CACHE_KEYS.EXPENSES]); refetch(); }}
```

## Pattern: Mutation-aware drawer (`drawerMutatedRef`)

When a list page opens a drawer/detail panel that can mutate, use a ref to avoid unnecessary refetches on view-only closes:

```js
const drawerMutatedRef = useRef(false);

const handleDrawerClose = useCallback(() => {
  setSelectedItem(null);
  if (drawerMutatedRef.current) {
    drawerMutatedRef.current = false;
    invalidateCache([CACHE_KEYS.LAB_INVOICES]);
    refetch();
  }
}, [refetch]);

// In drawer JSX:
<DetailComponent
  onClose={handleDrawerClose}
  onMutated={() => { drawerMutatedRef.current = true; }}
/>
```

In the detail component, call `onMutated?.()` after any successful mutation.

---

## All Current Cache Keys

Defined in `src/constants/cacheKeys.js`:

| Key | Value string | TTL | Storage | Used by |
|---|---|---|---|---|
| `CACHE_KEYS.LAB_INVOICES` | `lab_invoices` | session (no expiry) | local | InvoiceList, dashboards |
| `CACHE_KEYS.PATIENTS` | `patients` | 10 min | local | ReceptionDashboard |
| `CACHE_KEYS.EXPENSES` | `expenses` | 10 min | local | Expenses, dashboards |
| `CACHE_KEYS.DUE_COLLECTION` | `due_collection` | 5 min | local | DueCollection |

To add a new key, add both a `CACHE_KEYS.*` constant and a matching `CACHE_CONFIG` entry.

`CACHE_KEYS.DAILY_CLOSING` (`daily_closing`, 2 min, local, deps `[date]`) — shared by the Daily Closing page and the Reception Dashboard today cards; invalidate it after any invoice payment, due collection, or expense add.

**2026-09-25 fix:** `invalidateCache([KEY])` now also clears deps-qualified entries (`${KEY}_[...]`). Before that, invalidating a key used with deps (EXPENSES per month) silently did nothing.

---

## Pages Already Migrated (old useEffect → useCachedApi)

- `InvoiceList.jsx` + `InvoiceDetail.jsx` — migrated 2026-05-20
- `Expenses.jsx` — migrated 2026-05-20
- `DueCollection.jsx` — migrated 2026-05-20
- `AdminDashboard.jsx`, `ReceptionDashboard.jsx` — built with `useCachedApi` from the start

## Pages Still on Old Pattern (migrate before adding features)

Check remaining pages in `src/pages/` for `useEffect.*fetch` patterns — migrate any found.
