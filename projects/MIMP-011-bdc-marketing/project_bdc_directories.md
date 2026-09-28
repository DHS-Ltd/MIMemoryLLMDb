---
name: project-bdc-directories
description: What each of the 8 subdirectories in E:\BDC_Marketing contains and its current status
metadata: 
  node_type: memory
  type: project
  originSessionId: 1c3fb66e-c751-491c-abc6-b53e4fdef548
---

**Root:** `E:\BDC_Marketing\`

All 8 directories as of June 2026:

---

## 1. BDCBrand/

**Purpose:** Brand identity, audit reports, and performance analysis.

Key files:
- `BrandGuideline/BrandGuideline.md` — V1.0 brand guideline (colors, voice, tone, checklist, social media, logo, typography). Non-negotiable pair: `#003344` + `#00897B`.
- `BDC_Marketing_Analysis_Report_23.05.26.md` — Full Facebook audit of 232 posts (Nov 2024–May 2026). Authored by DH Solutions for BDC. PDF version also present.
- `Performance/` — Additional performance tracking files.

**Status:** Brand guideline finalized. Audit complete. Action items issued but not yet all implemented.

---

## 2. BDCLeadMagnet/

**Purpose:** Lead magnet strategy document.

Key files:
- `BDCLeadMagnetStrategy.md` — 4 lead magnets using Alex Hormozi methodology. Rollout sequence: LM#2 first (weeks 1–3), LM#1 (weeks 4–6), LM#3 (weeks 7–9), LM#4 (week 10+).

**Status:** Strategy written. No lead magnet has been launched yet (as of the May audit). LM#2 was the first recommended action.

---

## 3. BDCAutomation/

**Purpose:** Google Apps Script that syncs rows from the "Content Making" Google Sheet tab into a structured Google Doc with bookmark links.

Key files:
- `CLAUDE.md` — Full spec and implementation guide
- `src/Config.gs`, `Menu.gs`, `SheetReader.gs`, `DocWriter.gs`, `SyncEngine.gs`, `Utils.gs`
- `.clasp.json` — clasp config (container-bound to the Sheet)

**What it does:** Operator runs "Sync Selected Row" from a custom BDC Tools menu in the Sheet. Script reads content row (PostDate, Week, Phase, ContentPillar, bdContentConcept, CaptionID), appends a formatted block to the Doc, inserts a bookmark, and writes the bookmark URL back to column H.

**Google resources:**
- Sheet: `1XQpFhARfVCQ2Ld31xQqU0oUOKIIZqU_3dsaMlBdj78g`
- Doc: `1McL_GC2pweBTT_yLrUqc79EWdmml8Ja1Wk41Wym78WU`

**Status:** Implemented and documented. Testing checklist exists. Likely functional but testing status unknown.

---

## 4. BDCImageGeneration/

**Purpose:** Automated image pipeline: Drive photo → Gemini Vision analysis → Bengali caption → Branded 1080×1080 PNG → Content Calendar sheet.

Key files:
- `CLAUDE.md` / `docs/Process_BDCImageGeneration.md` — Full implementation guide
- `config.gs`, `driveWatcher.gs`, `geminiProcessor.gs`, `brandingEngine.gs`, `contentCalendar.gs`, `main.gs`

**Architecture:** Hourly GAS trigger scans 5 pillar Drive folders. New images → Gemini 2.5 Flash (was 2.0, updated) → Bengali caption → Google Slides template copy → PNG export → ContentCalendar sheet row.

**Google Drive folder IDs (account: directhospitalsolutionsltd@gmail.com):**
- Root: `1pZk3T3Du2nHWjwIHK5RUNZWhdsMEojeI`
- Raw Incoming: `1JIhHBy7Y6J7MXbjBg_GqiGNosymCD9ld`
- Pillar-1-HealthEd: `11Ms1F-hqUwAoxslZG4xCctbOUyPU78Dg`
- Pillar-2-Trust: `11c5A0GK0YDratMzs3XbVCgmgf2tNLTuR`
- Pillar-3-Services: `1LeySmeIH4cbk_VKjiyXO9cgZd214ntJD`
- Pillar-4-Community: `1WkqEVuZ0ee8KTEH8iNLB1JnTPZZg6f0p`
- Pillar-5-SocialProof: `1PhJVq683KEPMy_hxsowLBAVL3M1gI_pg`
- Processed: `1vGUxiiC3sqhjWxF0auYnIdHuphLdBRTV`
- Posted: `1OSx6JuyrlOI0tLUZ5zNLP6AnYt_VMFwM`
- Templates: `1J67GZdRvFlOZWbkTG58XbdUU_3Q0L7DX`

