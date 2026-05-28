# BDC Hospital Management System — Claude Code Memory File
**Project:** BDC HMS | **Developer:** Maidul | directhospitalsolutionsltd@gmail.com
**Current Version:** v2.2 | **Last Updated:** 08 April 2026
**Deploy:** `clasp deploy --deploymentId AKfycbzCOj1mmrCp-I2GQPj4eWGv0-uJcJntLDDpIohSnFA0JOqj_G9TDTKWWWXFJkg2DmfRRg --description "v2.2"`

---

## 1. Project Identity

Custom web app for **Baroicha Diagnostic Center (BDC)**, Belabo, Narsingdi, Bangladesh. Built entirely on **Google Workspace free tier** — no paid servers, no app stores, no frameworks.

**ACS Strategy:** Free Google Meet consultations (Dr. Upal) → 100 BDT prescription charge → patient data capture → diagnostic center walk-ins.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JS | SPA, NO frameworks |
| Backend | Google Apps Script (GAS) | Serverless |
| Database | Google Sheets (11 tabs) | Free |
| Session | Google CacheService | Server-side token, 8h TTL |
| Hosting | GAS Web App | `executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS` |
| Sync | clasp v3.3.0 | Local ↔ GAS |
| Auth | Custom Phone + PIN | No Google Sign-In |
| Image | html2canvas (CDN, scale 2×, 794px) | HTML → JPEG in browser |
| Notify | WhatsApp `wa.me` | No API key |
| Runtime | V8, Asia/Dhaka | appsscript.json |

---

## 3. GAS Project Config

- **Script ID:** `1cqihlLttKJqATL2Mh28iQXyn_O_54BJcfGovqjEEyqHcleHgDQzQxy9L`
- **Account:** directhospitalsolutionsltd@gmail.com
- **clasp token:** `C:\Users\Maidul\.clasprc.json`

---

## 4. Project Files (all in root, pushed via clasp)

| File | Size | Role |
|---|---|---|
| `Code.gs` | ~106KB | ALL server-side: APIs, auth, data, session |
| `Index.html` | ~112KB | Main HTML shell — all views, modals, nav |
| `JavaScript.html` | ~285KB | ALL client JS — handlers, UI, google.script.run |
| `Stylesheet.html` | ~70KB | ALL CSS — modules, responsive, print |
| `PrescriptionPDF.gs` | ~26KB | Rx engine: `rxBuildHtml_()`, `submitPrescription()`, `getPrescriptionHtmlForClient()` |
| `InvoicePdf.gs` | ~81KB | Invoice engine: `buildInvoiceHtml_()`, `saveInvoiceImageToDrive()` |
| `ViewPrescriptionJS.html` | ~7.5KB | Client JS for prescription view/preview |
| `appsscript.json` | 399B | GAS manifest — DO NOT MODIFY |

**Architecture:** All files monolithic by design (GAS constraint). Do NOT split. `Index.html` includes `Stylesheet.html` + `JavaScript.html` at runtime via GAS `include()`. All server calls via `google.script.run.functionName()`.

---

## 5. Database — Google Sheets (11 Tabs)

| # | Tab | Purpose | Key Notes |
|---|---|---|---|
| 1 | Users | Login credentials | Phone, PIN, Role, LinkedPatientID |
| 2 | Patients | Registrations | PatientID: `P+YYMMDD+seq`, RegisteredDate |
| 3 | Appointments | Bookings | ApptID, DoctorPhone → Doctors |
| 4 | Doctors | Master list | DA_ID, Name, Specialty, Phone, BMDC_Reg_No, Department |
| 5 | referral_agents | Marketing/LMF | DA_ID, Role (non-Doctor) |
| 6 | Lab_Invoices | Invoice headers | Dynamic col mapping, alias support |
| 7 | Invoice_LineItems | Line items | Qty, Price, Discount, Amount |
| 8 | Prescriptions | Rx records | rxId, ApptID, draft/finalized, PDF_File col |
| 9 | Expenses | Expense tracking | Admin module |
| 10 | Test_Catalog | Lab test catalogue | codes, names, categories, prices |
| 11 | *(verify Code.gs)* | | |

