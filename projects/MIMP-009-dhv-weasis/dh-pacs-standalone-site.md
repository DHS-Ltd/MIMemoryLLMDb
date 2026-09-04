---
name: dh-pacs-standalone-site
description: The DH PACS Standalone Site workstream — Receiver (branded Orthanc) + DH DICOM Viewer on one box; plan and ADRs locked 2026-08-22.
metadata: 
  node_type: memory
  type: project
  originSessionId: e85e1bad-b4cf-4a3f-9e7b-fb421d3dd99f
  modified: 2026-08-26T10:15:53.571Z
---

Second product line alongside the [[film-composer-module]]: a **Site** = one hospital box running
the **Receiver** (white-labelled Orthanc 1.12.11 / Osimis 26.6.0) and the **Viewer** (DH DICOM
Viewer) together, with **no Central and no MT Portal** at runtime.

Plan and decisions locked in a grilling session on **2026-08-22**; all of it is written down in the
repo — read those rather than re-deriving:

- `E:\DHV-Weasis\01_Pacs_File\01_Pacs_File\docs\COMPONENT_A_SITE_BUILD_PLAN.md` — the plan, 7 phases
- `…\docs\adr\0012` (C-GET transport), `0013` (site AET in the signed license), `0014` (Working
  Cache), `0015` (Receiver config is **partitioned, not layered**)
- `…\CONTEXT-MAP.md` + `…\orthanc\CONTEXT.md` — glossary, rewritten this session

**Non-obvious context that is NOT in the repo:**

- The **Central** project lives on a *different machine* ("machine B", `D:\Pacs_Viewer_Storage_Project`)
  and is unreadable from this one. Site AETs are allocated there via admin registration even for
  boxes that never connect to Central at runtime.
- The business driver behind per-site DH-allocated AETs is **control, not DICOM**: nobody may run the
  system fully without registering with DH first. That is why the AET moved into the RSA-signed
  `.dhvlicense` rather than staying a wizard field.
- `E:\DHV-Weasis\01_Pacs_File` is a **partial hand copy**, not a repo — missing `LICENSE.txt`,
  `NOTICE.md`, `.gitignore`, `build-all.ps1`, `installer/`, and most of `docs/adr/`. `iscc` cannot
  build Component A until those are restored (Phase 2).

**Frontier (2026-08-23, later the same day): Phases 1-6 DONE, Phase 7 licence-critical tests (1-5 of
6) now DONE too — real target machine, not a build box.** Only **Test 6 (DX/CR retrieval)** remains,
and it is unrelated to licensing (separate pre-existing risk, ADR-0012). See the dedicated "Phase 7 —
remote-machine acceptance" section below for what was actually run and found. The agent still cannot
launch elevated installers or reach a remote machine directly — every elevated/remote step was handed
to the user as an exact command, with results pasted back and interpreted.

Phase 3 was live-verified on `E:\DHPacs\Orthanc` (v0.2.0 -> v0.4.0 over a *running* Receiver), and
the Known Caller was proven with a **real C-FIND plus a negative control**: `DHV_SCU` -> Success,
1 match (`ABDUL HAKIM MD. [E571424] / MRV L/L [MR]`); `ROGUE_SCU` -> `DICOM authorization rejected
... not listed in configuration option "DicomModalities"`. Reusable recipe — no DCMTK needed:
compile a tiny `CFind.process(...)` main against
`jpkg-out5\DHDicom\app\bundle\weasis-dicom-codec-1.0.0.jar` + `weasis-core-img-4.13.0.jar`
(for `org.weasis.core.util.StringUtil`) + `app\weasis-launcher.jar` (for slf4j), run with the
system JDK. Note **C-ECHO proves nothing here** — `DicomAlwaysAllowEcho` is true, so any caller
passes; C-FIND is the one that exercises the Known Caller gate. The jlink runtime in the app-image
has **no `java.exe`**, so a probe cannot be shipped inside the installer.

**Phase 6 facts worth keeping:**
- **Inno ignores `[Run]` exit codes by default.** The bundle therefore chains its two children from
  `[Code]` with `Exec` + an explicit `ResultCode` check; with `[Run]` a failed child would have been
  reported as a successful install.
