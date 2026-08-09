---
name: reference-github-repo
description: "GitHub repository URL, branch, what is gitignored, and issue tracker Google Form URL"
metadata: 
  node_type: memory
  type: reference
  originSessionId: c1b26584-3af3-457e-95ea-2ed4051a1c3a
aliases: [reference-github-repo]
---

GitHub repo: `https://github.com/DHS-Ltd/dh-pacs-central` (private, org DHS-Ltd)
Branch: `main`
Set up: 2026-05-26. Initial commit: 101 files. Issue tracker added same day.

## Key gitignored items
- `deploy/compose/.env` — real credentials (use `.env.example` as template)
- `.claude/` — SSH key paths, VM IPs, command permissions
- `graphify-out/`, `.graphify_*.json`, `.graphify_python`, `.graphifyignore`
- `docs/Graphify/agent1Input.md`, `docs/Graphify/agent2Input.md`
- `docs/researchDocs/*.PNG` — Tailscale/network screenshots
- `docs/Phase1Complete/DH_Pacs_OWNER_DASHBOARD.pdf` and `Patient_transfer_central_server.png`
- `docs/Site01Docs/SSH_Key_installed.PNG`
- `.env_credentials.PNG`

## Issue tracker
- Google Form (public): `https://forms.gle/v4rfsYmka8Lhs4oS8`
- Apps Script: `tools/issue-tracker/Code.gs` (bound to the Google Form)
- GitHub token stored in Apps Script → Script Properties → `GITHUB_TOKEN`
- Reads responses via `e.response.getItemResponses()` — NOT `e.namedValues` (only available for Sheet-linked forms)
- Labels created in GitHub: `from-form`, `needs-triage`, `critical`, `high-severity`, `medium-severity`, `low-severity`, `dicom-routing`, `viewer`, `share-link`, `admin-panel`, `performance`
- Issue templates: `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`, `config.yml`
