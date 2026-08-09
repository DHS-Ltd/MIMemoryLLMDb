---
name: feedback-docker-build-gotchas
description: Non-obvious Docker + npm build traps learned during admin-ui build (2026-05-25)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0d830bd0-02d2-424f-b27f-c10dc899e13e
aliases: [feedback-docker-build-gotchas]
---

Use `npm install` not `npm ci` in Dockerfiles unless a `package-lock.json` is committed alongside `package.json`. `npm ci` hard-fails with no lockfile.

**Why:** First admin-ui build attempt failed because the Dockerfile used `npm ci` but there was no lockfile in the repo.
**How to apply:** Always check if package-lock.json is present before writing `npm ci` in a Dockerfile. Default to `npm install` for new projects.

---

When Docker caches the `COPY . .` layer, file edits on the host are not picked up on the next `docker compose build`. Use `docker compose build --no-cache <service>` to force a fresh context copy.

**Why:** Fixed `sites.ts` on the VM but the subsequent build still failed with the same error because `COPY . .` was cached. Wasted one build cycle.
**How to apply:** After in-place file edits on the VM (not a fresh scp), always add `--no-cache` to the build command.

---

For multi-character string replacement in shell scripts, prefer Python over sed when the pattern contains `{`, `}`, `<`, `>`, or `&`. sed requires escaping these and the escaping rules differ between GNU sed and BSD sed.

**Why:** `sed -i 's/.../.../'` with a TypeScript generic type signature (containing `<`, `>`, `{`, `}`) silently failed — no error, but the file was unchanged. Python `str.replace()` worked first try.
**How to apply:** If sed doesn't seem to be changing the file, switch to `python3 -c "..."` with `open(f).read().replace(old, new)`.