**ID Formats (v2.2):**
- **PatientID:** `P` + `YYMMDD` + daily seq → `P2604061` (1st patient 06 Apr 2026) — `generatePatientId_()`
- **InvoiceID:** `YYMMDD` + daily seq → `2604061` — `generateInvoiceId_()` — counters reset daily (Asia/Dhaka)
- **Phone numbers:** stored as plain text (`@` format). `savePatient` calls `setNumberFormat('@')` + `setValue()` after `appendRow` to preserve leading `0` (e.g. `01871345617`). Same fix for `WA_Phone_No`.

**Critical:** Sheet headers read from row 1 dynamically. Support common aliases (`Discount Amount`/`DiscountAmount`, `PC Doctor`/`PCDoctor`). Always use dynamic column mapping.

---

## 6. User Roles & Modules

| Role | Module | Key Features |
|---|---|---|
| Admin | Admin dashboard | Invoices, expenses, patient totals, user management |
| Reception | Reception module | Patient reg, appointment booking, 3×2 nav grid, Create Lab Invoice |
| Doctor | Doctor dashboard | Appointment queue, prescription gen, patient history |
| Lab_Tech | Lab dashboard | Queue (pending/processing/verified), status updates, WhatsApp notify |
| Marketing_Agent | Agent tracker | Referral revenue, commission |
| Patient | Patient portal | Health history, Rx, lab results, invoices, next visits |

---

## 7. Prescription Module — v1.7

**Form layout (2-column):** Left 34% (teal tint): H/O, C/C, O/E, Diagnosis, Investigation, Treatment Plan. Right 66%: Medicine List (Name / Dose-Interval / Time / Dosage / Duration / Comment).

**A4 Print Template:** 2-column, brand `#003344`, header (logo + clinic + Bengali subtitle + address), doctor sub-header, patient info bar (ApptID · Name · Sex · Age · Date), `Rx` symbol, Advice + Next Visit footer.

### Save → Drive lifecycle (v1.7 — AUTOMATIC)
1. `savePrescription(token, formData)` → row in Prescriptions sheet, `PDF_File = ''` (draft)
2. Button → "Saving to Drive…" + spinner (form stays open)
3. `getPrescriptionHtmlForClient(token, rxId)` → A4 HTML string
4. `captureRxAsImage(html)` → html2canvas → JPEG base64
5. `submitPrescription(token, rxId, imageBase64)` → JPEG → Drive, `PDF_File` col = URL (finalized)
6. Phase 9 Tailwind modal (`#view-rx-modal-overlay`) opens auto with data + "Open PDF" link
7. `loadDoctorQueue()` + `loadDashboardStats()` refresh in background

**Fallback:** Drive fail → toast error + "View & Print Prescription" banner for retry. Draft stays in sheet (PDF_File empty).

**Drive Folder:** `1ZOz8JxQsC5A0S32D4noDnbKskXMbaDi9` | **Filename:** `RX_<ID>_<PID>_<ddmmyy>.jpg` (fallback `.html`)

### Phase 9 Rx View Modal (`#view-rx-modal-overlay`) — Tailwind

Used in two contexts:
1. **Post-save** — `_openViewRxModal(fileUrl)` inside `onRxSuccess`, populated from in-memory form data
2. **View from queue** — `handleViewPrescription(e)` on "View Prescription" card click

**Footer:** Open PDF (`#view-rx-pdf-btn`), Share WhatsApp (`#view-rx-send-wa-btn`), Close
**WA state vars:** `_viewRxRxId`, `_viewRxPatientName`, `_viewRxPdfUrl`, `_viewRxPatientPhone`

### View from queue — medicines fetch
`handleViewPrescription` does NOT read `data-medicines` (`Medicine_List` column is always empty — medicines stored as JSON in `Medicines` column only). Instead:
1. Opens modal with static fields; shows "Loading…" in medicines
2. Calls `getPrescriptionDetails(token, rxId)` → `medicines` array
3. Renders as `Name — Dosage — Duration` per line (`whitespace-pre-line`)

