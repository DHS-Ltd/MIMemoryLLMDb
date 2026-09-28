---
name: feature-accounting-dashboard
description: "AccountingDashboard page for Admin — 5-tab financial analytics with global filter bar, chart.js charts, and CSV export. Implemented 2026-05-24."
metadata: 
  node_type: memory
  type: project
  originSessionId: 98457b54-ef15-4b68-9010-f2a1df4356dd
---

## AccountingDashboard — Admin-Only Financial Analytics

**Route:** `/admin/accounting` (lazy-loaded, sidebar link "Accounting" with TrendingUp icon, Admin group)  
**File:** `src/pages/admin/AccountingDashboard.jsx`  
**Guard:** `<RoleGuard allowedRoles={[ROLES.ADMIN]}>`  
**Cache:** `CACHE_KEYS.ACCOUNTING = 'accounting'`, TTL 30 min, localStorage  

**Why:** Admin needs consolidated bank/cash analysis view with P&L, expense breakdown, investment tracking, account balances, and raw transaction drill-down.  
**How to apply:** If asked to extend the accounting section, work in `src/pages/admin/accounting/` and follow the tab pattern. All aggregations must derive categories dynamically — never hardcode Transaction_Type or Revenue_Class strings.

---

## Architecture

```
AccountingDashboard.jsx          ← owns data fetch, filter state, tab routing
└── src/pages/admin/accounting/
    ├── accountingUtils.js        ← pure data helpers (no React)
    ├── OverviewTab.jsx           ← KPI cards + Monthly P&L + Revenue charts
    ├── ExpensesTab.jsx           ← Horizontal bar + Donut + Heatmap + table
    ├── InvestmentsTab.jsx        ← DHS injection timeline + Capital assets
    ├── AccountsTab.jsx           ← Per-account cards + bar chart + table
    └── TransactionsTab.jsx       ← Paginated sortable table + search + CSV export
```

## Data Flow

1. `useCachedApi(getAccountingData, CACHE_KEYS.ACCOUNTING)` → `{ rows: [...] }`
2. `parseRows(raw.rows)` → normalizes `Year_Month` to `YYYY-MM`, coerces Debit/Credit/Net to numbers
3. Global filter state in parent → `filteredRows` passed as `rows` prop to every tab
4. Each tab runs `useMemo` aggregations; never re-derives filter options from filtered data (options always derived from `allRows`)

## GAS API

```js
// gasClient.js
export const getAccountingData = () => callApi('getAccountingData', {});
```

**Response shape:**
```js
{ rows: [{ Date, Year_Month, Account_Book, Book_Type, Transaction_Type, Revenue_Class, Debit, Credit, Net, Remarks }, ...] }
```

**GAS requirement:** `ACCOUNTING_SHEET_ID` must be set in GAS Script Properties. If missing, API returns empty rows array.

## Filter Bar (global, in AccountingDashboard)

| Filter | State | Type |
|--------|-------|------|
| From / To | `startYM` / `endYM` | `<input type="month">` |
| Revenue Class | `revenueClasses` | MultiSelect (array) |
| Transaction Type | `transactionTypes` | MultiSelect (array) |
| Account Book | `accountBooks` | MultiSelect (array) |

Filter options auto-derive from `allRows` via `getUniqueValues(allRows, column)` — adapts as sheet evolves.

## accountingUtils.js — Key Functions

| Function | Purpose |
|----------|---------|
| `parseRows(rawRows)` | Normalize Year_Month, parse numbers |
| `normalizeYM(ym)` | `'2024-9'` → `'2024-09'` for sorting |
| `getUniqueValues(rows, col)` | Sorted unique non-empty values — drives all dropdowns |
| `getMonthlyPL(rows)` | `[{ ym, revenue, expense, net, trueRevenue }]` |
| `getExpenseBreakdown(rows)` | `[{ type, amount, pct }]` by Transaction_Type |
| `getRevenueClassBreakdown(rows)` | `[{ cls, credits, debits, net }]` |
| `getAccountSummary(rows)` | `[{ book, bookType, credits, debits, net }]` |
| `getDhsInjections(rows)` | Rows where Revenue_Class contains 'Capital Injection' |
| `getCapitalAssets(rows)` | Rows where Revenue_Class contains 'Capital Asset' |
| `getKpis(rows)` | `{ trueRevenue, totalExpense, operatingExpense, operatingNet, dhsInjected, assetsTotal, coveragePct }` |
| `exportRowsToCSV(rows, filename)` | Browser download of filtered rows as CSV |

**KPI logic:**
- `True Revenue` = Credit where Revenue_Class contains 'TRUE REVENUE'
- `Operating Expense` = totalExpense − assetsTotal
- `Operating Net` = trueRevenue − operatingExpense
- `Coverage %` = trueRevenue / operatingExpense × 100

## Tab Details

### OverviewTab
- 6 KPI cards: True Patient Revenue, Total Expenses, Operating Net P&L, DHS Capital Injected, Capital Assets, Revenue Coverage %
- Monthly P&L Trend: mixed bar+line (True Revenue line, Total Expense bar, Net P&L bar)
- True Patient Revenue by Month: bar with MoM % tooltip

### ExpensesTab
- **Only `Revenue_Class` containing 'EXPENSE' rows are used** — Capital Assets and Capital Injection transactions are excluded. Filter: `rows.filter(r => String(r.Revenue_Class || '').toUpperCase().includes('EXPENSE'))`
- Top 15 expense categories: horizontal bar chart
- Expense composition: doughnut
- Monthly Expense Heatmap: top-6 categories × months (teal intensity scale)
- All categories: full breakdown table — **rows are clickable** → opens `DrillDownModal`
- `DrillDownModal`: fixed overlay, scrollable transaction table (Date, Month, Account Book, Revenue Class, Debit, Remarks), footer total. Matches by `Transaction_Type`. Backdrop click closes it.

### InvestmentsTab
- Summary cards: Total DHS Invested, Capital Assets Purchased
- DHS Injection Timeline: bar (amount) + line (running total)
- Capital Assets Portfolio: doughnut
- Capital Assets Breakdown: table

### AccountsTab
- Summary strip: Total Credits / Total Debits / Net Balance
- Account cards (one per Account_Book, Bank badge=sky, Cash badge=amber)
- Credits vs Debits by Account: grouped bar
- Account Book Summary: table

### TransactionsTab
- Search (Remarks, Transaction_Type, Revenue_Class, Account_Book)
- Sort by any column (click header)
- Export CSV button (downloads current sorted/filtered rows)
- Pagination: 50 rows/page with smart 5-page window

## Dependencies Added

`chart.js` + `react-chartjs-2` — used in OverviewTab, ExpensesTab, InvestmentsTab, AccountsTab. Each tab registers only the ChartJS modules it needs.

## Cache Key Added

```js
// cacheKeys.js
ACCOUNTING: 'accounting'
// config: { ttl: 30 * 60 * 1000, storage: 'local' }
```

## Refresh Pattern

```js
function handleRefresh() {
  invalidateCache([CACHE_KEYS.ACCOUNTING]);
  refetch();
}
```
No drawer mutation pattern needed — this page is read-only (no mutations).
