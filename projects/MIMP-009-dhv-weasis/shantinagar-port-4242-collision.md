---
name: shantinagar-port-4242-collision
description: SITE018 Popular Shantinagar install-day outage - another app owned DICOM port 4242; also the reusable "reason 7 can never come from a DH Receiver" deduction.
metadata:
  type: project
---

SITE018 Popular Diagnostic Center Shantinagar went live 2026-09-01 on a shared PC named `PHILIPS`.
The Viewer's Q/R failed with `A-ASSOCIATE-RJ[... reason: 7 - called-AE-title-not-recognized]`.
Root cause: a WindowsApps app **`RadioGram` 2.5.1.0** (`com.companyname.radiogram`, unidentified,
stock .NET MAUI package identity) already held `0.0.0.0:4242` since the day before the install, so
Orthanc crash-looped (`code 2004`), the service sat at **`Paused`** (NSSM throttling), and RadioGram
answered the Viewer's C-FIND and rejected it. Fixed by stopping it + disabling its Startup shortcut;
verified with a live Philips MRI C-STORE at 14:21.

**Why:** the deduction that shortened this is reusable and non-obvious — **a DH Receiver can never
emit reason 7.** `Orthanc.exe` has exactly one bad-called-AET rejection path and it is gated by
`DicomCheckCalledAet`, which no DH config layer sets. Reason 7 therefore *always* means the peer is
not our Receiver, which collapses the problem to "who owns 4242".

**How to apply:** on any `called-AE-title-not-recognized`, skip AE-title hunting and check port
ownership first. Also remember: `Get-Service DH-PACS-Receiver` reading `Paused` = crash-looping, not
paused; and run shipped scripts as `powershell.exe -ExecutionPolicy Bypass -NoProfile -File`, never
`& script.ps1`.

Authoritative docs (all written 2026-09-01, uncommitted):
`01_Pacs_File\01_Pacs_File\docs\Popular_Shantinagar_System_Onboarding\` (README + SITE_FACTS +
`2026-09-01_port-4242-collision-radiogram.md`), the new symptom index
`docs\Problem_Troubleshooting\README.md`, and pointers added to `04_SUPPORT_RUNBOOK.md`,
`06_CONNECT_A_NEW_CUSTOMER.md` (Stage 2 + Stage 5 + a sixth failure mode), `orthanc\README.md`
and `THIRD_PARTY_DICOM_INTEGRATION.md`.

Open: reboot test not yet done; RadioGram still unidentified; RadiAnt 2025.2 also on the box (future
collision risk); AV exclusion still missing (same gap as [[mirpur-orthanc-av-sqlite-lock]]).
Product defects logged: `Test-DhPacsHealth.ps1`'s `DICOM_PORT` check false-PASSes on a foreign
listener; the installer never pre-checks 4242; and `DicomPort` cannot be overridden per-site
(ADR-0015). Site record shape follows [[site-onboarding-docs-pattern]].
