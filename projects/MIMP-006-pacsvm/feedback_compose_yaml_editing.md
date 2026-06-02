---
name: Don't regex-patch docker-compose.yml — rewrite whole file
description: Discovered 2026-05-19 when a regex-based ohif-service replacement failed silently. Multi-line YAML blocks with blank lines between services break lookahead patterns; full rewrite is safer.
type: feedback
originSessionId: 7afc5ebd-90fe-4259-b4da-af3266b241ea
---
When modifying `/srv/pacs/compose/docker-compose.yml` (or any compose file with multi-line service blocks), **provide a single heredoc that rewrites the entire file** rather than attempting a regex/sed patch of one service block.

**Why:** During Phase A deploy on 2026-05-19, a Python regex `r'  ohif:\n(?:    .*\n)+?(?=  [a-z]+:\n)'` failed to match because YAML compose files have a blank line between service blocks. The lookahead `(?=  [a-z]+:\n)` expected the next service immediately after the ohif block's last 4-space-indented line, but the actual file had `\n\n  nginx:\n`. The script reported "expected 1 ohif block, found 0" and left the file unchanged. Took an extra round-trip to diagnose.

**How to apply:** For any compose-file edit longer than a one-line `sed -i`, send the user a `cat > /srv/pacs/compose/docker-compose.yml <<'COMPOSE_EOF' ... COMPOSE_EOF` heredoc with the complete updated file content. Always include ALL services (postgres, minio, minio-init, orthanc, backend, ohif, nginx) so nothing is accidentally dropped. The heredoc must use single-quoted delimiter to prevent `$POSTGRES_USER`-style variable expansion at write time.

Block 0 (backup) is still worth running first; rollback is a single `cp $BACKUP_DIR/docker-compose.yml /srv/pacs/compose/`.
