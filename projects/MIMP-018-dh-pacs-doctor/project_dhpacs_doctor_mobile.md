---
name: project-dhpacs-doctor-mobile
description: "Android phone version of the Doctor Desk — designed via /grill-with-docs 2026-09-05, parked mid-session at the sequencing question, nothing built"
metadata: 
  node_type: memory
  type: project
  originSessionId: cb373a38-5cfd-4bff-949d-60bc22cfe251
  modified: 2026-09-05T14:29:01.811Z
---

Doctors asked for a mobile version of the [[project-dhpacs-doctor-desk]]. Design session on 2026-09-05
resolved nine forks, then the user parked it: **"I will come back to this issue in future session."**
**No code exists.** Full record: `docs/DoctorMobile/DHPacs_Doctor_Mobile_Plan.md`; summary section added to
`CLAUDE.md`.

Decided: **Capacitor remote-content shell, Android only** (same ADR 0021 architecture as the Desk; iOS
deferred until Android succeeds). **Sideloaded APK on a self-hosted `/app-updates/` feed** — the user
explicitly rejected paying for Google Play *"unless it's commercially feasible"* and said doctors don't mind
install warnings. **Biometric gate** (a deliberate divergence from the Desk's trust-the-OS-user decision).
**Push via contentless FCM doorbell**, per-site opt-in, default OFF, triggered on `pixels_received_at`.

**Why:** the Doctor Portal SPA is *already* phone-responsive, so an app is only justified by what a browser tab
cannot do — an icon, a persistent Device Token, and push. Push is the real reason; everything else a PWA would
give for free.

**How to apply:** three things a future session must not quietly undo. (1) **Shell updates cannot be silent**
on a sideloaded APK — Android has no `electron-updater` equivalent, so it is "tap to install", and the
`minVersion` brake is the only lever that can move a stranded fleet. Do not claim Desk parity here. (2)
**Generate the upload keystore before the first build** even though Play was rejected — an own-key APK and a
Play-signed APK are different apps to Android, so migrating later without it forces uninstall/reinstall and
destroys every doctor's Device Token. (3) The recommended and **unanswered** blocking prerequisite is to commit
the Desk's still-uncommitted work in both repos first and deploy the backend half through `deploy.yml` per
central ADR 0022 — the phone authenticates against `/device/*` routes that exist only as working-tree state
plus hand-placed VM files. See [[feedback-production-deploy-verification]].
