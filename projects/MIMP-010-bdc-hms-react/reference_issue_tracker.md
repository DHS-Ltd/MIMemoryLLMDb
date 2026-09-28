---
name: reference-issue-tracker
description: "Google Form → GAS → GitHub issue tracker for BDC HMS. Form ID, script location, token storage, label taxonomy, and gh CLI auth details."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 7d059452-915b-4ffb-a2ac-d876f53dc65e
---

## BDC HMS Issue Tracker

**Pipeline:** Google Form → GAS `onFormSubmit` trigger → GitHub REST API → Issue in `DHS-Ltd/bdc-hms-react`

---

## File Locations

| File | Purpose |
|------|---------|
| `E:\BDCHMSV2\issue-tracker\Code.gs` | Main trigger script — form parsing, GitHub API call, confirmation email, label builder |
| `E:\BDCHMSV2\issue-tracker\FormSetup.gs` | One-time form creation (`createIssueTrackerForm`) + trigger installation (`installFormTrigger`) |
| `E:\BDCHMSV2\issue-tracker\appsscript.json` | GAS project manifest — OAuth scopes |

---

## Google Form

- **Form ID:** `1H7c80A8YYRBfUKggB1VAZs9dT287bSsvcC8ZugyqEjg`
- **Form title:** `BDC HMS — Issue / Bug Report`
- **10 questions:** Issue Title, Issue Type, Priority, Affected Module, Description, Steps to Reproduce, Expected Behavior, Actual Behavior, Your Name, Your Email
- The form ID is hardcoded in `installFormTrigger()` in FormSetup.gs (user edited it after running `createIssueTrackerForm()`)

---

## GAS Script Properties (secrets)

| Key | Value | How to set |
|-----|-------|-----------|
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope | GAS editor → Project Settings → Script Properties |

Never hardcode the token in source. `createGitHubIssue()` reads it via `PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN')`.

---

## GitHub Label Taxonomy (21 labels created in repo)

**Type** (5): `bug`, `feature`, `enhancement`, `ui/ux`, `performance`

**Priority** (4): `priority: low`, `priority: medium`, `priority: high`, `priority: critical`

**Module** (12): `module: auth`, `module: dashboard`, `module: patients`, `module: invoices`, `module: lab`, `module: doctor`, `module: reception`, `module: expenses`, `module: accounting`, `module: reports`, `module: admin`, `module: mobile`

Labels were created by running `setupGitHubLabels()` once from the GAS editor. Do NOT run it again — it handles 422 (already exists) gracefully but creates duplicates in some edge cases.

---

## Key Functions in Code.gs

| Function | Purpose | When to run |
|----------|---------|------------|
| `onFormSubmit(e)` | Main trigger — called automatically on form submit | Bound trigger, not manual |
| `testGitHubConnection()` | Verifies PAT works — logs repo name + open issue count | Run once to verify token |
| `setupGitHubLabels()` | Creates all 21 labels in the GitHub repo | Run ONCE only |
| `notifyAdmin(err)` | Sends error email to `directhospitalsolutionsltd@gmail.com` | Called internally on failure |

---

## gh CLI Authentication

- **Tool:** `gh` CLI v2.62.0 at `C:\Users\maidu\AppData\Local\Microsoft\WindowsApps\gh.exe`
- **Authenticated as:** `DHS-Ltd` account, stored in system keyring (persistent)
- **Token scopes:** `repo`, `admin:org`, `read:org`, and full suite
- **Verify:** `gh auth status` — should show `✓ Logged in to github.com account DHS-Ltd (keyring)`

To use from tool sessions: `gh issue list --repo DHS-Ltd/bdc-hms-react`

---

## Issue Body Format

Each GitHub issue gets:
1. `## Description` — form field
2. `## Steps to Reproduce` / `## Expected Behavior` / `## Actual Behavior` — shown for bugs or when any field filled
3. `## Metadata` table — Module, Type, Priority, Reported by, Submitted (BDT timestamp)
4. Footer: `_Submitted via BDC HMS Issue Tracker (Google Form)_`

Issue title format: `[{Type}] {Issue Title}` — e.g. `[Enhancement] Mobile UI menu in the admin rearranging`

---

## OAauth Scopes Required (appsscript.json)

```
forms, forms.responses.readonly, script.external_request, script.send_mail, script.scriptapp
```

---

## Screenshot / File Attachment Feature (implemented 2026-05-27)

- **Form question title (exact):** `Screenshot-FIle upload` — FILE_UPLOAD type, max 5 files, min 0 (optional)
- **Drive folder (public):** `https://drive.google.com/drive/folders/1k0ScIrdundbnZ5ThDgxY4I2P6idM3kpVN41Bw9Ha10O4JHfga3k5_vSIvVZRq6Y5I9HxMQFp`
- **GAS change:** `appsscript.json` now includes `https://www.googleapis.com/auth/drive` scope
- **Code.gs changes:**
  - `FIELDS.SCREENSHOT = 'Screenshot-FIle upload'`
  - `parseFormResponse` extracts `screenshotIds` array from ItemResponse
  - New `buildAttachmentLinks(fileIds)` — calls `DriveApp.getFileById`, sets per-file public sharing, returns markdown: inline `![]()` for images, `📄 [name](viewer)` for PDF/other
  - `buildIssueBody` appends `## Attachments` section before the `---` footer
- **Re-auth required:** After copying updated `appsscript.json` to GAS editor, run any function once — GAS will prompt to re-authorize with the new Drive scope

---

## Confirmed Working

Issue #1 (`[Enhancement] Mobile UI menu in the admin rearranging`) was submitted via the form on 2026-05-27 and retrieved successfully from GitHub with all 3 labels applied (`enhancement`, `priority: medium`, `module: dashboard`). The pipeline is end-to-end verified.
