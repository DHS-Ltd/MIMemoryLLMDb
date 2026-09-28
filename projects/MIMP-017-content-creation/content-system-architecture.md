---
name: content-system-architecture
description: "Capture-to-Notion-to-Draft content pipeline for DH PACS/BDC/Other — design decisions, file layout, and live operational status (bot configured and running)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 283fb229-0f56-4c86-9682-be12cb81bbf7
---

A multi-business content pipeline at `e:\Self_project\ContentCreation`: capture relevant
links seen on Facebook/LinkedIn (mobile) into Notion via a Telegram bot, then cluster them
into content Angles and draft copy via a Claude Code skill. Businesses: `DH PACS` (covers
DHS generally for now), `BDC`, `Other`.

**Key design decisions** (full reasoning in `CONTEXT.md` and `docs\adr\` in that repo):
- No automated/authenticated scraping of FB/LinkedIn — login-walled, and using Maidul's
  session was rejected as a security/ToS risk (ADR-0002). Captures store just a link + his
  1-line reaction; full text is added later by *replying* to the bot's confirmation message.
- Self-hosted Telegram bot via long-polling on an always-on home machine, not Cloudflare
  Workers, despite Workers already being set up for the DH-PACS website (ADR-0001) — no
  public webhook needed, simpler for a single-user tool.
- No scheduled enrichment job — clustering captures into Angles happens live, inside the
  Claude Code skill, when Maidul actually sits down to write.
- Voice profiles stay in their owning repo, referenced by path, not copied in: DH PACS's is
  at `E:\DHS-PACS\docs\DH_PACS_BRAND_VOICE.md`. BDC has no consolidated profile yet — its
  voice/pillars are scattered across `E:\BDC_Marketing` memory; consolidating one was
  explicitly deferred to "whenever the BDC drafting path actually gets used."

**Built (2026-06-18):**
- `content-system\` — Python project: `bot.py` (Telegram capture bot), `notion_store.py`
  (all Notion REST API calls), `init_notion_db.py` (one-time DB schema creation),
  `scripts\fetch_captures.py` / `scripts\mark_used.py` (skill entry points), `config.py`,
  `README.md` with the full manual setup checklist.
- `C:\Users\maidu\.claude\skills\content-angles\SKILL.md` — the drafting-side skill.
- Verified: all scripts compile, dependencies install cleanly in a `.venv`
  (`python-telegram-bot` 22.8, `requests`, `python-dotenv`), `config.py`/`notion_store.py`
  import correctly including the bootstrap case where `TELEGRAM_USER_ID` isn't set yet.

**Configured and verified live (2026-06-18):** All manual setup steps from the README are
done — `.env` has a real `TELEGRAM_BOT_TOKEN`, `TELEGRAM_USER_ID`, `NOTION_TOKEN`,
`NOTION_PARENT_PAGE_ID`, and `NOTION_DATABASE_ID`. End-to-end tested: a shared link →
reaction → business button → "Saved ✅" → row appeared in the real Notion database.

`bot.py` runs as a Windows Scheduled Task named `ContentCaptureBot` (trigger: At Log On;
action: `content-system\.venv\Scripts\pythonw.exe bot.py`, working dir
`content-system\`), satisfying ADR-0001's always-on requirement without a visible console.
Registering/editing this task needs an **elevated** PowerShell or Task Scheduler GUI —
Claude Code's own shell got `Access is denied` trying to `Register-ScheduledTask` without
admin rights, so this had to be done by Maidul directly. `Start-ScheduledTask` /
`Get-ScheduledTask` (read/start, not create/edit) worked fine unprivileged and were used to
verify the task fired and `pythonw.exe` was actually running from the right venv path.

Notion page IDs: when sharing a page URL like
`https://app.notion.com/p/Some-Title-22783bab028980cfa000cfdb5f72bcc6`, the page id is just
the trailing 32-char hex string after the title slug — no dashes needed, the REST API
accepts it as-is for `NOTION_PARENT_PAGE_ID`.

**Why:** Designed via a `/grill-with-docs` session, then implemented via Plan Mode in the
same session on 2026-06-18. Surfaced and incorporated existing related infra discovered in
memory: BDC's Facebook engagement scraper (`e--BDC-Marketing-BDCDataScrapper-Facebook`,
different purpose — outbound analytics, not inbound inspiration capture) and BDC's existing
brand/content-pillar strategy (`e--BDC-Marketing` memory).

**How to apply:** The capture pipeline (Telegram → Notion) is live and running unattended —
no setup work remains there. Future sessions on this project are about the drafting side
(the `content-angles` skill, Angle clustering quality, Voice Profiles) or new features, not
bootstrapping. [[dh-pacs-brand-voice]]
