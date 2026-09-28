---
name: feature-daily-closing
description: "2026-09-25 SHIPPED + user-confirmed: Daily Closing report (/reception/daily-closing), append-only Payment_Log sheet, go-live backfill, date-named PDFs; backend v2.5/@57, frontend f4303c9/49a6ed6/0ecafa8"
metadata:
  node_type: memory
  type: project
  originSessionId: 3abcbce7-635a-4534-90d5-96b2a12b241d
  modified: 2026-09-25T15:37:03.915Z
---

**Status (2026-09-25, end of session): shipped and the user reported "All sorted out".** Grilled via /grill-with-docs (12 questions + 2 for PDF naming), built, verified, deployed in one session. Durable reasoning: `docs/adr/0005-payment-log-as-source-of-daily-collections.md` and the **Collection / Payment Log / Daily Closing Report** terms in `CONTEXT.md` — this memory holds the session specifics.

**User decisions (all "recommended" unless noted):** collections = money received that day, not billed value; itemised report; Payment_Log for exact past dates; "due" = **due at billing** only (not total outstanding, not due at close — reviewer flagged the same-day-paid case, user left it as is); centre-wide report + "By" column + per-user subtotals; by-method split + **Cash in hand = cash collections − cash expenses**; Credit/Return payment labels get NO special handling (user: "not practised at BDC now"); an expense belongs to its Date field; live view, no day-lock; A4 browser print with printed-by/at stamp + signature lines; Reception AND Admin, any past date; label **"Daily Closing" in English — user said no Bengali**; pre-log dates show collections as unavailable, never estimated; Reception Dashboard today cards read the same data.

**PDF name (0ecafa8):** `BDC_Daily-Closing_<report date YYYY-MM-DD>` — user chose ISO date so a folder sorts chronologically; date is the report's date, not the print date; reprints keep the same name (printed-at stamp inside distinguishes copies). Implemented as `document.title` for the page's lifetime. Same treatment for invoice prints was offered and not taken.

**Go-live backfill:** the log started at 20:42 after the whole day's billing (43 invoices), so the report was blank. User chose "go A": one-off `backfillTodayPaymentLog()` in Code.gs, editor-only (not routed through doPost), rows inserted at the top with `Time = N/A`, due-collection method recorded as Cash, collector blank; frontend `isGoLiveDay` needs a real HH:MM first-row time so a backfilled day shows no partial-day banner. User said all sorted after being told to run it — not independently verified (no sheet access). The function is now dead code: it refuses once N/A rows exist, and even if run on a later day it adds nothing already live-logged. Safe to delete.

**Backend deploy state:** production web app = `@57` (v2.5). Apps Script HEAD additionally holds `backfillTodayPaymentLog` + a `getPaymentLogSheet_` refactor, pushed but not deployed — the next `clasp deploy` will ship them, harmlessly.

**Bugs fixed on the way:** `invalidateCache` never cleared deps-qualified keys (`key_[...]`), so per-month EXPENSES invalidation had been a no-op; `todayStr()` was the UTC date (now delegates to `formatters.today()`, Asia/Dhaka); the AddExpenseModal default date was frozen at module load, in UTC; `collectDuePayment` silently dropped `paymentMethod` (now logged); the Reception Dashboard "today's collection" missed dues collected today on older invoices.

**How it was verified (reuse for similar work):** real Code.gs run in a Node VM against fake Sheets, calling `doPost` end to end. Stubs: SpreadsheetApp, Utilities.formatDate via Intl, CacheService sessions, ContentService. **Gotcha:** fixture Dates must come from the VM realm (`vm.runInContext('Date', ctx)`) or Code.gs `instanceof Date` fails and the code takes wrong branches. Also: `node src/pages/reception/dailyClosingSummary.selfcheck.mjs`; mock GAS + Vite + headless Chrome over CDP for screenshots, role gating and `Page.printToPDF` — see [[headless-browser-verification]]. Before any `clasp push`, `clasp clone` the live project into scratchpad and diff against local, so an unrelated uncommitted file isn't shipped by accident.

**Print gotcha:** Chrome repeats `<tfoot>` on every printed page, so a grand total reads as a page subtotal — `tfoot { display: table-row-group }` in the page's print CSS.

Related: [[project-cache-system]] (DAILY_CLOSING key), [[reference-gas-backend]].
