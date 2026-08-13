---
name: dh-pacs-tailscale-tenancy
description: "Tailscale multi-site tenancy model — one tailnet, hub-and-spoke ACL, tagged per-site auth keys (ADR-0009); LIVE as of 2026-06-26"
metadata: 
  node_type: memory
  type: project
  originSessionId: 55121aaa-7ab6-4e78-9efb-7ce68991a725
---

DH PACS sites reach Central over Tailscale (DICOM C-STORE to `100.118.47.99:4242`). As of
**2026-06-26** the tailnet is locked down per **ADR-0009** (`docs/adr/0009-tailscale-tenancy-and-identity.md`).

**Account today:** ONE tailnet `tail8a98e1.ts.net`, owner `directhospitalsolutionsltd@gmail.com`,
**Free tier** (personal Gmail). Deliberately staying on this for now; migrate to a company-domain
org on a paid plan only after business traction (the ADR-0009 migration trigger). Driver = isolation
+ governance.

**Model = one tailnet, hub-and-spoke, tag-isolated:**
- ACL policy is version-controlled at `infra/tailscale/policy.hujson` (source of truth; paste into
  Tailscale admin -> Access Controls -> JSON editor, NOT the visual editor).
- Tags: `tag:site` (hospital boxes), `tag:central` (pacs-central), `tag:admin` (DH build/support box).
- Rules: `tag:site -> tag:central:4242` only; `tag:site -> tag:site` DENIED by default-deny;
  `tag:admin -> *:*`; owner-user `directhospitalsolutionsltd@gmail.com -> *:*` (safety net keeping
  untagged DH personal/staff devices connected through the cutover).
- **Tagging a box is what switches isolation ON** — an untagged box still falls under the owner-user
  rule (full access). Tagged devices are owned by the tag (not the user) and have key-expiry disabled
  (good for headless hospital boxes).
- LIVE + verified: from the Ibn Sina box, `Test-NetConnection central -Port 4242` = True over the
  Tailscale interface; site->site to another hospital box = False (falls back to Ethernet, no route).

**Per-site connect (no shared login!):** mint a single-use, short-expiry auth key tagged `tag:site`
(Tailscale admin -> Settings -> Keys), install the Tailscale client on the box but DO NOT sign in,
then `tailscale up --authkey=tskey-... --advertise-tags=tag:site --unattended`. New boxes self-tag
`tag:site` and are born isolated.

**v1.1.0 installer — bundled Tailscale auto-install (built 2026-06-26, VERIFIED WORKING 2026-06-28).**
The combined installer now BUNDLES a pinned Tailscale client MSI (`1.98.4`, SHA256
`95FA86...1746`) and silently installs it when absent, then joins (ADR-0009 addendum). Flow in
`installer/connect-tailscale.ps1` (one `[Run]` Step 0, gated on a key being entered, non-fatal,
logs to `C:\DHPacs\tailscale-connect.log` + `tailscale-msi-install.log`): detect ->
if absent `msiexec /i tailscale-setup.msi /quiet /norestart TS_UNATTENDEDMODE=always`
(accept exit 0/3010) -> poll ~30s for CLI+service -> `tailscale up --advertise-tags=tag:site
--unattended`. **Skip-if-present** (any version, never upgrades a working box).
- Build pipeline: `installer/tools/fetch-tailscale.ps1` (pin+SHA256, mirrors fetch-orthanc) ->
  stages `installer/payload/tailscale/tailscale-setup.msi` (gitignored); called from
  `build-combined.ps1` step `[3/6]`. `.iss` bumped to v1.1.0, ships MSI to `{app}\scripts\`.
- BUILT: `dist\dh-pacs-workstation-setup-v1.1.0.exe` (80.9 MB; +27 MB vs v1.0.0). Embedded-MSI
  hash verified == pinned. Skip-if-present detection verified on the build box.
- **VERIFIED WORKING (2026-06-28):** on-box test confirmed the box joins tagged `tag:site`,
  `Test-NetConnection 100.118.47.99 -Port 4242` = True, `DH-PACS-Portal` service Running.
  Tailscale integration working fine per user. NOTE: a blank auth-key in the wizard SKIPS the
  whole Tailscale `[Run]` step (gated on `AuthKeyProvided`) and writes NO log — that is expected
  for boxes already joined; to exercise auto-install the box must have NO Tailscale AND a key
  pasted. Logs (`C:\DHPacs\tailscale-connect.log`, `tailscale-msi-install.log`) only appear when
  the step actually runs.
Onboarding doc `docs/NEW_SITE_ONBOARDING.md` §3.1 already updated to the bundled-auto-install flow.

Related: [[dh-pacs-program-status]], [[central-vm-deploy]], [[dh-pacs-mt-push-architecture]].
