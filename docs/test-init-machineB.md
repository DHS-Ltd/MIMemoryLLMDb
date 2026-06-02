# Test: schema-aware `mimp init` from machineB

Goal: register + push a **real new DHS PACS technical project** from machineB and confirm it
arrives with the new brain fields (`entity`, `niche`, `business_unit`, `role`, `serves`, `tags`)
without breaking the v2.0 registry (`entities` + `programs`).

> Why this matters: `mimp init` was upgraded on machineA. machineB must first pull that update,
> then a real init proves the end-to-end flow across machines.

---

## Part A — machineA (prerequisite: publish the update)

The new `init` logic, `registry.json` v2.0, and the `org/` brain are uncommitted on machineA.
Until they are pushed, machineB cannot get them.

```powershell
cd E:\MIMemoryLLMDb
git add -A
git commit -m "feat: entity-program-project brain (org/ + registry v2.0 + schema-aware mimp init)"
git push
```

(If Claude is doing this for you, it will run the equivalent after your go-ahead.)

---

## Part B — machineB (the actual test)

### 1. Update the tooling FIRST (important)

The running `mimp.ps1` is loaded at launch, so pull the new version **before** calling init:

```powershell
cd D:\MIMemoryLLMDb
git pull
```

This updates `tools\mimp.ps1` (new init flow), `registry.json` (v2.0), and `org\` on machineB.

### 2. Register the new project

Use the real PACS technical component name/path. Example:

```powershell
mimp init "DHS PACS <Component>" "dhs-pacs-<component>" "D:\path\to\the\project"
```

Answer the prompts:

| Prompt | Answer for a PACS technical project |
|--------|--------------------------------------|
| Memory path | Paste machineB Claude memory path for this project, or Enter to skip |
| Business or Personal `[1/2]` | **1** (Business) |
| Entity number | **DHS** (likely `[1]`) |
| Niche | `software-saas` |
| Business unit | `pacs` |
| Role | one line, e.g. `PACS <component> service` |
| Tags | e.g. `pacs, backend, dicom` |
| Serves | `DHS` (or the program/entity it serves) |

`init` auto commits + pushes the new project.

---

## Part C — verify it came through correctly

### On machineB (right after init)

```powershell
mimp list                       # new project should appear
```

Open `D:\MIMemoryLLMDb\registry.json` and confirm the **new MIMP-00X** entry has:
- `niche`, `business_unit`, `entity`, `role`, `serves`, `tags`, `relationships: []`, `depends_on: []`
- and that `entities` (DHS, BDC) + `programs` (2) are **still present and intact** at the top.

### On machineA (confirm cross-machine sync)

```powershell
cd E:\MIMemoryLLMDb
git pull
mimp list
```

Open `registry.json`; the new project should be present with all brain fields, and
`entities`/`programs` unchanged.

---

## Success criteria

- [ ] machineB pulled the update without error.
- [ ] `mimp init` showed the **Business/Personal** prompt and the **entity list** (DHS, BDC).
- [ ] New project entry has all brain fields populated.
- [ ] `entities` + `programs` survived the init (round-trip safe).
- [ ] New project is visible on machineA after `git pull`.

## If something is wrong (rollback)

```powershell
# On the machine where the bad commit was made:
cd <repo>
git log --oneline -3            # find the init commit hash
git revert <hash>               # safe undo; then: git push
```

Then report what differed (missing field, broken entities, etc.) before we proceed to the MCP brain tools.
