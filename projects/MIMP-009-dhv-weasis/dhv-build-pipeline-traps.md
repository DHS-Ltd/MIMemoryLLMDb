---
name: dhv-build-pipeline-traps
description: Three non-obvious traps that silently break or falsify a DH DICOM Viewer installer build.
metadata:
  type: project
---

Building the Viewer installer has three traps that produce either a bogus failure or, worse, a
correct-looking installer containing the **old** code:

1. **The VS Code Java language server poisons `target/classes`.** It auto-builds into the same
   directory Maven uses. When `mvn clean` wipes `weasis-core/target/classes` mid-reactor its
   classpath goes empty, and JDT writes *error-recovery* class files (body throws `Error` with
   "Unresolved compilation problems", unresolved types stubbed into the default package) over
   javac's output. bnd then fails with `The default package '.' is not permitted by the
   Import-Package syntax` — an error that points nowhere near the cause. One resume build spread it
   to 254 class files and mutated into bogus `testCompile` errors. Fix: `"java.autobuild.enabled": false`
   in `E:\DHV-Weasis\.vscode\settings.json` (already set 2026-08-25).
2. **`weasis-distributions` is NOT a module of the root pom.** A root `mvn clean install` never
   touches it. It must be built separately, and `package-weasis.sh` reads the **extracted**
   `target/native-dist/weasis-native/bin-dist` — not the zip. A stale unpacked tree from a previous
   build will happily ship old jars under a new version label. Always extract the fresh
   `weasis-native.zip` and pass `--input`/`--output` explicitly.
3. **`jpkg-out5\DHDicom\DHDicom.exe` is created ReadOnly**, and `maven-clean-plugin` will not delete
   read-only files, so `mvn clean` on `weasis-distributions` fails every time until you
   `Remove-Item -Recurse -Force` that folder.

There are **six** version fields, not the five in ship-plan F1: the sixth is
`weasis-distributions/script/build.properties` `weasis.version`, which is read by
`package-weasis.sh` for `jpackage --app-version` and is **not** derived from the pom.

**Why:** trap 2 is how a "fixed" build ships without the fix, and trap 1 costs an hour chasing a
phantom code defect.
**How to apply:** after any build, verify the fix is in the *shipped jar* (`unzip` + `javap`), not
just in the working tree. See [[viewer-edt-deadlock-v203]].
