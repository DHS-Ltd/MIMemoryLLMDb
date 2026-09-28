---
name: feature-updated-2026-05-20
description: "Features added on 2026-05-20 — new-patient modal shortcut on Reception Dashboard, discount field on Due Collection modal, and matching GAS collectDuePayment fix"
metadata: 
  node_type: memory
  type: project
  originSessionId: 11e29fca-930b-40fb-a65e-2b07b3989a89
---

### 1. Reception Dashboard — "নতুন রোগী" opens PatientForm modal directly
- `src/pages/dashboard/ReceptionDashboard.jsx`
- Changed quick-action from `path: '/reception/patients'` navigation to `action: 'new-patient'` which sets `showPatientForm: true`
- `<PatientForm isOpen={showPatientForm} onClose={...} />` rendered in the dashboard
- **Why:** Clicking the shortcut was sending the user to the patient list first; they wanted the add-patient modal to open immediately.
- **How to apply:** If a new modal shortcut is needed on the dashboard, follow the same `action:` pattern already used for `'new-invoice'` and `'new-patient'`.

### 2. Due Collection modal — Discount field added
- `src/pages/reception/DueCollection.jsx`
- Added `discount` state; "Discount (Optional)" `<Input>` appears between the info card and "Amount to Collect"
- Typing a discount auto-updates the collect amount to `due − discount`; "After Discount" line shown in green when discount > 0
- Validation: discount cannot exceed raw due; collect amount capped at effective due
- **Why:** Reception needs to grant partial write-offs at the time of collecting overdue payments.
- **How to apply:** The `collectDue` API call now always sends `{ invoiceId, amount, discount, paymentMethod }`. GAS backend must receive all four fields.

### 3. GAS backend — collectDuePayment now handles discount
- `E:\v1-BdcHmsApp\Code.gs`
- Router line: `collectDuePayment(token, payload.invoiceId, payload.amount, payload.discount || 0)`
- Function signature: `function collectDuePayment(token, invoiceId, amount, discount)`
- Sheet column used: `'Discount Amount'` (with space — the exact header in the spreadsheet)
- Logic: `effectiveDue = due − discount`; `newPaid += amount`; `newDue = effectiveDue − amount`; `DiscountAmount += discount`
- **Why:** Without this fix, the frontend sent `discount` but GAS silently ignored it — the sheet never recorded the discount and the due amount was not reduced correctly.
- **How to apply:** Always deploy (`clasp push` + redeploy) after any Code.gs change. Column name is `'Discount Amount'` not `'DiscountAmount'`.