- **`Label` is a reserved word in Inno Pascal Script** — using it as a parameter name is a compile
  error with only a line/column, no message.
- **Never derive the box's LAN IP by enumerating adapters.** WSL/Hyper-V/Docker virtual adapters give
  plausible `172.x`/`192.168.x` answers (this box first reported `172.18.208.1`). Follow the default
  route instead; `Get-DhPacsLanIp.ps1` is the single shared implementation, dot-sourced by both the
  health check and the logon watch. Wrong value => `handover.txt` sends the modality to a dead address.
- **Orthanc: `GET /modalities/{id}` returns allowed OPERATIONS, not config.** Use
  `/modalities/{id}/configuration` to read `AET`/`Host`/`Port`.
- The Viewer installer is now **v1.1.0** and packages the jpackage app-image from
  `weasis-distributions\target\jpkg-out5\DHDicom` (NOT the stale `E:\DHV-Weasis\Installer\app`,
  which is the April runtime-less payload and should be considered dead).

**Installer defect found and fixed 2026-08-23 — the single most expensive lesson of the session.**
The running Receiver holds `bin\orthanc\Orthanc.exe` and `bin\nssm\nssm.exe` open, and
`payload\bin\orthanc\*` is the FIRST `[Files]` entry. Upgrading over a live Receiver died on a
sharing violation before writing anything — and with `/SUPPRESSMSGBOXES` Setup answered its own
retry dialog, **rolled back and exited 0**. Symptom: total silence, registry still on the old
version. v0.2.0 had only ever been installed onto a box with nothing running, so it never surfaced.
Fixed with `PrepareToInstall` running **`net stop`** (blocks until actually stopped; `sc.exe` returns
on *request* and races the copy) + a `sc query | find "RUNNING"` confirm loop.
**Always pass `/LOG=` and run these installers via `Start-Process -Wait -PassThru`** — Inno's first
stage detaches, so a bare invocation returns instantly and the exit code tells you nothing.

