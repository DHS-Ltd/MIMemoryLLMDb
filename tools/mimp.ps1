# MIMemoryLLMDb CLI -- PowerShell version
# Usage: mimp <command> [args]
#
# Commands:
#   init <full_name> <short_name> <local_path>  -- Register new project
#   push <project_id_or_short_name>             -- Push local memory to repo
#   pull <project_id_or_short_name>             -- Pull repo memory to local
#   list                                        -- List all projects
#   status <project_id_or_short_name>           -- Compare local vs repo
#   sync <project_id_or_short_name>             -- Pull then push

param(
    [Parameter(Position=0)][string]$Command,
    [Parameter(Position=1)][string]$Arg1,
    [Parameter(Position=2)][string]$Arg2,
    [Parameter(Position=3)][string]$Arg3,
    # Declared explicitly because PowerShell's parameter binder rejects any bare "-x"/"--x" token
    # that isn't a known parameter name - it was never matched against $Arg1/$Arg2 as a string,
    # it threw before binding got that far. (Bit both `lint --json/--quiet` and the new
    # `scheduled-run --dry-run` the same way; fixed once, here, for all of them.)
    [switch]$json,
    [switch]$quiet,
    [Alias('dry-run')][switch]$dryrun
)

# ── Config Loading ──────────────────────────────────────────────────
$ConfigPath = Join-Path $env:USERPROFILE '.mimp-config.json'
if (-not (Test-Path $ConfigPath)) {
    Write-Host 'ERROR: No config found at' $ConfigPath -ForegroundColor Red
    Write-Host 'Run: Copy-Item tools\local-config.template.json' $ConfigPath
    Write-Host 'Then edit it with your machine_id and repo_path.'
    exit 1
}
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$RepoPath = $Config.repo_path
$MachineId = $Config.machine_id
$RegistryPath = Join-Path $RepoPath 'registry.json'

# ── Helper Functions ────────────────────────────────────────────────

function Load-Registry {
    return Get-Content $RegistryPath -Raw | ConvertFrom-Json
}

function Save-Registry($reg) {
    $reg | ConvertTo-Json -Depth 10 | Set-Content $RegistryPath -Encoding UTF8
}

function Resolve-ProjectId($inputId) {
    $reg = Load-Registry
    if ($reg.projects.PSObject.Properties.Name -contains $inputId) {
        return $inputId
    }
    foreach ($prop in $reg.projects.PSObject.Properties) {
        if ($prop.Value.short_name -eq $inputId) {
            return $prop.Name
        }
    }
    Write-Host "ERROR: Project '$inputId' not found in registry" -ForegroundColor Red
    exit 1
}

function Get-ProjectFolder($projectId) {
    $reg = Load-Registry
    $project = $reg.projects.$projectId
    return Join-Path (Join-Path $RepoPath 'projects') "$projectId-$($project.short_name)"
}

function Get-LocalPath($projectId) {
    $reg = Load-Registry
    $project = $reg.projects.$projectId
    $path = $project.local_paths.$MachineId
    if (-not $path) {
        Write-Host "ERROR: No local path configured for $projectId on $MachineId" -ForegroundColor Red
        Write-Host "Edit registry.json -> projects -> $projectId -> local_paths -> $MachineId"
        exit 1
    }
    return $path
}

function Get-EncodedClaudePath($localPath) {
    if (-not $localPath) { return $null }
    $drive   = $localPath[0].ToString().ToLower()
    $rest    = $localPath.Substring(3)
    $encoded = $rest -replace '\\', '-' -replace '_', '-'
    return "$drive--$encoded"
}

function Find-ClaudeMemoryPath($localPath) {
    if (-not $localPath) { return $null }
    $encoded    = Get-EncodedClaudePath $localPath
    $claudeBase = Join-Path $env:USERPROFILE '.claude\projects'
    $memoryPath = Join-Path (Join-Path $claudeBase $encoded) 'memory'
    if (Test-Path $memoryPath) { return $memoryPath }
    return $null
}

function Sync-SparseCheckout {
    if (-not $MachineId) { return }

    # Find project folders belonging to this machine
    $myProjectFolders = @()
    if (Test-Path $RegistryPath) {
        $reg = Get-Content $RegistryPath -Raw | ConvertFrom-Json
        foreach ($prop in $reg.projects.PSObject.Properties) {
            if ($prop.Value.local_paths.$MachineId) {
                $myProjectFolders += "projects/$($prop.Name)-$($prop.Value.short_name)/"
            }
        }
    }

    Push-Location $RepoPath

    # Enable classic sparse checkout (works on all git versions >= 1.7)
    git config core.sparseCheckout true

    # Write .git/info/sparse-checkout
    # Pattern order matters: include all root files, exclude all project subdirs,
    # then re-include only this machine's project folders (later rules win)
    $sparseFile = Join-Path $RepoPath '.git\info\sparse-checkout'
    $sparseDir  = Split-Path $sparseFile -Parent
    if (-not (Test-Path $sparseDir)) {
        New-Item -ItemType Directory -Path $sparseDir -Force | Out-Null
    }

    $lines = @('/*', '!projects/*/') + $myProjectFolders
    Set-Content $sparseFile $lines -Encoding UTF8

    # Apply patterns to working tree
    # Warn rather than abort: this legitimately fails before the first commit exists. But a silent
    # failure means the sparse patterns never applied, leaving the wrong working tree (ADR-0007).
    Invoke-Git @('read-tree', '-mu', 'HEAD') 'sparse checkout patterns may not have applied' -AllowFail | Out-Null

    Pop-Location
}

