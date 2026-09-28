---
name: feature-test-catalog-price-edit
description: "Test Catalog price/name/category update capability added 2026-08-20 — dedicated Admin/Reception management page, inline invoice-picker price edit, and the discovery that TestCatalogPanel.jsx was dead code"
metadata:
  type: project
  originSessionId: 7d7c0ede-03fc-4945-9d93-a851021ff1f8
  modified: 2026-08-20T10:25:02.671Z
---

Gave Reception + Admin the ability to update an existing Test_Catalog row's price (name/category too), not just add new tests. See [[project_gas_lab_invoice_fields]] sibling docs, the app's `CONTEXT.md` (new "Test Catalog Item" term), and `docs/adr/0003-test-catalog-reception-full-parity.md` for the durable domain record — this memory is the session narrative.

**Why:** Reception could only add brand-new tests via `AddTestModal`; there was no way to correct an existing test's price without editing the Google Sheet directly.

**Key correction mid-session:** Grilling initially assumed `TestCatalogPanel.jsx` (a grouped/searchable category picker) was the live invoice test-picker. It is not — it's dead code, never imported anywhere. The actual live picker inside `NewInvoice.jsx` is `TestLineRow.jsx`'s per-row autocomplete combobox (`allTests={catalogTests}`, suggestion dropdown, "create new test" fallback to `AddTestModal`). The inline price-edit affordance was built into the real component (`TestLineRow.jsx`), not the orphaned one. `TestCatalogPanel.jsx` was left untouched — fixing/wiring it up was out of scope.

**Decisions from grilling:**
- Update lives in two places: a full Admin/Reception CRUD page (`/admin/test-catalog`) + an inline pencil-icon price edit inside the invoice picker's suggestion dropdown, with a confirm-before-save step (price changes affect all future invoices, not just the one being built).
- Role split deliberately breaks from the Doctor/Referral Agent pattern (Admin full CRUD, Reception restricted add-only): here Reception gets **identical** rights to Admin (name+category+price), since BDC treats test pricing/naming as a day-to-day reception task. Recorded in ADR-0003 specifically because it's a conscious departure from the just-established precedent.
- `TestCode` is immutable everywhere — invoice line items reference tests by code, so renaming it would break historical traceability.
- Audit via `UpdatedBy`/`UpdatedAt` columns (auto-added on first edit, same pattern as existing `CreatedBy`/`CreatedAt`), no full change-history log.
- No deactivate/soft-delete — scoped strictly to add + edit, unlike Referral Agents' `Status` column.
- Editing an existing test's catalog price does **not** retroactively touch line items already added to an in-progress invoice draft — `LinePrice` is a snapshot copied at add-time (confirmed both in code and now documented in `CONTEXT.md`).

**Backend** (`E:\v1-BdcHmsApp\Code.gs`, deployed via the standard `clasp deploy --deploymentId ...`, now at v3.6 / `@54`): added `updateTestCatalogItem(token, formData)` — `requireRole_(['Admin','Reception'])`, looks up the row by `TestCode`, blocks duplicate names (excluding self), auto-adds `UpdatedBy`/`UpdatedAt` columns on first use. `getTestCatalog` now also returns `CreatedBy`/`CreatedAt`/`UpdatedBy`/`UpdatedAt`. New dispatcher case `updateTestCatalogItem`. `addTestCatalogItem`'s existing role set (`Admin/Reception/Doctor`) was deliberately left unchanged — only the new update path was scoped to Admin+Reception.

**Frontend**: new `src/pages/admin/TestCatalogManagement.jsx` — `DataTable` list (search by name/code, category filter derived from live data since Category is free text, no fixed config), single `Modal` reused for add/edit, following the `ReferralAgentManagement.jsx` shape. Sidebar nav item "Test Catalog" added for both Admin and Reception (`AppLayout.jsx`). `TestLineRow.jsx` rewritten: each suggestion row now shows Category + Price, with a pencil icon that switches into an inline price input → confirm/cancel, calling `updateTestCatalogItem` directly and reporting the result up via a new `onPriceUpdated` prop so `NewInvoice.jsx` can sync its shared `catalogTests` state across all rows and invalidate `CACHE_KEYS.TEST_CATALOG`.

**Bonus fix, same file:** `NewInvoice.jsx`'s existing `handleTestCreated` (the add-new-test success handler) was updating local `catalogTests` state but never calling `invalidateCache([CACHE_KEYS.TEST_CATALOG])` — meaning a newly added test wouldn't appear for other sessions/tabs until the 24h cache TTL expired. Fixed alongside the update path since it's the identical gap in the neighboring code path.

**Not done / explicitly out of scope:** No deactivate/hide for obsolete tests. `TestCode` renaming. Full price-change history log (only last-edit audit, not every historical change).