### Date formatting
`formatRxDisplayDate_(val)` — converts any date (incl. full `Date.toString()` from Sheets) → `dd-mm-yyyy`.
**Next Visit rule:** Always display as `dd-mm-yyyy`. Never show "After X Week(s)" or raw timestamps.

### Prescriptions sheet columns
| Column | Writer | Content |
|---|---|---|
| `Medicines` | `savePrescription` / `updatePrescription` | JSON array of medicine objects |
| `Medicine_List` | `savePrescription` | Always `''` — legacy, not used |
| `PDF_File` | `submitPrescription` | Drive URL — empty=draft, set=finalized |
| `NextVisit` | `savePrescription` | `yyyy-MM-dd` computed from qty+unit |

**Never use `Medicine_List`** — always use `Medicines` JSON via `getPrescriptionDetails`.

**Key client state vars:** `_rxEditMode`, `_rxEditId`, `_rxLastHtml`, `_rxLastHtmlRxId`, `_rxCurrentApptData`
**Old `#rx-preview-overlay`** (iframe toolbar) — fallback retry path only; NOT primary flow as of v1.7.

---

## 8. Invoice Module — v1.5

**Print layout:** 2-copy A4 (OFFICE COPY + cut line + PATIENT COPY). Watermark: BDC favicon, 260×260px, 0.12 opacity. Paid/Due seal: circular stamp, green ✓ PAID / red DUE + BDT amount, -12° rotation. Logo: 80×80px.

**Drive save:** html2canvas (scale 2×) → JPEG → `saveInvoiceImageToDrive(token, invoiceId, base64)`
- **Folder:** `1JpcLlR39CeExZMiKRgHn1CH2md-TbR6Z` | **Filename:** `invoices_INVOICEID.jpg`

**UX:** Modal preview single copy only. No View PDF button. Prepared By from session. AM/PM from 24h input. Paid/Discount inputs zero-clear on focus.

**Key CSS:** `.bdc-seal`, `.bdc-seal-paid`, `.bdc-seal-due`, `.bdc-copy-label`, `.bdc-cut-line`, `.bdc-wm`, `.bdc-logo`

---

## 9. Patient Portal — v1.4

**APIs:** `getPatientPortalData`, `getStaffPatientPortalData`, `searchPatientsForReceptionManage`, `getPatientVerificationInfo`, `requestPatientMobileVerification`, `submitPatientMobileVerification` (OTP stubs)

**Reception — Manage Patient:** Filter by PatientID substring + date range. Clickable PatientID → aggregated summary.

**Doctor — Patient History (v2.2):** Patient name/ID on appointment card = clickable button → opens `#doctor-patient-view` subpanel (inside `#doctor-dashboard`) via `getStaffPatientPortalData`. Back restores queue + stat cards. RBAC: `['Admin', 'Reception', 'Doctor']`.

**Portal sections:** Profile, visit history (DoctorPhone→Doctors), prescriptions (via ApptID), lab tests + report URLs, next visits, invoices + line breakdown.

---

## 10. Lab Technician Module

**Panel:** `#lab-dashboard` (`Index.html:119`), container `#lab-queue-container`
**Role routing:** `showDashboard()` → `JavaScript.html:468` → `loadLabQueue()`
**RBAC:** `requireRole_(token, allowedRoles)` — `Code.gs:348`

### Stat Cards (3 on login)
| Card | Field | Status |
|---|---|---|
| Samples Pending | `pendingSamples` | "Sample Collected" |
| In Processing | `inProcessing` | "Lab Processing" |
| Total in Queue | `totalInQueue` | any ≠ Completed/Verified |

Source: `getLabTechStats_()` — `Code.gs:447`

### Lab Work Queue
- Load: `loadLabQueue()` → `getLabQueue(token)` — `JavaScript.html:1868` / `Code.gs:593`
- Shows invoices NOT in Completed/Verified
- Columns: Invoice ID, Patient Name/ID, Date, Referred By, Status, Update Status (dropdown)
- Status progression: `Pending → Sample Collected → Lab Processing → Verified → Completed`
- **Lab_Tech can ONLY update status** — no other write

### Status Update
- UI: `handleStatusChange()` — `JavaScript.html:1923`
- Server: `updateLabStatus(token, invoiceId, newStatus)` — `Code.gs:634` — writes `WorkflowStatus` col only
- Completed/Verified: row fades + removed from DOM

