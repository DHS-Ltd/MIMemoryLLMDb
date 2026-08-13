---
name: dh-pacs-bogra-brownfield-site
description: Ibn Sina Bogura (SITE008) is the first BROWNFIELD site — Portal-only reuse of an existing Orthanc; process designed & working 2026-07-01
metadata: 
  node_type: memory
  type: project
  originSessionId: 05698280-cf8e-4779-80e1-ba13ae158198
---

**Ibn Sina Hospital & Diagnostic Center, Bogura = SITE008_DHPACS, MT-Gated.** The first
**brownfield** DH PACS site: the box already ran a live third-party Orthanc (`DHVIEWER`, wired to a
SIEMENS CT/MRI on 4242/8042, local Weasis viewer, two-drive D:->E: storage tiering via a Python
migration monitor). We onboarded it **without** the combined installer.

**Solution (designed via /grill-with-docs, confirmed working 2026-07-01):**
- **Do NOT run the combined installer** — its Receiver binds 4242/8042 and collides with `DHVIEWER`,
  and would force re-pointing the modality (forbidden — that's the site's only inbound path).
- **Portal-only + Tailscale.** Point the Portal at the existing Orthanc (`ORTHANC_URL=localhost:8042`).
  The Portal only needs a REST endpoint + a `Central` DICOM modality; it doesn't bundle Orthanc.
- **Outbound identity only:** add an inert `DicomModalities.Central` block to the existing
  `orthanc.json` with `LocalAet=SITE008_DHPACS` (Host 100.118.47.99, Port 4242, AET PACS_CENTRAL).
  Inbound `DicomAet` stays `DHVIEWER`; reception untouched. This is why "Site AET" = the
  **outbound/calling** AET (CONTEXT-MAP.md sharpened).
- MT-Gated push of **fresh** studies only (on primary :8042). Archived studies on :8043 aren't
  pushable without a Q/R pull-back. Local tiering and Central-push are independent.

**Also fixed Problem 1 (primary Orthanc didn't auto-restart after reboot):** Event 7034 crashes with
NO recovery action (archive is NSSM-wrapped & self-heals; primary native-wrapped, not). Fix =
`sc.exe failure Orthanc ... actions= restart/...` + `failureflag 1` + `start= delayed-auto`.

**In-repo source of truth (don't duplicate here):** ADR-0010
(`docs/adr/0010-brownfield-site-reuse-existing-orthanc.md`) = why; runbook
(`docs/IBN_Sina_Bogra/BOGRA_SETUP_RUNBOOK.md`) = every command; NEW_SITE_ONBOARDING.md has a
brownfield callout pointing to both.

**Two things to verify before any brownfield visit:** Node 20 installs on the box; an MT user exists
for the site (else studies queue unclaimable). Related: [[dh-pacs-program-status]],
[[dh-pacs-tailscale-tenancy]].
