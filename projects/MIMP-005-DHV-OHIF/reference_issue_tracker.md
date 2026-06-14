---
name: ""
metadata: 
  node_type: memory
  originSessionId: 968f5efd-bfe0-4cd2-a98c-1ba41dc2bccb
---

## What it is
A Google Form → GitHub Issues pipeline for collecting bug reports and feature requests from hospital staff, radiologists, DHS admins, and patients. Implemented as a Google Apps Script (`Code.gs`) bound to a Google Form.

## Files
- `D:\Pacs_Viewer_Storage_Project\tools\issue-tracker\Code.gs` — the Apps Script
- `D:\Pacs_Viewer_Storage_Project\tools\issue-tracker\SETUP.md` — full setup guide (form questions, token setup, trigger, labels)

## Where issues land
- **GitHub repo:** `DHS-Ltd/dh-pacs-central` (NOT `ohif-viewer-dhs`)
- **API endpoint:** `POST https://api.github.com/repos/DHS-Ltd/dh-pacs-central/issues`
- **Auth:** Fine-grained PAT stored in Apps Script Script Properties as key `GITHUB_TOKEN` (Issues: Read/Write on `dh-pacs-central` only)

## Form structure (16 questions)
Reporter identity, role, hospital/site, category, severity, title, description, steps to reproduce, expected/actual behavior, patient MRN reference, URL, browser/device, error message, screenshot (file upload).

## Label system
- Always applied: `from-form` + `bug` or `enhancement`
- Category labels: `dicom-routing`, `viewer`, `share-link`, `admin-panel`, `performance`, `needs-triage`
- Severity labels: `critical`, `high-severity`, `medium-severity`, `low-severity`

## Flow
1. User submits Google Form
2. `onFormSubmit` trigger fires Apps Script
3. Script reads named values, builds formatted issue body (markdown table + sections)
4. POSTs to GitHub API → issue created in `dh-pacs-central`
5. Confirmation email sent to reporter via `GmailApp`

## Screenshot handling
Supports both standalone (form-bound) and Sheet-linked form modes — Drive file IDs vs. full Drive URLs are handled separately. Up to 5 attachments per issue.

## How to apply
- If adding a new issue category, update `CATEGORY_LABEL_MAP` in `Code.gs` AND create the label in `DHS-Ltd/dh-pacs-central`
- If the form question text changes, update the field key strings in `Code.gs` (must match exactly)
- Token renewal: regenerate Fine-Grained PAT at GitHub → Settings → Developer Settings → Fine-grained tokens; update Script Properties
- Troubleshoot via Apps Script editor → Executions tab (logs all runs and errors)
