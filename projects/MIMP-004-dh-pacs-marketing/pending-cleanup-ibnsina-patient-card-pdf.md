---
name: pending-cleanup-ibnsina-patient-card-pdf
description: "Ibn Sina real-patient card PDF (real name + bearer QR): file MOVED out of the repo 2026-09-26; bearer token revocation on the server still pending — Maidul's step"
metadata:
  type: project
  originSessionId: 291e24b2-27b2-4a9e-a689-c82ecb2e918b
  created: 2026-09-16T00:00:00.000Z
  modified: 2026-09-25T20:58:07.425Z
---

A printed "Medical Image Access" card for the 16 Sep demo's beat-6 linked patient held a real
patient's name, mobile number and DH Patient ID, plus a **bearer-credential QR that opens the study
with no login**. Same class of violation as the resolved `Popular_Diagnostic` incident (ADR-0004,
`DEMO_BUILD_FINAL.md` B6). The patient's name is deliberately not repeated here: memory is a PHI leak vector too.

**2026-09-26, done:** file moved from `docs/IbnSinaCancerPacs/demo_handouts/` to
`E:\DHS-Archive\IbnSina_Patient_Card\` (outside the repo, never to be edited or committed);
`*dh-pacs-DHP-*.pdf` added to `E:\DHS-PACS\.gitignore`; no other `*DHP-*` file found under `docs/`.

**Still pending, Maidul's step:** revoke that patient's bearer token on the live server
(`DEMO_BUILD_FINAL.md` B6). Until then the printed QR still opens the study. This half of V11 in
`BRANCH_MANAGER_PLAN.md` blocks Meeting 1.

Related: [[project-ibnsina-branch-manager-plan]], [[project-demo-rig-machines]]