**Spreadsheet:** `1Bp_HGe153QCLGQmQLUqyysP70Eoijy_8P_aCasPOD7o`

**Google Slides templates (5 pillar templates, 1080×1080):**
- Pillar 1 (teal `#0F6E56`): `1d9bi9G9UeXsc0rMXCCJA4zrjJKnTJltSaKd-1Tnbdbs`
- Pillar 2 (blue `#185FA5`): `1ixDP40veejPOgHKyA-mXa3mjM9v9t7KfvmMkBp33gjs`
- Pillar 3 (dark `#052d3c`): `17RSqSfNC7xJyO8Byt1IDTr7uk-TRyCsvijik54U5UJk`
- Pillar 4 (orange): `15QdxCeVlFj_ZF9pwTdneFUrtoRLrUQHgAsqpJyyppQA`
- Pillar 5 (coral `#993C1D`): `1ly-ga-vcGgEyKN0i5uUJ9kv1PATnkAWMaqe0l1kzO54`

**Test status (as of April 2026):**
- Test 1 (Config): ✅ PASSED
- Test 2 (Image analysis): ✅ PASSED
- Test 3 (Caption generation): ✅ PASSED
- Test 4 (Full pipeline PNG export): ⏳ PENDING
- Test 5 (Queue + trigger simulation): ⏳ PENDING

**Known fixes already applied:** Gemini model updated to `gemini-2.5-flash`; `maxOutputTokens` raised to 1024; brandingEngine uses dynamic slide dimensions instead of hardcoded pixels.

**Hourly trigger:** Not yet set up (Step 7 deferred until full pipeline test passes).

---

## 5. BDCDataScrapper/Facebook/

**Purpose:** Python script to scrape BDC's Facebook page data via Graph API and output to CSV.

Key files:
- `scraper.py` — Fetches posts with id, message, created_time, likes, comments, shares, reactions
- `analyze.py` — Analysis script on the scraped CSV
- `scheduler.py` — Scheduled scraping
- `.env` — Contains PAGE_ACCESS_TOKEN (not committed)
- `output/bdc_posts.csv` — Output file

**Facebook page ID:** `415144131692412`  
**API version:** v25.0 (Graph API)

**Status:** Script written. The audit report analyzed 232 posts sourced from this scraper plus the Facebook page export. Active usage unclear.

---

## 6. BDCStrategyDocs/

**Purpose:** Core strategy documents for the 60-day content campaign.

Key files:
- `BDC_60Day_Content_Calendar.md` — Full 60-day calendar with strategy philosophy, 5 phases, 6 pillars, channel plan. Period: Day 1–60 (April–June 2026).
- `BDC_Posts_Day29_to_Day60.md` — Second half of calendar (detailed posts)
- `BDCBengaliContentCaptions10Subtopics.md` — Bengali caption library organized by subtopic (10 categories)
- PDF versions of above

**Status:** All strategy documents complete. Execution is underway but with gaps (see audit findings in BDCBrand/).

---

## 7. BDC-Marketing-tracker/

**Purpose:** CSV-based tracking files for content execution and KPI measurement.

Key files:
- `BDC Marketing Tracker - ContentPlanner.csv` — Content planning tracker
- `BDC Marketing Tracker - KpiMeasurement.csv` — 16 KPI metrics across 9 weeks (all blank as of May 2026 audit)
- `BDC Marketing Tracker - StatusUpdateTracker.csv` — Status updates

**Status:** Files exist but KPI tracker was never filled in. Critical gap identified in the audit.

---

## 8. ai-marketing-claude/

**Purpose:** Reusable AI marketing analysis toolkit (a Claude Code skill system). Not BDC-specific — a general-purpose marketing tool installed here.

Key directories:
- `agents/` — Marketing analysis agents
- `market/` — Market research scripts
- `scripts/` — Python utilities
- `skills/` — 14 subdirectories of marketing skills (audit, copy, email, content calendar, competitors, etc.)
- `templates/` — Report templates

**Key command:** `/market audit <URL>` — Launches 5 parallel agents to score a website's marketing across 6 dimensions, saves to MARKETING-AUDIT.md.

**Origin:** GitHub repo `zubair-trabzada/ai-marketing-claude`. Installed via `./install.sh`.

**Status:** Installed. Used as a toolkit for marketing analysis tasks on this project.

[[project_bdc_automation]]
[[project_bdc_overview]]