### Lab Queue Search / Filter (v1.8) — Empty-state-first
**Form** `#lab-filter-form` (`Index.html:155–176`):
- **Invoice ID** (`#lab-invoice-input`) — 250ms debounce → `getLabInvoiceSuggestions()` → dropdown. Click/Enter → `getLabInvoiceById()`
- **Date range** (`#lab-from-date`, `#lab-to-date`) → "Load Dates" (`#lab-date-btn`) → `getLabQueueByDateRange()`
- **Reset** (`#lab-reset-btn`) — clears all, returns empty state

**Server:** `getLabInvoiceSuggestions(token, q)` — up to 15 matches; `getLabInvoiceById(token, id)`; `getLabQueueByDateRange(token, from, to)`

### Lab Detail Modal — Full Spec (v1.8)
**Overlay:** `#lab-detail-overlay` (`Index.html:1729–1763`)

**Body rendered by `renderLabDetailModal()` (`JavaScript.html:2443–2528`):**
1. Info grid: Patient (ID), Invoice Date, Delivery Date/Time, Referred By, Total/Paid/Due, Status badge
2. Test Line Items: SL · Test Name · Sample · Result · Report File
3. Remark / Notes textarea

**Save Data btn** (`#lab-detail-save-btn`, `btn btn-primary` no `btn-sm`):
- Collects ALL line results, file uploads, remark, URLs to remove
- Single batch: `saveAllLabLineResults(token, invoiceId, lineResults, remark, pendingFiles, urlsToRemove)`
- Success: refresh modal + queue