# Run git and FAIL LOUDLY. Previously stderr was discarded and no exit code was ever checked,
# so a conflicted rebase or a rejected push returned success and reported nothing. Harmless while
# each project was pushed from one machine; silent data loss once anything is shared (ADR-0007).
function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [string]$What = '',
        [switch]$AllowFail
    )
    & git @Arguments
    $code = $LASTEXITCODE
    if ($code -eq 0) { return $true }

    $detail = ''
    if ($What) { $detail = ' - ' + $What }
    $label = 'git ' + ($Arguments -join ' ')
    if ($AllowFail) {
        Write-Host ('  WARNING: ' + $label + ' failed (exit ' + $code + ')' + $detail) -ForegroundColor Yellow
        return $false
    }
    Write-Host ('ERROR: ' + $label + ' failed (exit ' + $code + ')' + $detail) -ForegroundColor Red
    Write-Host '  Aborting rather than continuing on a failed git operation.' -ForegroundColor Red
    exit 1
}

function Git-Sync {
    Sync-SparseCheckout
    Push-Location $RepoPath
    try {
        Invoke-Git @('pull', '--rebase') 'could not sync with origin - resolve, then re-run' | Out-Null
    } finally {
        Pop-Location
    }
}

# $Paths scopes staging to the files this operation owns. Without it `git add -A` sweeps the whole
# worktree, folding unrelated in-progress work into a project-scoped commit.
function Git-CommitPush($Message, $Paths) {
    Push-Location $RepoPath
    try {
        if ($Paths -and @($Paths).Count -gt 0) {
            $addArgs = @('add', '--') + @($Paths)
        } else {
            $addArgs = @('add', '-A')
        }
        Invoke-Git $addArgs 'could not stage changes' | Out-Null

        # Nothing staged is not a failure - it just means there was nothing to send.
        & git diff --cached --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-Host '  Nothing to commit - working tree already matches the repo.' -ForegroundColor DarkGray
            return
        }

        Invoke-Git @('commit', '-m', $Message) 'commit failed' | Out-Null
        Invoke-Git @('push') 'push rejected - run mimp sync, resolve, then re-run' | Out-Null
        Write-Host '  Pushed to origin.' -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── Commands ────────────────────────────────────────────────────────

function Cmd-Init {
    param($FullName, $ShortName, $LocalPath)
    if (-not $FullName -or -not $ShortName) {
        Write-Host 'Usage: mimp init [full_name] [short_name] [local_path]' -ForegroundColor Yellow
        Write-Host 'Example: mimp init "My Project" "my-project" "E:\path\to\project"' -ForegroundColor Yellow
        exit 1
    }

    # Guard: short_name must not look like a file path
    if ($ShortName -match '[:\\\/]') {
        Write-Host "ERROR: short_name '$ShortName' looks like a file path." -ForegroundColor Red
        Write-Host '       Did you forget the short_name argument?' -ForegroundColor Yellow
        Write-Host 'Usage: mimp init [full_name] [short_name] [local_path]' -ForegroundColor Yellow
        Write-Host 'Example: mimp init "My Project" "my-project" "E:\path\to\project"' -ForegroundColor Yellow
        exit 1
    }

    Git-Sync
    $reg = Load-Registry

    foreach ($prop in $reg.projects.PSObject.Properties) {
        if ($prop.Value.short_name -eq $ShortName) {
            Write-Host "ERROR: Short name '$ShortName' already used by $($prop.Name)" -ForegroundColor Red
            exit 1
        }
    }

    # ── Step 1: Collect and validate Claude memory path BEFORE assigning project ID ──
    Write-Host ''
    Write-Host '  Claude Code Memory Path' -ForegroundColor Cyan
    Write-Host '  Find yours with: ls $env:USERPROFILE\.claude\projects\' -ForegroundColor DarkGray
    Write-Host '  Format: C:\Users\<user>\.claude\projects\<encoded-name>\memory' -ForegroundColor DarkGray
    Write-Host '  Press Enter to skip (you can add manually later).' -ForegroundColor DarkGray
    Write-Host ''
    $claudePathInput = (Read-Host '  Memory path').Trim().Trim('"')

    $validatedClaudePath = $null
    if ($claudePathInput) {
        if (-not (Test-Path $claudePathInput)) {
            Write-Host ''
            Write-Host "  ERROR: Directory not found:" -ForegroundColor Red
            Write-Host "         $claudePathInput" -ForegroundColor Red
            Write-Host '  Registration blocked. Verify the path and run mimp init again.' -ForegroundColor Yellow
            exit 1
        } elseif (-not (Test-Path (Join-Path $claudePathInput 'MEMORY.md'))) {
            Write-Host ''
            Write-Host "  ERROR: No MEMORY.md found inside:" -ForegroundColor Red
            Write-Host "         $claudePathInput" -ForegroundColor Red
            Write-Host '  The directory exists but Claude Code has not saved any memory there yet.' -ForegroundColor Yellow
            Write-Host '  Open Claude Code in this project first, then run mimp init again.' -ForegroundColor Yellow
            exit 1
        } else {
            $validatedClaudePath = $claudePathInput
            Write-Host "  Path validated." -ForegroundColor Green
        }
    } else {
        Write-Host '  Skipped — no memory path saved. Add manually to registry.json later.' -ForegroundColor DarkGray
    }

    # ── Step 1.5: Brain classification (entity -> program -> project model) ──
    Write-Host ''
    Write-Host '  Project Classification (for the business brain)' -ForegroundColor Cyan
    Write-Host '  Is this a DHS business project, or personal / self-learning?' -ForegroundColor DarkGray
    Write-Host '    [1] Business  - belongs to a DHS entity'
    Write-Host '    [2] Personal  - self-learning, not business related'
    $scopeChoice = (Read-Host '  Choose [1/2]').Trim()

    $isBusiness      = ($scopeChoice -eq '1')
    $pEntity         = $null
    $pPillar         = $null
    $pProduct        = $null
    $pClassification = 'personal'

    if ($isBusiness) {
        $pClassification = 'business'
        # Entity selection from the registry's defined entities
        $entityNames = @($reg.entities.PSObject.Properties.Name)
        if ($entityNames.Count -eq 0) {
            Write-Host '  WARNING: no entities defined in registry; leaving entity blank.' -ForegroundColor Yellow
            $pClassification = 'unsorted'
        } else {
            Write-Host ''
            Write-Host '  Which entity does this project belong to?' -ForegroundColor DarkGray
            for ($i = 0; $i -lt $entityNames.Count; $i++) {
                $en = $entityNames[$i]
                Write-Host ('    [{0}] {1} - {2}' -f ($i + 1), $en, $reg.entities.$en.full_name)
            }
            $entChoice = (Read-Host '  Choose entity number').Trim()
            $entIdx = 0
            if ([int]::TryParse($entChoice, [ref]$entIdx) -and $entIdx -ge 1 -and $entIdx -le $entityNames.Count) {
                $pEntity = $entityNames[$entIdx - 1]
            } else {
                Write-Host '  Invalid entity choice. Registration blocked — run mimp init again.' -ForegroundColor Red
                exit 1
            }

            # Business Pillars (registry v2.1) — supersedes the retired 'niche' vocabulary.
            # Source of truth: E:\DHS-PACS\CONTEXT-MAP.md (2026-08-03).
            $pillars = @('Build', 'Supply', 'Service', 'Facility')
            Write-Host ''
            Write-Host '  Business Pillar for this project:' -ForegroundColor DarkGray
            Write-Host '    [1] Build    - DH-produced software (prime pillar)'
            Write-Host '    [2] Supply   - medical equipment & accessories (incl. resold software)'
            Write-Host '    [3] Service  - installation, maintenance & training'
            Write-Host '    [4] Facility - the BDC diagnostic centre (BANNED from Commercial Content)'
            Write-Host '    [5] none     - internal tooling, no pillar'
            $pillarChoice = (Read-Host '  Choose pillar number').Trim()
            $pillarIdx = 0
            if ([int]::TryParse($pillarChoice, [ref]$pillarIdx) -and $pillarIdx -ge 1 -and $pillarIdx -le $pillars.Count) {
                $pPillar = $pillars[$pillarIdx - 1]
            } elseif ($pillarIdx -eq ($pillars.Count + 1)) {
                $pPillar = $null
            } else {
                Write-Host '  Invalid pillar choice. Registration blocked - run mimp init again.' -ForegroundColor Red
                exit 1
            }

            # Product — read live from the registry so the list never goes stale
            $productIds = @()
            if ($reg.products) {
                $productIds = @($reg.products.PSObject.Properties.Name)
            }
            if ($productIds.Count -gt 0) {
                Write-Host ''
                Write-Host '  Which product does this project serve?' -ForegroundColor DarkGray
                for ($p = 0; $p -lt $productIds.Count; $p++) {
                    $prid = $productIds[$p]
                    Write-Host ('    [{0}] {1} - {2}' -f ($p + 1), $prid, $reg.products.$prid.name)
                }
                Write-Host ('    [{0}] none (internal tooling / not product work)' -f ($productIds.Count + 1))
                $prodChoice = (Read-Host '  Choose product number').Trim()
                $prodIdx = 0
                if ([int]::TryParse($prodChoice, [ref]$prodIdx) -and $prodIdx -ge 1 -and $prodIdx -le $productIds.Count) {
                    $pProduct = $productIds[$prodIdx - 1]
                } elseif ($prodIdx -eq ($productIds.Count + 1)) {
                    $pProduct = $null
                } else {
                    Write-Host '  Invalid product choice. Registration blocked - run mimp init again.' -ForegroundColor Red
                    exit 1
                }
            }
        }
    } else {
        Write-Host '  Marked as personal / self-learning (no business entity).' -ForegroundColor DarkGray
    }

    # Role (one-line) and tags — asked for every project
    Write-Host ''
    Write-Host '  One-line role / description of this project - optional, Enter to skip' -ForegroundColor DarkGray
    $pRole = (Read-Host '  Role').Trim()

    Write-Host '  Tags (comma separated) - optional, Enter to skip' -ForegroundColor DarkGray
    $tagsInput = (Read-Host '  Tags').Trim()
    $pTags = @()
    if ($tagsInput) {
        $pTags = @($tagsInput -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    }

    # Serves (business only) — which entities/programs this project serves
    $pServes = @()
    if ($isBusiness) {
        Write-Host '  Serves (entity/program IDs this project serves, comma separated) - optional, Enter to skip' -ForegroundColor DarkGray
        $servesInput = (Read-Host '  Serves').Trim()
        if ($servesInput) {
            $pServes = @($servesInput -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
        }
    }

    # ── Step 2: All checks passed — now assign project ID and register ──
    $nextId = $reg.next_id
    $projectId = 'MIMP-{0:D3}' -f $nextId
    $reg.next_id = $nextId + 1

    $newProject = [PSCustomObject]@{
        short_name    = $ShortName
        full_name     = $FullName
        created       = (Get-Date -Format 'yyyy-MM-dd')
        created_by    = $MachineId
        status        = 'active'
        pillar         = $pPillar
        product        = $pProduct
        classification = $pClassification
        entity        = $pEntity
        role          = $pRole
        serves        = $pServes
        relationships = @()
        depends_on    = @()
        tags          = $pTags
        local_paths   = [PSCustomObject]@{
            $MachineId = if ($LocalPath) { $LocalPath } else { $null }
        }
    }

    if ($validatedClaudePath) {
        $newProject | Add-Member -NotePropertyName 'claude_memory_paths' -NotePropertyValue ([PSCustomObject]@{ $MachineId = $validatedClaudePath })
    }

    $reg.projects | Add-Member -NotePropertyName $projectId -NotePropertyValue $newProject
    Save-Registry $reg

    if ($validatedClaudePath) {
        Write-Host "  claude_memory_paths.$MachineId saved." -ForegroundColor Green
    }

    $folderName = "$projectId-$ShortName"
    $projectDir = Join-Path (Join-Path $RepoPath 'projects') $folderName

    try {
        New-Item -ItemType Directory -Path $projectDir -Force -ErrorAction Stop | Out-Null
    } catch {
        Write-Host "ERROR: Could not create project folder at $projectDir" -ForegroundColor Red
        Write-Host "       $_" -ForegroundColor Red
        Write-Host '       Rolling back registry entry — no commit will be made.' -ForegroundColor Yellow
        # Remove the bad entry from registry before it can be committed
        $reg.projects.PSObject.Properties.Remove($projectId)
        $reg.next_id = $nextId
        Save-Registry $reg
        exit 1
    }

    $today = Get-Date -Format 'yyyy-MM-dd'
    $template = @"
<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [$projectId] $FullName

| Field        | Value                              |
|--------------|------------------------------------|
| Project ID   | $projectId                         |
| Short name   | $ShortName                         |
| Last updated | $today                             |
| Updated by   | $MachineId                         |
| Status       | active                             |
| Machines     | $MachineId                         |

## Summary
[TODO: Write 2-4 sentences describing this project]

## Key Facts
- [TODO: Add key facts]

## Memory Files
| File | Description |
|------|-------------|
| | |

## Recent Changes
- ${today}: Project registered
"@

    $template | Set-Content (Join-Path $projectDir 'MEMORY.md') -Encoding UTF8

    # Re-sync sparse checkout now that the project is registered, so its folder is inside the
    # sparse definition before commit. Otherwise `git add -A` silently skips the new MEMORY.md
    # on sparse-checkout machines (the sparse set was computed before this project existed).
    Sync-SparseCheckout

    # Scoped staging: only the registry and this project's new folder.
    Git-CommitPush "init: $projectId ($ShortName) - $FullName" @('registry.json', "projects/$projectId-$ShortName")

    Write-Host ''
    Write-Host '  Project registered successfully!' -ForegroundColor Green
    Write-Host "  ID:     $projectId" -ForegroundColor Cyan
    Write-Host "  Name:   $FullName"
    Write-Host "  Folder: projects/$folderName/"
    Write-Host ''
    Write-Host '  Next steps:' -ForegroundColor Yellow
    Write-Host "  1. Edit projects/$folderName/MEMORY.md with project details"
    Write-Host "  2. Run: mimp push $ShortName"
    Write-Host ''
}

function Cmd-Push {
    param($ProjectRef)
    if (-not $ProjectRef) {
        Write-Host 'Usage: mimp push [project_id_or_short_name]' -ForegroundColor Yellow
        exit 1
    }

    Git-Sync
    $projectId = Resolve-ProjectId $ProjectRef
    $repoDir = Get-ProjectFolder $projectId
    $localPath = Get-LocalPath $projectId

    $reg = Load-Registry
    $project = $reg.projects.$projectId

    $memoryFiles = @()
    $sourcePaths = @()

    # 1. Project directory locations (CLAUDE.md, .claude\, memory\)
    $claudeMd = Join-Path $localPath 'CLAUDE.md'
    if (Test-Path $claudeMd) { $memoryFiles += $claudeMd }

    $claudeDir = Join-Path $localPath '.claude'
    if (Test-Path $claudeDir) {
        Get-ChildItem -Path $claudeDir -Filter '*.md' -Recurse |
            ForEach-Object { $memoryFiles += $_.FullName }
    }

    $memoryDir = Join-Path $localPath 'memory'
    if (Test-Path $memoryDir) {
        Get-ChildItem -Path $memoryDir -Filter '*.md' -Recurse |
            ForEach-Object { $memoryFiles += $_.FullName }
        $sourcePaths += $memoryDir
    }

    # 2. Claude Code agent memory — per-machine path from registry
    $claudeAgentPath = $null
    if ($project.claude_memory_paths) {
        $claudeAgentPath = $project.claude_memory_paths.$MachineId
    }
    if ($claudeAgentPath -and (Test-Path $claudeAgentPath)) {
        Get-ChildItem -Path $claudeAgentPath -Filter '*.md' -Recurse |
            ForEach-Object { $memoryFiles += $_.FullName }
        $sourcePaths += $claudeAgentPath
    }

    if ($memoryFiles.Count -eq 0) {
        Write-Host "WARNING: No memory files found for $projectId" -ForegroundColor Yellow
        Write-Host "  Looked in: $localPath (CLAUDE.md, .claude\, memory\)"
        if ($claudeAgentPath) {
            Write-Host "  Also looked in: $claudeAgentPath"
        } else {
            Write-Host "  Tip: Add claude_memory_paths.$MachineId to registry.json for this project"
        }
        exit 1
    }

    Write-Host "Pushing memory for $projectId..." -ForegroundColor Cyan
    Write-Host "  Local project: $localPath"
    if ($claudeAgentPath) { Write-Host "  Claude memory: $claudeAgentPath" }
    Write-Host "  Target repo:   $repoDir"
    Write-Host ''

    New-Item -ItemType Directory -Path $repoDir -Force | Out-Null

    foreach ($file in $memoryFiles) {
        $relativePath = $null
        foreach ($src in @($localPath, $claudeAgentPath)) {
            if ($src -and $file.StartsWith($src)) {
                $relativePath = $file.Substring($src.Length).TrimStart('\', '/')
                break
            }
        }
        if (-not $relativePath) { $relativePath = Split-Path $file -Leaf }

        $destPath = Join-Path $repoDir $relativePath
        $destDir = Split-Path $destPath -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item -Path $file -Destination $destPath -Force
        Write-Host "  Copied: $relativePath" -ForegroundColor DarkGray
    }

    $memoryMd = Join-Path $repoDir 'MEMORY.md'
    if (Test-Path $memoryMd) {
        $content = Get-Content $memoryMd -Raw -Encoding UTF8
        $today = Get-Date -Format 'yyyy-MM-dd'
        $content = $content -replace '(?<=Last updated \| )[\d-]+', $today
        $content = $content -replace '(?<=Updated by   \| )\S+', $MachineId
        $content | Set-Content $memoryMd -Encoding UTF8
    }

    # Scoped staging: only this project's folder plus the registry (MEMORY.md stamps may change it).
    Git-CommitPush "push: $projectId from $MachineId ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))" @("projects/$projectId-$($project.short_name)", 'registry.json')

    Write-Host ''
    Write-Host "  Pushed $($memoryFiles.Count) file(s) for $projectId" -ForegroundColor Green
}

function Cmd-Pull {
    param($ProjectRef)
    if (-not $ProjectRef) {
        Write-Host 'Usage: mimp pull [project_id_or_short_name]' -ForegroundColor Yellow
        exit 1
    }

    Git-Sync
    $projectId = Resolve-ProjectId $ProjectRef
    $repoDir = Get-ProjectFolder $projectId
    $localPath = Get-LocalPath $projectId

    if (-not (Test-Path $repoDir)) {
        Write-Host "ERROR: No memory folder found at $repoDir" -ForegroundColor Red
        exit 1
    }

    $reg = Load-Registry
    $project = $reg.projects.$projectId

    # Resolve Claude Code agent memory path for this machine
    $claudeAgentPath = $null
    if ($project.claude_memory_paths) {
        $claudeAgentPath = $project.claude_memory_paths.$MachineId
    }

    Write-Host "Pulling memory for $projectId..." -ForegroundColor Cyan
    Write-Host "  Source: $repoDir"
    Write-Host "  Project dir: $localPath"
    if ($claudeAgentPath) { Write-Host "  Claude memory: $claudeAgentPath" }
    Write-Host ''

    # Always create project-level .claude\ for reference copies
    $claudeDir = Join-Path $localPath '.claude'
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null

    # Create Claude Code memory dir so files are picked up automatically
    if ($claudeAgentPath) {
        New-Item -ItemType Directory -Path $claudeAgentPath -Force | Out-Null
    }

    $files = Get-ChildItem -Path $repoDir -Filter '*.md' -Recurse
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace($repoDir, '').TrimStart('\', '/')

        if ($file.Name -eq 'CLAUDE.md') {
            # CLAUDE.md goes to project root — Claude Code reads it from there
            $destPath = Join-Path $localPath 'CLAUDE.md'
        } elseif ($claudeAgentPath) {
            # All other files go directly into Claude Code's memory location
            # so Claude Code picks them up automatically on next session
            $destPath = Join-Path $claudeAgentPath $relativePath
        } else {
            # Fallback: copy to project-level .claude\ if no agent path configured
            $destPath = Join-Path $claudeDir $relativePath
        }

        $destDir = Split-Path $destPath -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "  Pulled: $relativePath" -ForegroundColor DarkGray
    }

    Write-Host ''
    Write-Host "  Pulled $($files.Count) file(s) for $projectId" -ForegroundColor Green
    Write-Host "  Memory available at: $localPath" -ForegroundColor Cyan
}

function Cmd-List {
    Git-Sync
    $reg = Load-Registry

    Write-Host ''
    Write-Host '  Registered Projects' -ForegroundColor Cyan
    Write-Host '  ---------------------------------------------------' -ForegroundColor DarkGray

    if ($reg.projects.PSObject.Properties.Name.Count -eq 0) {
        Write-Host '  (no projects registered yet)' -ForegroundColor DarkGray
    } else {
        foreach ($prop in $reg.projects.PSObject.Properties) {
            $p = $prop.Value
            $localPath = $p.local_paths.$MachineId
            $hasLocal = '---'
            if ($localPath -and (Test-Path $localPath)) { $hasLocal = 'LOCAL' }
            $statusColor = 'DarkGray'
            if ($p.status -eq 'active') { $statusColor = 'Green' }
            Write-Host ("  {0}  {1,-35} [{2}]  {3}" -f $prop.Name, $p.full_name, $p.status, $hasLocal) -ForegroundColor $statusColor
        }
    }
    Write-Host ''
}

function Cmd-Status {
    param($ProjectRef)
    if (-not $ProjectRef) {
        Write-Host 'Usage: mimp status [project_id_or_short_name]' -ForegroundColor Yellow
        exit 1
    }

    Git-Sync
    $projectId = Resolve-ProjectId $ProjectRef
    $repoDir = Get-ProjectFolder $projectId
    $localPath = Get-LocalPath $projectId

    Write-Host ''
    Write-Host "  Status for $projectId" -ForegroundColor Cyan
    Write-Host "  Repo:  $repoDir"
    Write-Host "  Local: $localPath"
    Write-Host ''

    $repoFiles = Get-ChildItem -Path $repoDir -Filter '*.md' -Recurse -ErrorAction SilentlyContinue
    $localMdFiles = @()

    $claudeMd = Join-Path $localPath 'CLAUDE.md'
    if (Test-Path $claudeMd) { $localMdFiles += Get-Item $claudeMd }

    $claudeDir = Join-Path $localPath '.claude'
    if (Test-Path $claudeDir) {
        Get-ChildItem -Path $claudeDir -Filter '*.md' -Recurse |
            ForEach-Object { $localMdFiles += $_ }
    }

    $repoColor = 'Yellow'
    if ($repoFiles.Count -gt 0) { $repoColor = 'Green' }
    $localColor = 'Yellow'
    if ($localMdFiles.Count -gt 0) { $localColor = 'Green' }

    Write-Host "  Repo files:  $($repoFiles.Count)" -ForegroundColor $repoColor
    Write-Host "  Local files: $($localMdFiles.Count)" -ForegroundColor $localColor

    if ($repoFiles.Count -gt 0) {
        $latestRepo = ($repoFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
        Write-Host "  Repo last updated:  $latestRepo"
    }
    if ($localMdFiles.Count -gt 0) {
        $latestLocal = ($localMdFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
        Write-Host "  Local last updated: $latestLocal"
    }
    Write-Host ''
}

# Best-effort desktop notification for scheduled-run. Never allowed to fail the sync itself -
# a broken toast is not a reason to hide a real push failure.
function Show-Toast {
    param([string]$Title, [string]$Message)
    try {
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing
        $icon = New-Object System.Windows.Forms.NotifyIcon
        $icon.Icon = [System.Drawing.SystemIcons]::Warning
        $icon.Visible = $true
        $icon.ShowBalloonTip(10000, $Title, $Message, [System.Windows.Forms.ToolTipIcon]::Warning)
        # Balloon is queued by the OS on show; disposing immediately can drop it before it renders.
        Start-Sleep -Seconds 3
        $icon.Dispose()
    } catch {
        Write-Host "  (toast notification unavailable: $_)" -ForegroundColor DarkGray
    }
}

function Get-IgnoreList {
    $ignorePath = Join-Path $RepoPath 'tools\mimp-ignore.txt'
    if (-not (Test-Path $ignorePath)) { return @() }
    return @(Get-Content $ignorePath | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') })
}

# Folder names under ~/.claude/projects/ already accounted for by a registered project on this
# machine - via an explicit claude_memory_paths entry, or the path mimp init would derive from
# local_paths even if claude_memory_paths was never explicitly saved.
function Get-ClaimedClaudeFolders {
    $reg = Load-Registry
    $claimed = @{}
    foreach ($prop in $reg.projects.PSObject.Properties) {
        $p = $prop.Value
        if ($p.claude_memory_paths -and $p.claude_memory_paths.$MachineId) {
            $folder = Split-Path (Split-Path $p.claude_memory_paths.$MachineId -Parent) -Leaf
            $claimed[$folder] = $true
        }
        if ($p.local_paths -and $p.local_paths.$MachineId) {
            $encoded = Get-EncodedClaudePath $p.local_paths.$MachineId
            if ($encoded) { $claimed[$encoded] = $true }
        }
    }
    return $claimed
}

# Read-only scan (ADR-0009): surfaces candidates for `mimp init`, never registers anything itself -
# entity/pillar/product classification is a judgment call, not something to guess.
function Find-UnregisteredProjects {
    $claudeBase = Join-Path $env:USERPROFILE '.claude\projects'
    if (-not (Test-Path $claudeBase)) { return @() }

    $claimed = Get-ClaimedClaudeFolders
    $ignored = @(Get-IgnoreList)

    $candidates = @()
    Get-ChildItem -Path $claudeBase -Directory | ForEach-Object {
        $name = $_.Name
        if ($claimed.ContainsKey($name)) { return }
        if ($ignored -contains $name) { return }
        if (Test-Path (Join-Path $_.FullName 'memory\MEMORY.md')) {
            $candidates += $name
        }
    }
    return $candidates
}

function Cmd-ScheduledRun {
    param([switch]$DryRun)

    $logPath = Join-Path $env:USERPROFILE '.mimp-scheduled-run.log'
    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content $logPath "`n=== $stamp scheduled-run on $MachineId$(if ($DryRun) { ' [dry-run]' }) ==="

    $pushed = @()
    $failures = @()

    $reg = Load-Registry
    foreach ($prop in $reg.projects.PSObject.Properties) {
        $p = $prop.Value
        if ($p.status -ne 'active') { continue }
        if (-not ($p.local_paths -and $p.local_paths.$MachineId)) { continue }

        $shortName = $p.short_name
        if ($DryRun) {
            Add-Content $logPath "  [dry-run] would push $($prop.Name) ($shortName)"
            continue
        }

        Add-Content $logPath "  pushing $($prop.Name) ($shortName)..."
        # Shell out rather than calling Cmd-Push in-process: a failed push exits 1 (ADR-0007,
        # deliberately fail-loud) and must not abort the rest of the batch.
        $output = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath push $shortName 2>&1
        $output | ForEach-Object { Add-Content $logPath "    $_" }
        if ($LASTEXITCODE -eq 0) {
            $pushed += $shortName
        } else {
            $failures += $shortName
            Add-Content $logPath "  FAILED: $shortName (exit $LASTEXITCODE)"
        }
    }

    $candidates = Find-UnregisteredProjects

    Add-Content $logPath "  Summary: $($pushed.Count) pushed, $($failures.Count) failed, $($candidates.Count) unregistered candidate(s)."
    if ($candidates.Count -gt 0) {
        $candidates | ForEach-Object { Add-Content $logPath "    unregistered: $_" }
    }

    Write-Host "Scheduled run complete: $($pushed.Count) pushed, $($failures.Count) failed, $($candidates.Count) unregistered candidate(s)." -ForegroundColor Cyan
    Write-Host "Log: $logPath" -ForegroundColor DarkGray

    if (-not $DryRun -and ($failures.Count -gt 0 -or $candidates.Count -gt 0)) {
        $lines = @()
        if ($failures.Count -gt 0) { $lines += "$($failures.Count) push(es) failed: $($failures -join ', ')" }
        if ($candidates.Count -gt 0) { $lines += "$($candidates.Count) unregistered project(s) - run mimp init: $($candidates -join ', ')" }
        Show-Toast -Title 'MIMemoryLLMDb scheduled sync' -Message ($lines -join "`n")
    }
}

# ── Command Router ──────────────────────────────────────────────────

switch ($Command) {
    'init'          { Cmd-Init -FullName $Arg1 -ShortName $Arg2 -LocalPath $Arg3 }
    'push'          { Cmd-Push -ProjectRef $Arg1 }
    'pull'          { Cmd-Pull -ProjectRef $Arg1 }
    'list'          { Cmd-List }
    'status'        { Cmd-Status -ProjectRef $Arg1 }
    'sync'          { Cmd-Pull -ProjectRef $Arg1; Cmd-Push -ProjectRef $Arg1 }
    'scheduled-run' { Cmd-ScheduledRun -DryRun:$dryrun }
    'lint'          {
        # Mechanical lint (Phase 2.1) - deterministic, no model, no tokens. Implemented in Node
        # because it hashes files and parses markdown; PowerShell 5.1 is the wrong tool for that.
        $lintScript = Join-Path $PSScriptRoot 'lint.mjs'
        if (-not (Test-Path $lintScript)) {
            Write-Host "ERROR: lint.mjs not found at $lintScript" -ForegroundColor Red
            exit 1
        }
        $node = Get-Command node -ErrorAction SilentlyContinue
        if (-not $node) {
            Write-Host 'ERROR: node is not on PATH. mimp lint needs Node (same requirement as the MCP server).' -ForegroundColor Red
            exit 1
        }
        $lintArgs = @($lintScript)
        if ($json) { $lintArgs += '--json' }
        if ($quiet) { $lintArgs += '--quiet' }
        & node @lintArgs
        exit $LASTEXITCODE
    }
    'sparse-status' {
        Sync-SparseCheckout
        Write-Host ''
        Write-Host "  Sparse checkout paths for $MachineId" -ForegroundColor Cyan
        Write-Host '  ---------------------------------------------------' -ForegroundColor DarkGray
        $sparseFile = Join-Path $RepoPath '.git\info\sparse-checkout'
        if (Test-Path $sparseFile) {
            Get-Content $sparseFile | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
        } else {
            Write-Host '  (sparse checkout not active)' -ForegroundColor Yellow
        }
        Write-Host ''
    }
    default  {
        Write-Host ''
        Write-Host '  MIMemoryLLMDb CLI' -ForegroundColor Cyan
        Write-Host '  Usage: mimp [command] [args]' -ForegroundColor Yellow
        Write-Host ''
        Write-Host '  Commands:'
        Write-Host '    init          [full_name] [short_name] [local_path]  Register new project'
        Write-Host '    push          [project_id_or_short_name]             Push local -> GitHub'
        Write-Host '    pull          [project_id_or_short_name]             Pull GitHub -> local'
        Write-Host '    list                                                 List all projects'
        Write-Host '    status        [project_id_or_short_name]             Compare local vs repo'
        Write-Host '    sync          [project_id_or_short_name]             Pull then push'
        Write-Host '    sparse-status                                        Show this machine''s sparse checkout paths'
        Write-Host '    lint          [--json] [--quiet]                      Mechanical brain lint (exit 1 on error)'
        Write-Host '    scheduled-run [--dry-run]                            Push all active projects on this machine + scan for unregistered ones'
        Write-Host ''
        Write-Host '  lint checks: broken links and wikilinks, Source hash drift, uncited pages,'
        Write-Host '  orphan wiki pages, passed deadlines, dead registry paths, unpushed memory,'
        Write-Host '  overdue reviews. Reports only - it never fixes.' -ForegroundColor DarkGray
        Write-Host ''
        Write-Host '  scheduled-run is meant to be invoked by tools/install-schedule.ps1''s Scheduled'
        Write-Host '  Task (ADR-0009), not run by hand day to day - use --dry-run to preview it.' -ForegroundColor DarkGray
        Write-Host ''
    }
}
