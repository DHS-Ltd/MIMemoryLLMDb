---
name: project-gas-lab-invoice-fields
description: GAS API field names for lab invoices — what getLabInvoices returns vs what updateInvoice/updateLabInvoice expects; includes per-test line item mapping
metadata: 
  node_type: memory
  type: project
  originSessionId: 4dba5c16-e93f-4b43-a287-220ba713f427
---

## Lab Invoice Field Mapping

The GAS backend uses **different field names** for reading vs writing. Never assume read-field names work in write payloads.

**Why:** The GAS sheet stores `LineAmount` as a computed column. `getLabInvoices` returns it as `lineAmount`. `updateLabInvoice` recalculates totals server-side from `lineItems[].price`, so the write field is `price` — not `lineAmount`.

**How to apply:** Always use `lineAmount` when reading/displaying test prices; always map to `price` when sending `lineItems` back to the API.

---

## Invoice-Level Fields (from `getLabInvoices`)

| Field | Type | Notes |
|---|---|---|
| `invoiceId` | string | Primary key |
| `patientName` | string | |
| `patientPhone` | string | |
| `patientAge` | string/number | |
| `patientId` | string | |
| `patientAddress` | string | |
| `refDoctor` | string | Referring doctor |
| `invoiceDateTime` | string | Full datetime; `date` may also be present |
| `deliveryDate` | string | |
| `discountAmount` | number | GAS sheet col is `Discount Amount`; normalized to `discountAmount` in API response. Added to `getLabQueue` response 2026-05-20. |
| `totalAmount` | number | Net total (after discount) |
| `paidAmount` | number | |
| `workflowStatus` | string | `'Pending'` \| `'Sample Collected'` \| `'Delivered'` |
| `lineItemCount` | number | Number of tests |
| `preparedBy` | string | |
| `remark` | string | |
| `tests` | array | Per-test line items (see below) |

---

## Per-Test Line Item Fields (read — inside `invoice.tests[]`)

| Field | Type | Notes |
|---|---|---|
| `testName` | string | Display name |
| `lineAmount` | number | **The price to display** — use this, not `price` or `cost` |
| `testCode` | string | Test code |
| `lineId` | string/number | Row identifier on the sheet |
| `qty` | number | Usually 1 |

---

## Per-Test Line Item Fields (write — inside `lineItems[]` sent to API)

When calling `updateInvoice` / `updateLabInvoice`, send `lineItems` as:

```js
lineItems: editForm.tests.map(t => ({
  lineId:   t.lineId,
  testCode: t.testCode,
  testName: t.testName || t.name || '',
  qty:      t.qty || 1,
  price:    t.lineAmount || 0   // ← write field is "price", not "lineAmount"
}))
```

GAS recalculates `totalAmount` and `dueAmount` server-side from these prices — do NOT send them in the payload.

---

## Invoice Update Payload (full)

```js
await updateInvoice({
  invoiceId:    id,
  discount:     editForm.discount,
  paidAmount:   editForm.paidAmount,
  deliveryDate: editForm.deliveryDate,
  remark:       editForm.remark,
  lineItems:    editForm.tests.map(t => ({
    lineId:   t.lineId,
    testCode: t.testCode,
    testName: t.testName || '',
    qty:      t.qty || 1,
    price:    t.lineAmount || 0
  }))
});
```

---

## Already Implemented In

- `InvoiceDetail.jsx` — display uses `lineAmount`, save maps to `price` (2026-05-20)
