# BDC HMS — React Frontend

Hospital Management System for Baraicha Diagnostic Centre.
React 18 + Vite → Google Apps Script JSON API backend.

## Memory
Always read project memory at session start:
`C:\Users\maidu\.claude\projects\e--BDCHMSV2-bdc-hms-react\memory\MEMORY.md`

It tracks: GAS API constraints, features added per session, and key decisions.
Update memory when you add features, fix bugs, or make architectural choices.

## Deploy
```
clasp deploy --deploymentId AKfycbw4d9j5tksjXz_cjKIEjseraFUTNAQYKfEOtOSRNNOd4aa5YUCxS089irUrjWekHHYUFQ --description "v2.x"
```

## Hard Rules
| Rule | Reason |
|---|---|
| Never `Content-Type: application/json` | GAS rejects — triggers CORS preflight |
| Always use `callApi()` in `gasClient.js` | All HTTP must go through one gateway |
| Never handle `SESSION_EXPIRED` in pages | Handled globally in `gasClient.js` |
| Never hardcode GAS URL | Use `VITE_GAS_URL` from `.env` |
| All pages via `React.lazy` + `Suspense` | Lazy-load only, single Suspense in App.jsx |
| **Never use `useEffect` + `useState` to fetch list data** | Always use `useCachedApi` — see Data Page Cache Rule below |

## Data Page Cache Rule

**Every page that reads and displays a list or table of data MUST use `useCachedApi`.**

Do NOT use `useEffect(() => { fetchFn(); }, [deps])` + `useState([])` for data loading. That pattern hits the GAS API on every navigation. `useCachedApi` serves cached data instantly and revalidates silently in the background.

### Standard pattern (no server-side filter)

```js
import useCachedApi from '../../hooks/useCachedApi';
import { CACHE_KEYS } from '../../constants/cacheKeys';
import { invalidateCache } from '../../utils/cacheManager';

const { data: raw, loading, error, refetch } = useCachedApi(
  getAllDueInvoices,
  CACHE_KEYS.DUE_COLLECTION,
);
const rows = Array.isArray(raw?.rows) ? raw.rows : Array.isArray(raw) ? raw : [];
```

### With server-side filters (e.g. month/year)

Pass `deps` as the third argument — each unique `[month, year]` gets its own cache entry:

```js
const { data: raw, loading, error, refetch } = useCachedApi(
  () => getExpenses({ month, year }),
  CACHE_KEYS.EXPENSES,
  [month, year],
);
const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.expenses) ? raw.expenses : [];
```

### After a mutation (add / update / delete)

Invalidate the cache then trigger a fresh fetch:

```js
// Simple modal (no drawer)
onSuccess={() => { invalidateCache([CACHE_KEYS.EXPENSES]); refetch(); }}
```

For pages with a detail drawer that can mutate, use the `drawerMutatedRef` pattern (see project memory).

### Adding a new cache key

Add the key + config to `src/constants/cacheKeys.js` before wiring up the page:

```js
// In CACHE_KEYS object:
MY_NEW_DATA: 'my_new_data',

// In CACHE_CONFIG object:
[CACHE_KEYS.MY_NEW_DATA]: { ttl: 10 * 60 * 1000, storage: 'local' },
```

### Already implemented on
- `InvoiceList.jsx` + `InvoiceDetail.jsx`
- `Expenses.jsx`
- `DueCollection.jsx`
- Both dashboards (via `useCachedApi` hooks inside the dashboard components)

## Graph-Derived Architecture

**Hub files** (highest connectivity — touch carefully):
- `src/api/gasClient.js` — 32 connections; `callApi()` is the backbone
- `src/utils/dashUtils.js` — shared dashboard date utilities
- `src/utils/formatters.js` — shared formatters (currency, dates)

**Communities** (feature clusters):
| Cluster | Key Files |
|---|---|
| GAS API Client | `gasClient.js`, all named wrappers |
| App Shell & Auth | `App.jsx`, `AuthContext.jsx`, `ProtectedRoute.jsx`, `RoleGuard.jsx` |
| Data Fetching | `hooks/useApi.js` (auto-fetch + lazy) |
| Dashboard | `pages/dashboard/Dashboard.jsx`, `dashUtils.js` |
| Invoice | `utils/generateInvoiceHtml.js`, `hooks/usePrintInvoice.js` |
| Brand / Design | `tailwind.config.js`, `assets/bdcLogoDataUrl.js` |
| Build Tooling | `vite.config.js`, `eslint.config.js` |

## Key Paths
```
src/api/gasClient.js          # callApi() + named API wrappers
src/context/AuthContext.jsx   # useAuth() — user, token, login, logout, hasRole
src/hooks/useApi.js           # useApi (auto) / useLazyApi (manual)
src/utils/formatters.js       # currency, date helpers
src/utils/dashUtils.js        # dashboard date helpers
src/utils/generateInvoiceHtml.js  # invoice HTML template
src/components/ui/index.js    # shared UI exports
src/constants/index.js        # ROLES, TOKEN_KEY, USER_KEY
E:\v1-BdcHmsApp\Code.gs       # Old GAS main code file to understand the APP API GAS Structure.
```

## API Pattern
```js
// Auto-fetch
const { data, loading, error, refetch } = useApi(getPatients);
// Manual
const { execute, loading, error } = useLazyApi(createInvoice);
```

## Roles
`Admin` | `Reception` | `Lab_Tech` | `Doctor` | `Patient`

## Brand
- Sidebar: `#003344` · Accent: `#00897B`
- Bengali name: `বারৈচা ডায়াগনস্টিক সেন্টার`
