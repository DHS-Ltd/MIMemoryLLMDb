---
name: project-completion-status-deployment-progress
description: Overall project phase status — all platform phases + GitHub repo + issue tracker COMPLETE as of 2026-05-26
metadata: 
  node_type: memory
  type: project
  originSessionId: c1b26584-3af3-457e-95ea-2ed4051a1c3a
---

## Overall Status (2026-06-02) — ALL PHASES COMPLETE ✅ | 2 Sites Live

### Platform Core — COMPLETE ✅
- Central server stack live on 192.168.1.10 (8 Docker containers)
- OHIF viewer branded as pacs-ohif-dhs:v1.1 (teal palette, DHS logo, favicon)
- End-to-end verified: DICOM → Orthanc → token link → OHIF renders pixel data
- Gold-path patient: AYESHA AKTER (MRN E1027809), MR lumbar spine, verified rendering

### SITE01 — COMPLETE ✅
- Local Orthanc at SITE01 installed, configured AET=SITE01_ORTHANC
- Tailscale VPN: SITE01 at 100.86.132.36, central at 100.118.47.99
- autolink.lua bugs fixed (RemoteAET from metadata endpoint, Modality from first series)
- Studies now record correct siteId and modality in database

### SITE03 — COMPLETE ✅ (2026-06-02)
- Hospital: Cumilla Medical College Hospital
- AET: SITE03_ORTHANC, Tailscale IP: 100.81.132.123
- Orthanc 1.12.11 installed as NSSM Windows service (auto-start confirmed)
- Philips MRI studies forwarding correctly — patient visible in admin dashboard and mobile OHIF
- See [[site03-cumilla-status]] for full detail

### Live site link_mode (verified 2026-06-06) — supersedes phase-0 "all auto" snapshot
`app.sites` now: SITE01_ORTHANC = **auto**, SITE02_ORTHANC (Block Test) = **auto**, SITE03_ORTHANC (Cumilla) = **mt_gated**, SITE04_ORTHANC (OfficeLab-DHS) = **mt_gated**, `unknown` placeholder = auto. So the MT-gated claim/telemetry path has real production data (SITE03/04); auto sites get size/counts only. See [[saas-patient-list-telemetry]].

### Admin Frontend — COMPLETE ✅ (all 4 phases, 2026-05-25/26)
- Phase 1 (Registry plumbing): COMPLETE ✅
- Phase 2 (Shell + auth + React): COMPLETE ✅
- Phase 3 (Onboarding UX / instructions): COMPLETE ✅
- Phase 4 (Patients + links + audit): COMPLETE ✅

See [[admin-frontend-build-status]] for full detail.

### GitHub Repository — COMPLETE ✅ (2026-05-26)
- Repo: `https://github.com/DHS-Ltd/dh-pacs-central` (private, DHS-Ltd org)
- Branch: `main`. Initial commit: 101 files.
- Sensitive files gitignored: real `.env`, `.claude/`, graphify artifacts, credential screenshots, certs.
- See [[reference-github-repo]] for full gitignore details.

### Issue Tracker — COMPLETE ✅ (2026-05-26)
- Google Form: `https://forms.gle/v4rfsYmka8Lhs4oS8`
- Apps Script (`tools/issue-tracker/Code.gs`) converts form submissions to GitHub Issues
- Key fix: standalone form-bound scripts use `e.response.getItemResponses()`, NOT `e.namedValues`
- GitHub issue templates in `.github/ISSUE_TEMPLATE/` (bug, feature, config)
- See [[reference-github-repo]] for label list and token setup.