**Phase 4 facts worth keeping:**
- `License\test_site.dhvlicense` is the **shared drift fixture** (9-field Site licence, AET
  `SITE004_DHPACS`). Both verifiers must accept it and both must reject a tampered copy; re-run
  both halves after touching either. Java half: `java -cp <weasis-launcher\target\classes>;<out>
  TestLicense <path>` (TestLicense.java now takes an optional path, and
  `LicenseValidator.validateFile(File)` exists so fixtures don't disturb the installed licence).
- **Windows PowerShell 5.1 has no `RSA.ImportSubjectPublicKeyInfo`** (.NET Core 3.0+ only), so
  `Verify-DhvLicense.ps1` walks the SPKI DER by hand to keep the *same* base64 key literal as
  `LicenseValidator.java`. Do not "simplify" it by embedding modulus/exponent separately — that is
  the drift ADR-0013 exists to prevent.
- `mvn -pl weasis-launcher compile` (no `-am`) is a safe, fast Java check that avoids the
  `dcm4che-dict` marker trap.
- Silent `/AET=` **bypasses licence verification** in the child installer by design (the bundle
  verifies once, upstream). So the Receiver installer must never be shipped to a customer alone.

**Two Orthanc facts proven this session that no doc anywhere states — do not re-derive:**
- Orthanc 1.12.11 merges a config *directory* by **union and aborts on any repeated top-level key**
  (`Bad file format: The configuration section "X" is defined in 2 different configuration files`).
  There is **no override**: `90-` cannot win over `10-`, so the three files must be **disjoint**.
  This forced `DicomModalities` (incl. the DHV Known Caller) to live only in the *site-owned*
  `90-site-local.json`, with the installer repairing just the `DHV` entry on upgrade. A shared
  `_README` key would itself collide — hence `_README_base` / `_README_site` / `_README_local`.
- `DicomModalitiesInDatabase: true` **discards the config seed**: first boot with a `DicomModalities`
  block gave `GET /modalities` -> `[]`. It is not a usable escape hatch from the collision.
- Orthanc accepts `//` comments and unknown keys; **PowerShell 5.1 `ConvertFrom-Json` does not accept
  comments**, so shipped config files avoid them (the installer must parse them).

Live test rig on this box, reusable: Receiver at `E:\DHPacs\Orthanc` (AET `SITE004_DHPACS`, one
Enhanced MR study, REST creds in `credentials.txt`); packaged viewer built to
`weasis-distributions\target\jpkg-out4\`.

**Build traps that cost real time this session — do not relearn them:**
- The root `mvn clean install` does NOT refresh `weasis-distributions/target/native-dist/weasis-native.zip`;
  run `mvn package` from `weasis-distributions/` or you silently test a stale build.
- **Never use `mvn -pl <module> -am`** here: maven-dependency-plugin's marker file suppresses the
  `dcm4che-dict` unpack, yielding a `weasis-dicom-codec` jar missing `dataelements.xml`. Symptom is
  runtime-only — `Cannot read dataelements.xml!` plus `Cannot find tag` warnings. Fix by deleting
  `weasis-dicom-codec/target/dependency-maven-plugin-markers/*.marker`.
- `mvn clean` fails while VS Code's Java language server or any DHV instance holds `target`.
- `package-weasis.sh` needed three fork fixes (now in the source script) — see the plan's Phase 5.

**Committed 2026-08-22.** Workstation repo: `git init` + initial commit `11c07ee` (74 files). DHV
repo: branch **`feat/dh-pacs-site-integration`**, commit `86f177647`, holding ONLY the 11 PACS files.
The DHV working tree still carries **83 uncommitted files of the user's own prior work** (Film
Composer 6x/7x, MCP, doc moves) on top of `spike/mcp-step0` — deliberately left alone; never sweep
those into a commit. Neither repo has a remote; nothing was pushed.

The executable is now **`DHDicom.exe`** (jpackage `NAME=DHDicom`) with a DH-branded 7-size icon
generated from `Asset/DHV-Logo.png`. Note `Asset/output/Weasis.ico`, used by the Inno installer, is
still a single 16x16 image that Windows upscales into a blur — worth regenerating.

**Still open:** DX/CR C-GET test deferred by the user (ADR-0012 flags DX/mammo as the risky SOP
families; only MR is proven). `DHDicomViewer_Setup.iss` `[Icons]` still points at
`wscript.exe launch.vbs` and must be repointed at `DHDicom.exe` before Phase 6. Whether a
`resources/`-shipped DICOM node is truly non-editable in the UI remains unverified — observed
behaviour contradicts the `isLocal()` gate (plan §7).

## Licence hardening (grilled 2026-08-23) — decisions locked, not yet built

19 decisions taken; all rationale is in the repo, read it rather than re-deriving:
`docs/adr/0016-licence-enforcement-boundary.md`, `docs/adr/0017-licence-signing-key-custody.md`,
`docs/LICENCE_HARDENING_PLAN.md` (build order L0-L5), and the new `Bound Machine` /
`Weak Binding` glossary terms in `CONTEXT-MAP.md`.

**The load-bearing rule:** the Site License gates **reading**, never **receiving**. C-STORE always
works. A Receiver that refused a store over licensing could lose a study and force a re-scan —
re-irradiation on CT — so a billing dispute must never reach that outcome.

**Not in the repo, and worth keeping:**

- Threats the user named: **branch sprawl** (a chain like Popular Diagnostic copying to other
  branches — the likeliest, and not malice) and **competitor/ex-partner resale**. Resale is
  knowingly left unaddressed: it needs revocation, revocation needs a check-in, and the check-in was
  deferred (fields reserved).
- Site boxes **do** have internet, but treat it as flaky — never block reading on a network failure.
- Two defects found by reading code, both real: the installer writes the licence to `{userappdata}`
  under `PrivilegesRequired=admin`, so a UAC-elevated install lands it in the *admin's* profile and
  an ordinary hospital install shows "No license file found"; and `GRACE_PERIOD_DAYS` doubles as the
  warning window, giving a customer 14 days total — shorter than a Bangladeshi hospital's payment
  cycle.
- Two traps that killed the obvious designs: `MachineGuid` + volume serial are **both copied by disk
  cloning** (so the fingerprint must be hardware-anchored), and a rollback-detection scheme would
  block honest sites on a **flat CMOS battery** (hence `max(clock, high-water)` instead).
- Whitebox PCs here report junk hardware IDs (`Default string`, shared placeholder UUIDs) — hence
  **Weak Binding**, which is never a refusal.
- **Do phase L0 and the `machine_id: "*"` re-issue before binding ships.** The public-key *list*
  cannot be retrofitted to deployed readers, and without the `"*"` sentinel the first casualty of
  binding is DH's own multi-machine `DHS_2027.dhvlicense`.

**PROVISIONAL — revisit when customer volume justifies it (flagged 2026-08-23):** the machine
fingerprint design (hardware-anchored: BIOS/system UUID + baseboard serial + physical disk serial,
with MachineGuid demoted to a tiebreak and Weak Binding as the never-refuse fallback) is accepted
*for now* on reasoning, not on field data. The user will revisit once there is a volume of real
customer requirements and real hardware to sample. Do not treat the signal list, the junk-value
blocklist, or the >=1-hardware-signal rule as settled: they are a first cut chosen because
MachineGuid and the volume serial are both carried by a disk clone, which inverted the original
proposal. Re-open when deployment data exists.

**Binding model CORRECTED 2026-08-23 (read ADR-0016 §Correction before touching L3).** The original
"installer binds on first install" decision was wrong: branch #2 just re-runs the installer with a
copied .dhvlicense and it binds there. A locally-stored first-use lock cannot be enforced across
machines, because a fresh machine has no lock to check. Only a value DH *signs* can do it. So:
**pre-binding at issuance** — DH reads a machine code off the PC at the site survey (`DhSiteId.bat`
on the engineer's USB, wrapping the shared PS fingerprint module) and signs it into `machine_id`.
Two states only: a code (must match) or absent (unbound); the `"*"` sentinel is dropped as a second
spelling of one state.

Not in the repo: the reason install-day mismatch cannot hard-block is that **DH is one person, and
"on site" and "at the signing key" are mutually exclusive states** — a hard block means a dead trip
back to Dhaka. Hence the 14-day Unverified state. Also: `generate_license.py` must *require*
`--machine-id` or `--unbound`, because a forgotten flag ships a permanently unprotected licence that
works everywhere and is never noticed — operator slip, not attacker, is the realistic failure.

**L1+L2+L3 BUILT 2026-08-23** (L0 step 3 too). Status and evidence are in
`docs/LICENCE_HARDENING_PLAN.md`; do not re-derive. Non-obvious things worth keeping:

- The Machine Code fingerprint is implemented **once**, in `Get-DhMachineCode.ps1`; Java shells out
  to it. Java cannot read SMBIOS natively and `wmic.exe` is gone from Windows 11, so a Java version
  would have shelled out anyway - one implementation deletes the ADR-0013 drift risk rather than
  managing it. Every failure returns "unknown" and the binding check is skipped: never block a launch.
- Repeated build trap this session: **backslashes in heredoc Python strings get collapsed by the tool
  layer**, silently corrupting Java regexes, Inno anchors and file paths (one produced a literal
  0x01 byte in a source file). Build paths with `chr(92)` and always assert that anchors matched.
- **Inno Pascal comments are `{ }`**, so `{commonappdata}` inside a comment closes it early and the
  rest parses as code. ISCC catches it; review does not.
- Tests can lie: a skip-path test with the bad key second never exercised the skip, and a shadow-class
  test silently used the real class because `Set-Content -Encoding utf8` wrote a BOM. Check the test
  actually ran the thing it claims to.

**L4 built 2026-08-23.** The Receiver gate empties `DicomModalities` in `90-site-local.json` (the only
non-colliding lever under ADR-0015) and always re-checks the service afterwards, rolling the config
back if Orthanc does not answer. `DicomAlwaysAllowStore` is never touched. Not in the repo: the
Viewer and the gate task **share one HMAC'd `state.dat`**, and that interop was proven in both
directions - if either side's HMAC changes, they will silently disagree about the day reading stops.

Trap worth keeping: **`Register-ScheduledTask` is CIM-backed and raises a NON-terminating error that
`$ErrorActionPreference='Stop'` does not convert.** A non-admin run printed "registered" right after
"Access is denied". Any CIM cmdlet needs an explicit `-ErrorAction Stop` *and* a verify-after.

**`E:\DHV-Weasis\License\` and `E:\DHV-Weasis\Installer\` are NOT under version control** — not in
any git repo, confirmed 2026-08-24. That covers `generate_license.py`, `keys/` (both signing keys),
every issued `.dhvlicense`, all of `docs_reference/`, and `DHDicomViewer_Setup.iss`. Only
`01_Pacs_File\01_Pacs_File` and `DHDicomViewer\dh-dicom-viewer` are repos. **Do not `git init` in
`License/` without a `.gitignore` written first** — `keys/private_key.pem` is sitting there in
plaintext and would go straight into history. Worth fixing deliberately, not incidentally.

**Operator docs written 2026-08-23** in `E:/DHV-Weasis/License/docs_reference/` (00_START_HERE,
01_BUILD_THE_INSTALLERS, 02_TEST_ON_A_REMOTE_MACHINE, 03_ISSUE_A_SITE_LICENCE, 04_SUPPORT_RUNBOOK,
05_FINISH_KEY_BACKUP). **`06_CONNECT_A_NEW_CUSTOMER.md` added 2026-08-24** — the end-to-end spine
(agreement → Site Registration/AET → survey → build+issue → install → prove → handover → register),
sequencing the other five rather than duplicating them. Read it first when a customer signs; `00`
now points at it. Handoff at `%TEMP%/DHPACS-handoff-2026-08-23-licensing.md`. All six kept
current after the Phase 7 run below (docs corrected inline, not left to rot).

**Blocking build trap, not obvious from the code:** the Viewer installer packages the *jpackage
app-image*, not `weasis-launcher/target/classes`. `mvn -pl weasis-launcher compile` therefore proves
nothing about what ships - `package-weasis.sh --no-installer --jdk <jdk-25>` must be re-run or the
installer carries the previous day's LicenseValidator, silently.

## Phase 7 — remote-machine acceptance (2026-08-23, later the same day)

Tests 1-5 of `docs_reference/02_TEST_ON_A_REMOTE_MACHINE.md` run for real against a genuine target
machine (`MAIDUL-ISLAM`, separate from the build box — user profile `HP`, not `maidu`). All five
passed. Full evidence trail is in `docs/LICENCE_HARDENING_PLAN.md` under each phase (L2/L3/L4)
rather than repeated here.

**The documented rebuild procedure was itself incomplete and would have silently shipped a stale
build again — found and fixed before testing began, not during:**
1. `mvn -pl weasis-launcher compile` (what `01_BUILD_THE_INSTALLERS.md` said) never touches `~/.m2`;
   needs `install` instead, then a separate `mvn package` in `weasis-distributions/` to regenerate
   `weasis-native.zip`.
2. The exploded `target/native-dist/bin-dist/` folder `package-weasis.sh` reads from is **not**
   refreshed by `mvn package` (only the zip is) and can sit there stale/incomplete indefinitely — was
   missing the entire `bundle/` subfolder, failing three steps later as "Cannot get Java system
   architecture." Must delete and re-extract from the fresh zip every rebuild.
3. `package-weasis.sh` reads `weasis.version` etc. from its **own source** `script/build.properties`,
   never Maven's filtered copy — that file can sit at the raw `${app.version}` placeholder forever
   without Maven ever touching it. Fix: copy `target/native-dist/build/script/build.properties`
   (Maven-filtered) over the source file before every run.
4. The script's default `--input` path (`native-dist/weasis-native/bin-dist`) has never pointed at a
   real directory in this fork — always pass `--input`/`--output` explicitly.

All four now documented with exact commands in `01_BUILD_THE_INSTALLERS.md`.

**Race condition found by testing, not fixed (low priority):** forcing the 14-day gate requires
jumping the system clock forward, which makes Task Scheduler treat the daily 02:15 trigger as
"missed" and fire an immediate catch-up run — racing a concurrent manual invocation of the same
script, restoring peers mid-test and clearing the mismatch record before it could be observed
cleanly. `Set-DhPacsLicenceGate.ps1` has no lock against concurrent invocations of itself. Worked
around by disabling the scheduled task during manual testing. No realistic production trigger (needs
both a manual clock jump and a concurrent manual re-run), so left as a known gap, not fixed.

**Near-miss misdiagnosis worth remembering:** a rejected DICOM **C-FIND** from AET `DHV_SCU` (the
Viewer's own reserved query AE, not a modality) showed up in the Orthanc log during the gated window
and was initially read as "the gate is blocking a modality, must open `DicomAlwaysAllowFind`." That
would have permanently disabled reading enforcement for every site — a Find rejection while gated is
the design working correctly, never a defect. The actual C-STORE (from Sante, a real third-party PACS
tool) succeeded silently and was only provable by checking `Storage\` on disk (8 instance files,
each verified via the `DICM` magic marker at byte 128) — **a routine successful C-STORE never appears
in `orthanc-stderr.log`**, since every line that log writes by default is warning-level or higher, and
an unremarkable store isn't warning-worthy. Absence of a log line is not evidence of failure for this
Receiver; check the storage directory instead.

**Test 5 (Unverified warning) dialog text, confirmed from a real screenshot, exact wording:** "This
computer is not the one this license was issued for. DH DICOM Viewer will stop working in 14 day(s).
Contact DH Solutions Limited with this machine's code so the license can be reissued." Viewer opens
normally after dismissal; a study already in Orthanc storage stayed fully readable.

**Still open after this session:** L0 step 4 (offline key backups — both keys still on one E: drive),
L5 §3 decisions (reissue `IBNSinaHospital`/`DHS_2027` bound or not; where the licence register
lives — plan still literally says L5 "NOT STARTED" even though `docs_reference/03` and `04` already
deliver what it asked for), and Test 6 (DX/CR retrieval, unrelated to licensing).

## SITE015 Mirpur — partial-series C-GET failure, root-caused 2026-08-25

**Root cause, proven from the Receiver log, not inferred:**
`C-GET SCP: storeSCU: No presentation context for: (RAW) 1.2.840.10008.5.1.4.1.1.66`. A Philips MR
exports one **Raw Data Storage** object per acquisition; `RawDataStorage` was commented out in
`store-tcs.properties`, so those series could not be retrieved. 13 of 38 series in one MRCP study.
The Presentation-State theory from the earlier handoff was **wrong** — GSPS is enabled and the `[PR]`
series retrieved fine.

Decisions and the whole mechanism are written up in **ADR-0019** (Retrievable Set is a budgeted
allowlist) and **ADR-0020** (Receiver never accepts Storage Commitment), plus the new
**Retrievable Set** / **Storage Commitment** glossary terms. Read those, don't re-derive.

**Facts that cost time and are not obvious from any doc:**

- `store-tcs.properties` is **both** the Viewer's Store-SCP profile *and* its C-GET offer list —
  `RetrieveTask` → `DicomResource.CGET_SOP_UID` points at the same file. Do not assume "store" means
  only the listener.
- **A DICOM association holds at most 128 presentation contexts** (pcid is one odd byte) and
  `GetSCU` assigns `pcid = n*2+1`. The file has 136 entries, so "uncomment everything" is impossible.
  Expanded 40 → 92 (93 contexts, 35 free). The enable rule is derived from `DicomMediaIO`: carries
  `PixelData`, or `Modality` has a factory (PR/KO/SEG/SR/AU/ECG/HD/RTSTRUCT/RTPLAN/RTDOSE).
- The file's own header comment about `;` producing *separate* contexts is **false for the Viewer** —
  `CGet.configureStorageSOPClass` flattens all syntaxes into one context per SOP class. Counting `;`
  groups gives 183 and is the wrong budget check.
- For a local distribution `weasis.resources.path` resolves to `{app}\app\resources` (the
  `resources.zip` cache path is not used), and `RetrieveTask` re-reads the file on **every** retrieve.
  So a site is repairable by editing one text file — no reinstall, no restart. Field script:
  `scratchpad/Patch-StoreTcs.ps1`.
- **Screenshots taken mid-transfer lie.** "1/4 operations failed" was a 4-instance snapshot of a
  study that finished at 28. Always let the modality finish before counting.
- Philips consoles here ship calling AET `MySCU` and request **Storage Commitment** every ~80s.
  Refusing is correct (ADR-0020) — the repeated `Rejected N-ACTION` log line is expected, and adding
  the AET to `DicomModalities` is the wrong fix.
- `06_CONNECT_A_NEW_CUSTOMER.md` Stage 5 now requires **opening** the study and reconciling the series
  count (C-FIND listing it ≠ C-GET retrieving it), and Stage 4 asks the modality engineer to disable
  Storage Commitment. The old Stage 5 is why this shipped broken.

**Open at end of session:** apply `Patch-StoreTcs.ps1` at Mirpur and confirm a clean retrieve;
rebuild the Viewer installer so new sites carry the 92-entry file; get Storage Commitment turned off
on the Philips console. Repo source, both ADRs, both glossaries and the runbook are already updated
and **uncommitted**.

**VERIFIED FIXED at the site 2026-08-25 16:11.** `Patch-StoreTcs.ps1` applied at 15:44:59 (92 SOP
classes, 93 contexts, 0 not-found, 0 duplicates); two full close-reopen-retrieve cycles at 16:06 and
16:11 across multiple studies produced **zero** `No presentation context` lines and no C-GET dialog.
Timeline proof came from the `.bak` filenames: `Copy-Item` preserves the *source's* mtime, so
`bak-…-152717` (mtime 28 Apr) is the pristine packaged file and `bak-…-154459` (mtime 15:27:17) is
the one-liner's output — which dates the one-liner *after* the last failure at 15:26:34, so the
15:25-15:26 errors were pre-fix, not a fix that failed. Byte sizes corroborate: 13223 → 13636 is
+1/line for `Set-Content`'s LF→CRLF conversion (the packaged file is LF), 13636 → 13534 is −2 per
newly-uncommented stanza.

Benign log lines now documented in `orthanc/README.md` ("Log lines that are expected, not defects"):
**W001 `Accessing DICOM tags from storage … 0010,0021`** is the Viewer's C-FIND asking for Issuer of
Patient ID, which Orthanc does not index, so it opens one file per matched study. Deliberately left
alone — `ExtraMainDicomTags.Patient` would silence it but that key **replaces the entire default
block including the `Instance` list** (Rows/Columns/SOPClassUID/…) and needs a `/reconstruct` to
backfill. Not worth it at working-cache volumes.

## Build 2026-08-25 16:31 — Viewer v2.0.1, bundle v1.0.1 (carries the ADR-0019 fix)

Shippable set: **`DHPACSWorkstation_Setup_v1.0.1.exe`** (91,509,653 B) embedding
`DHDicomViewer_Setup_v2.0.1.exe` (54,494,829 B) + `dh-pacs-receiver-setup-v0.4.0.exe` (unchanged).
`DHDicomViewer_Setup_v2.0.0.exe` is the 40-SOP-class build — **do not ship it**. `dist\` and
`Installer\output\` are never cleaned, so always ship by exact filename, never "the newest file".

Version was bumped for a one-resource-file change, deliberately: the alternative was two different
binaries both named `..._v2.0.0.exe`, one already at a customer.

**A version bump touches FIVE fields, not three** (now in `01_BUILD_THE_INSTALLERS.md` step 0):
`weasis-parent/pom.xml <revision>`, `weasis-distributions/script/build.properties weasis.version`,
`DHDicomViewer_Setup.iss #define AppVersion`, `dh-pacs-workstation.iss #define MyAppVersion`, and
**`dh-pacs-workstation.iss #define ViewerSetup`** — that last one hardcodes the embedded child's
*filename with the version in it*; miss it and the bundle either fails or silently embeds the old
Viewer. `<revision>` is used by 49 poms, so bumping it forces a root `mvn install` (~1:52 for the
whole tree), never `-pl weasis-launcher`.

**New traps found during this build:**
- **`mvn clean` in `weasis-distributions` fails on a locked `jpkg-out5\DHDicom\DHDicom.exe`** — held
  by **VS Code's Java language server** (`redhat.java`), not by any running Viewer. Don't kill the
  editor; `Remove-Item target\jpkg-out5 -Recurse -Force` succeeds on its own, then clean works.
- **`src/assembly/native-dist.xml` copies `weasis-distributions/resources/` with NO include filter.**
  A `store-tcs.properties.bak` left there came one step from shipping inside every installer.
- **`resources/` and the Java travel different paths into the app-image.** The runbook's jar-timestamp
  check proves nothing about resources. Added **gate 2b**: `Get-FileHash` source vs
  `jpkg-out5/DHDicom/app/resources/store-tcs.properties` must match, plus a file-count comparison.
  This is the check that would have caught SITE015.
- The Receiver installer packages **no docs/ADRs/CONTEXT.md** — only `orthanc/payload/*` + EULA/
  LICENSE/NOTICE. Editing docs never requires rebuilding it.

Verified after build: `DHDicom.exe` ProductVersion **2.0.1** = installer version (the 1.0.0-vs-1.1.0
disagreement is not back); `app/bundle/` free of mcp/filmcomposer (commercial profile, no `-Pmcp`);
17 bundle jars all 2.0.1, no 2.0.0 leftovers; `dataelements.xml` present in the codec jar; both
licence fixtures `VALID`. **Not verified: the installer payload itself** — Inno uses LZMA2 and
`innoextract` 1.9 predates Inno 6.4, so there is no cheap way to read shipped bytes back. Real proof
is a clean-VM install per `02_TEST_ON_A_REMOTE_MACHINE.md`.

Docs updated: `01_BUILD_THE_INSTALLERS.md` (step 0 version checklist, 0b stray-files, root-build
branch, lock trap, gate 2b, conditional Receiver rebuild, post-build verification, dated build log),
`02_TEST_ON_A_REMOTE_MACHINE.md` (exact-filename warning), `06_CONNECT_A_NEW_CUSTOMER.md` (Stage 3
current shippable build + the resources-vs-Java distinction in failure mode #1).

## Build 2026-08-26 16:12 — Viewer v2.0.4 (QR dialog: Search Criteria default + auto-load recent arrivals)

Grilled with `/grill-with-docs` first (11 questions, all answered before any code was written), then
implemented, code-reviewed via the `java-reviewer` agent, and built same session. Full design
rationale: [[qr-dialog-auto-load]] pointer → `DHDicomViewer/docs/adr/0024-qr-dialog-defaults-to-search-and-auto-loads-recent-arrivals.md`.
Ship/reinstall/test-checklist doc: `DHDicomViewer/docs/SHIP_v2.0.4_QR_AUTO_LOAD.md`.

**What changed:** Import DICOM → DICOM Query/Retrieve now opens on the Search Criteria tab (was
DICOM Source), and auto-loads the last 20 studies examined in the past 7 days on the selected C-FIND
archive — sorted client-side by Study Date+Time since DICOM C-FIND has no `ORDER BY`. Cached
in-memory (static field on `DicomQrView`, keyed by archive AET@host:port) for the app process's
lifetime, since a fresh `DicomQrView` is constructed on every dialog open — reopening the dialog
replays the cache with no PACS round-trip; a manual search replaces it; app restart clears it.
Scoped to `DefaultDicomNode` (C-FIND) archives only — DICOMWeb/QIDO-RS untouched, since no DH
deployment uses it. Pure `weasis-dicom-qr` Java change, **zero resource file touched**.

**Build was routine** — no new traps, all prior gates held: root build (43 modules, ~1:09),
`dataelements.xml` present, Gate 2b hashed **165/165** resource files byte-identical (correctly
unchanged, since this release touches no resource file — a useful confirmation the widened
all-files gate doesn't false-positive on a no-resource-change release), 16 DHV bundle jars all at
2.0.4, no mcp/filmcomposer, both licence fixtures `VALID`.

**Shipped Viewer-only**, per the established "independently versioned children" rule:
`Installer\output\DHDicomViewer_Setup_v2.0.4.exe` (52.0 MB, SHA-256
`8A6B8380BBA8B2DDA6E4D4F8094DE54CA5F38FCAE060AF7171DCB6B1ED563C1E`). Bundle
`DHPACSWorkstation_Setup_v1.0.4.exe` (87.3 MB) was also built to keep the release train consistent
but is **not** what goes to Mirpur — the Receiver there is untouched (still embeds
`dh-pacs-receiver-setup-v0.4.0.exe`).

**Not yet done — this is the actual next step, not a formality:** the built installer has never run
against a live PACS. Nobody has installed it at Mirpur (SITE015) or anywhere else. The agent has no
remote access to that box — the user carries the installer there and runs it themselves;
`SHIP_v2.0.4_QR_AUTO_LOAD.md` has the exact reinstall steps and a 6-point UI verification checklist
(tab default, auto-load correctness, empty search fields, session-cache reuse across dialog
reopens, manual-search override, cache reset on app restart).