**Per line item:**
- Sample: "Received" green pill + timestamp OR orange "Receive" btn (`acknowledgeLineSample()`)
- Result: text input `.ld-result-input` (`data-line-id`) — bottom-border underline style, teal on focus
- Report File: flex-column cell, 150–190px fixed width
  - Existing: green `<a>` pill "Report N" → opens Drive in new tab. `−` btn removes (prevents link open via `e.preventDefault()`)
  - Pending: yellow pill, truncated filename (max 18 chars), full name in `title`, `−` removes
  - `+` btn (`.ld-add-files-btn`): dashed green square, multi-select picker (image/*, .pdf), stored in `_labPendingFiles` (no server call until Save)
  - **Multi-file fix:** `handleLabFileSelect` captures `fileInput.files` into plain array BEFORE resetting `input.value` (avoids Chrome/mobile FileList clearing bug)

**File architecture:**
- `ReportUrl` col in `Invoice_LineItems` = comma-separated Drive URLs
- Client state: `_labPendingFiles = { lineId: [{ base64, mime, name, _tempId }] }`, `_labUrlsToRemove = { lineId: [driveUrl] }`
- Drive folder: `LAB_RESULTS_FOLDER_ID` = `1G8AkViFNgAT7EdreUcuceggu4nmOBPNW`
- URL format: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing` (use `file.getId()`, NOT `file.getUrl()`)
- `SpreadsheetApp.flush()` called after each `setValue` in `saveAllLabLineResults` to prevent stale reads

**Close btn** (`#lab-detail-close-btn`): clears `_labDetailInvoiceId`, `_labPendingFiles`, `_labUrlsToRemove`

**Code locations:**
- `Index.html`: 119–134 (panel), 147–184 (filter form), 1729–1763 (detail modal)
- `JavaScript.html`: 2180–2233 (queue render), 2394–2435 (modal open/close), 2443–2528 (render), 2534–2573 (events), 2587–2660 (batch save), 2658–2755 (multi-file)
- `Code.gs`: 593 (`getLabQueue`), 661–808 (search/suggestions/dates), 861 (`getInvoiceDetails`), 943 (`updateLabRemark`), 1037 (`uploadLabResult`), 1097–1230 (`saveAllLabLineResults`), 1005 (`acknowledgeLineItemSample`)

### Admin Lab Queue (v1.9)
Admin does NOT show lab dashboard on login. Access via **Manage Reports → Invoices**. Mirror of Lab_Tech queue with `admin-` prefixed IDs. Lab Detail modal shared. HTML: `#admin-lab-filter-form`, `#admin-invoice-input`, `#admin-invoice-suggestions`, `#admin-from-date`, `#admin-to-date`, `#admin-date-btn`, `#admin-reset-btn`, `#admin-lab-queue-container`. JS: `adminLoadLabQueue()`, `adminRenderLabQueue()`, `adminHandleStatusChange()` etc.

### RBAC — Lab_Tech Cannot
Create/edit invoices (Reception/Admin), add Test Catalog items (Admin/Reception/Doctor), save patients/appointments, write prescriptions, view all invoices, access Expenses/Users.

### Known Gaps
- No delivery date/time in queue view
- WhatsApp btn exists server-side but not wired to Lab_Tech UI (Lab Detail modal has it wired as of v1.8)
- Patient sees report URLs only if manually entered — no file upload flow for patients

---

## 11. Analytics Reports Module — v2.0

**Foundation:** Chart.js in `Index.html` `<head>`: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js">`. CSS block `/* === ANALYTICS REPORTS === */` in `Stylesheet.html`. Old `renderStats()` cleared for Admin/Doctor/Reception. Lab_Tech retains 3 queue stat cards.

### Phase 1 Reports

| Report | Panel | Server Fn | Client Fn | Trigger |
|---|---|---|---|---|
| A-1 P&L Summary | `#admin-pl-panel` | `getPLSummary(token, period)` | `loadPLReport(period)`, `renderPLChart()` | `#nav-admin-pl` click |
| A-2 Outstanding Dues | `#admin-dues-panel` | `getOutstandingDues(token)` | `loadOutstandingDues()`, `renderDuesTable()` | `#nav-admin-dues` click |
| L-2 Overdue Samples | `#lab-overdue-section` | `getOverdueSamples(token)` | `loadOverdueSamples()` | Auto on Lab_Tech login |
| D-1 Doctor Today | `#doctor-today-stats` | `getDoctorTodaySummary(token)` | `loadDoctorTodaySummary()` | Auto on Doctor login |
| R-1 Reception Today | `#reception-today-stats` | `getTodaysDashboardStats(token)` | `loadReceptionTodayStats()` | Auto on Reception login |
| R-2 Today's Dues | `#reception-dues-section` | `getTodaysDues(token)` | `loadTodaysDues()` | Auto on Reception login |

**Shared helpers (`Code.gs`):** `buildStartDate_(period)`, `buildPatientMap_(patients)`
**Shared client:** `renderDuesTable(rows, containerId)`, `_analyticsCharts` + `_destroyChart(id)`, `App.loadPLReport` (exported for onclick)
**Admin nav:** `#nav-admin-pl` → `#admin-pl-panel`; `#nav-admin-dues` → `#admin-dues-panel`. Both in `_adminAllPanels`. Back: `#back-from-pl`, `#back-from-dues`.
**L-2:** `.overdue-invoice-link` on Invoice ID → opens Lab Detail modal (`openLabDetailModal`)

**Phase 2+ (not built):** A-3 Agent Leaderboard, A-4 Top Tests, A-5 Reg Trend, A-6 Discount Analysis, A-7 Expense Breakdown, A-8 ACS Funnel, L-3 Throughput, D-2 Follow-Up, D-3 Monthly Volume, D-4 Rx Completion, R-3 Weekly Trend — see `reference/notes/AnalyticDevelopment.md`

---

## 11b. Due Collection Module — v2.1 (Reception)

### Entry
**Manage Billing dropdown** (`#billing-nav-wrap` / `#billing-dropdown`): "Invoice Report (Soon)" replaced with **"Collect Due"** (`#billing-opt-due-collection`). Click → hide nav grid, show `#reception-due-collection-panel`. Back (`#reception-due-collection-back`) → `showReceptionHome()`.

### Panel
Table: Invoice ID · Patient (ID) · Date · Total (৳) · Paid (৳) · Due (৳) · Collect btn. Sorted by highest due first. Collect expands inline payment row. Only one row open at a time.

**Inline row:** patient name, current due, ৳ input (pre-filled to full due, max=due), Confirm + Cancel.
- Partial: `DueAmount -= collected`, `PaidAmount += collected`
- Full: `DueAmount = 0` → disappears on reload

### Server Functions
| Fn | RBAC | Purpose |
|---|---|---|
| `getAllDueInvoices(token)` | Reception, Admin | All Lab_Invoices with DueAmount > 0, with patient info, sorted desc |
| `collectDuePayment(token, invoiceId, amount)` | Reception, Admin | Updates PaidAmount/DueAmount; writes `DueCollectedDate` (yyyy-MM-dd) + `DueCollectedAmt` (cumulative today) |

**`DueCollectedDate`/`DueCollectedAmt`** — auto-created in `Lab_Invoices` on first use.

### "Collected Today" Stat Card
`getTodaysDashboardStats` uses two sources: (1) invoices created today → `PaidAmount`; (2) old invoices where `DueCollectedDate == today` → `DueCollectedAmt`. No double-counting (mutually exclusive).

### CRITICAL — GAS Date Comparison Pattern
Google Sheets auto-converts date strings to Date objects. `String(dateObj)` → `"Mon Apr 06 2026 00:00:00 GMT+0600"` — NOT `"2026-04-06"`. **Always use:**
```javascript
var raw = row['DueCollectedDate'];
var dcDate = (raw instanceof Date && !isNaN(raw))
  ? Utilities.formatDate(raw, tz, 'yyyy-MM-dd')
  : String(raw || '');
if (dcDate === todayStr) { ... }
```
**Never `String(dateValue)` for date comparisons in GAS.**

### Client Functions
`openDueCollectionPanel()`, `loadDueCollectionList()`, `renderDueCollectionTable(rows)`, `_openDuePayRow(invoiceId)`, `_closeDuePayRow(invoiceId)`, `_submitDuePayment(invoiceId)` (calls `loadDueCollectionList()` + `loadReceptionTodayStats()` on success), `_dueRows` (cache), `_dueRowId(invoiceId)` (DOM-safe ID)

**Key IDs:** `#billing-opt-due-collection`, `#reception-due-collection-panel`, `#reception-due-collection-body`, `#reception-due-collection-back`, `#due-row-{rid}`, `#due-pay-row-{rid}`, `#due-amount-{rid}`, `#due-submit-{rid}`

---

## 12. Android APK — WebView Wrapper

**Project:** `C:\Users\maidu\AndroidStudioProjects\BDCHospitalManagement\`

| Property | Value |
|---|---|
| Package | `com.bdchospital.management` |
| Entry Point | `MainActivity.java` |
| Target URL | GAS deployment URL (`APP_URL` in `MainActivity.java`) |
| Min SDK | 21 (Android 5.0) |
| Target/Compile SDK | 36 |
| Language | Java |
| Theme | `Theme.Material3.DayNight.NoActionBar` |

### Key Files
| File | Path | Purpose |
|---|---|---|
| `MainActivity.java` | `app/src/main/java/com/bdchospital/management/` | WebView config + JS bridge |
| `AndroidManifest.xml` | `app/src/main/` | Permissions, activity, no rotation handling |
| `activity_main.xml` | `app/src/main/res/layout/` | Single `<WebView>` filling screen |
| `build.gradle` (app) | `app/` | SDK levels, deps |

**Permissions:** `INTERNET`, `READ_EXTERNAL_STORAGE` (maxSdk 32), `READ_MEDIA_IMAGES` (API 13+)

### WebView Config
```java
settings.setJavaScriptEnabled(true)
settings.setDomStorageEnabled(true)   // localStorage for session
settings.setLoadWithOverviewMode(true)
settings.setUseWideViewPort(true)
settings.setBuiltInZoomControls(false)
settings.setMediaPlaybackRequiresUserGesture(false)
settings.setCacheMode(WebSettings.LOAD_DEFAULT)
settings.setMixedContentMode(MIXED_CONTENT_COMPATIBILITY_MODE)
```

### JS Bridge — `BdcAndroidBridge` (injected as `window.BdcAndroid`)
`onLoginSuccess()` — dismisses GAS warning banner (`.warning-banner-close-icon` / `#warning-bar-table`).
Call: `if (window.BdcAndroid) window.BdcAndroid.onLoginSuccess();`

### Other Config
- **System bar insets:** `setOnApplyWindowInsetsListener` — `WindowInsets.Type.systemBars()` API 30+, `getSystemWindowInset*()` older
- **Back nav:** `onBackPressed()` — WebView history back or exit
- **State:** `onSaveInstanceState` / `restoreState` — preserves scroll + history
- **Config changes:** `orientation|screenSize|keyboardHidden` — no Activity restart
- **Architecture decisions:** `OnApplyWindowInsetsListener` directly (not `WindowCompat`), `minifyEnabled false`, single Activity no Fragments, `configChanges` on Activity

**Build:** Android Studio → Build → Generate Signed APK → release → `app/release/app-release.apk` or `./gradlew assembleRelease`

---

## 13. clasp Workflow (run from `E:\v1-BdcHmsApp\`)

```powershell
clasp pull          # Online → Local
clasp push          # Local → Online
clasp push --watch  # Auto-push on save
clasp status        # Show tracked files
clasp deploy --description "v2.x - notes"
clasp login         # Re-authenticate
```

**After `clasp pull` — ALWAYS rename:**
```powershell
Copy-Item Code.js Code.gs -Force; Remove-Item Code.js
```

**Workflow:** Edit → `clasp status` → `clasp push` → test in browser → `clasp deploy`

---

## 14. Version History

| Version | Date | Key Change |
|---|---|---|
| v1.0 | Initial | Basic modules (Reception, Doctor, Lab, Admin) |
| v1.1 | 20 Mar | Invoice module redesign, clasp workflow |
| v1.2 | 20 Mar | Doctors/referral_agents split → 11 DB tabs |
| v1.3 | 21 Mar | Lab Invoice + dynamic header mapping |
| v1.4 | 22 Mar | Patient portal, Patient role, OTP stubs |
| v1.5 | 23 Mar | Invoice Print: html2canvas JPEG, 2-copy, Drive save |
| v1.6 | 26 Mar | Prescription redesign: 6 clinical fields, in-browser preview, html2canvas JPEG |
| v1.7 | 02 Apr | Prescription auto Drive-save; Phase 9 Tailwind `#view-rx-modal-overlay`; `getPrescriptionDetails` for medicines; Next Visit `dd-mm-yyyy` |
| v1.8 | 03 Apr | Lab queue empty-state-first; Invoice ID autocomplete + date-range; Lab Detail modal: multi-file upload/remove, batch `saveAllLabLineResults()`; `ReportUrl` comma-separated URLs |
| v1.9 | 04 Apr | Admin lab queue → Manage Reports → Invoices (not login panel); `admin-` prefix IDs; shared Lab Detail modal |
| v2.0 | 06 Apr | Analytics Phase 1: Chart.js CDN, CSS foundation, 6 reports (A-1 P&L, A-2 Dues, L-2 Overdue, D-1 Doctor Today, R-1/R-2 Reception) |
| v2.1 | 06 Apr | Due Collection: "Collect Due" in Manage Billing; `#reception-due-collection-panel`; `getAllDueInvoices` + `collectDuePayment`; `DueCollectedDate`/`DueCollectedAmt` auto-cols; "Collected Today" updated |
| v2.2 | 06 Apr | ID format: InvoiceID `YYMMDD+seq`, PatientID `PYYMMDD+seq`; phone leading-zero fix (`setNumberFormat('@')`); Doctor patient history clickable `.btn-patient-history` → `#doctor-patient-view`; overdue `.overdue-invoice-link` → Lab Detail modal |

---

## 15. Reference Docs

- `docs/BDC_HMS_Reference_18.03.2026.md` — Complete reference (v1.6) — **READ FIRST for any module work**
- `docs/APP_script_Sync_instruction.md` — clasp workflow guide
- `docs/BDC_HMS_Complete_Reference_18.03.2026_Viewer_With_TOC.html` — HTML viewer with TOC
- `docs/Lab_technician_Implement_summary.md` — Lab_Tech full spec + known gaps
- `reference/training-modules/memory_claude_README.md` — Claude Code memory guide

---

## 16. Working Rules for Claude

1. **Read `docs/BDC_HMS_Reference_18.03.2026.md` before touching any module**
2. **Never modify `appsscript.json`** unless explicitly asked
3. **Keep all files monolithic** — GAS constraint, do NOT suggest splitting
4. **Always use dynamic column mapping** — headers from row 1, support aliases
5. **Auto Drive save (v1.7)** — `savePrescription` chains to `submitPrescription` automatically. Do NOT revert to manual two-step flow
6. **Brand color:** `#003344` (teal-dark)
7. **After code changes:** remind Maidul to run `clasp push` — do not push yourself
8. **Before implementing:** confirm which version the change targets
9. **Test via web app URL** after every `clasp push`
10. **WhatsApp** uses `wa.me` click-to-chat — no API key
11. **html2canvas** from CDN — do NOT bundle locally
12. **No external JS frameworks** — pure vanilla JS only

---

## 17. Quick Reference — Key CSS Classes / IDs

| Module | Key IDs / Classes |
|---|---|
| Rx View Modal (Phase 9, Tailwind) | `#view-rx-modal-overlay`, `#view-rx-id`, `#view-rx-medicines`, `#view-rx-medicines-empty`, `#view-rx-pdf-btn`, `#view-rx-send-wa-btn` |
| Rx Preview (iframe fallback) | `.rx-preview-overlay`, `.rx-preview-toolbar`, `.rx-pvw-btn` |
| Invoice Print | `.bdc-seal`, `.bdc-seal-paid`, `.bdc-seal-due`, `.bdc-wm`, `.bdc-cut-line`, `.bdc-copy-label`, `.bdc-logo` |
| Lab Queue Filter (Lab_Tech) | `#lab-filter-form`, `#lab-invoice-input`, `#lab-invoice-suggestions`, `#lab-from-date`, `#lab-to-date`, `#lab-date-btn`, `#lab-reset-btn` |
| Lab Queue Filter (Admin) | `#admin-lab-filter-form`, `#admin-invoice-input`, `#admin-invoice-suggestions`, `#admin-from-date`, `#admin-to-date`, `#admin-date-btn`, `#admin-reset-btn`, `#admin-lab-queue-container` |
| Lab Detail Modal | `#lab-detail-overlay`, `#lab-detail-body`, `#lab-detail-save-btn`, `#lab-detail-close-btn` |
| Lab Multi-File | `.ld-upload-cell`, `.ld-add-files-btn`, `.ld-file-pill`, `.ld-file-pill-existing`, `.ld-file-pill-pending`, `.ld-file-pill-remove`, `.ld-pending-files` |
| Reception Nav | `.reception-nav-grid` (`repeat(3, 1fr)`) |
| Analytics Admin | `#admin-pl-panel`, `#nav-admin-pl`, `#pl-revenue`, `#pl-expenses`, `#pl-profit`, `#pl-chart`, `#admin-dues-panel`, `#nav-admin-dues`, `#dues-collected`, `#dues-outstanding`, `#dues-table-wrap` |
| Analytics Lab | `#lab-overdue-section`, `#lab-overdue-body` |
| Analytics Doctor | `#doctor-today-stats`, `#doc-stat-total`, `#doc-stat-done`, `#doc-stat-remaining` |
| Analytics Reception | `#reception-today-stats`, `#rec-stat-patients`, `#rec-stat-appts`, `#rec-stat-invoices`, `#rec-stat-collected`, `#reception-dues-section`, `#reception-dues-summary`, `#reception-dues-body` |
| Analytics CSS | `.report-section`, `.report-stat-grid`, `.report-stat-card`, `.rsc-revenue/expenses/profit/warning/primary`, `.report-period-tabs`, `.period-btn`, `.report-chart-wrap`, `.badge-critical/high/info`, `.btn-wa-sm` |
| Due Collection | `#billing-opt-due-collection`, `#reception-due-collection-panel`, `#reception-due-collection-body`, `#reception-due-collection-back`, `#due-row-{rid}`, `#due-pay-row-{rid}`, `#due-amount-{rid}`, `#due-submit-{rid}` |

---

*Auto-read by Claude Code at session start. Update when major changes are made (new module, version, DB tab).*
