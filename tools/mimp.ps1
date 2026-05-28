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
    [Parameter(Position=3)][string]$Arg3
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

function Git-Sync {
    Push-Location $RepoPath
    git pull --rebase --quiet 2>$null
    Pop-Location
}

function Git-CommitPush($message) {
    Push-Location $RepoPath
    git add -A
    git commit -m $message --quiet
    git push --quiet
    Pop-Location
}

# ── Commands ────────────────────────────────────────────────────────

function Cmd-Init {
    param($FullName, $ShortName, $LocalPath)
    if (-not $FullName -or -not $ShortName) {
        Write-Host 'Usage: mimp init [full_name] [short_name] [local_path]' -ForegroundColor Yellow
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

    $nextId = $reg.next_id
    $projectId = 'MIMP-{0:D3}' -f $nextId
    $reg.next_id = $nextId + 1

    $newProject = [PSCustomObject]@{
        short_name  = $ShortName
        full_name   = $FullName
        created     = (Get-Date -Format 'yyyy-MM-dd')
        created_by  = $MachineId
        status      = 'active'
        local_paths = [PSCustomObject]@{
            $MachineId = if ($LocalPath) { $LocalPath } else { $null }
        }
    }
    $reg.projects | Add-Member -NotePropertyName $projectId -NotePropertyValue $newProject

    Save-Registry $reg

    $folderName = "$projectId-$ShortName"
    $projectDir = Join-Path (Join-Path $RepoPath 'projects') $folderName
    New-Item -ItemType Directory -Path $projectDir -Force | Out-Null

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

    Git-CommitPush "init: $projectId ($ShortName) - $FullName"

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
        $content = Get-Content $memoryMd -Raw
        $today = Get-Date -Format 'yyyy-MM-dd'
        $content = $content -replace '(?<=Last updated \| )[\d-]+', $today
        $content = $content -replace '(?<=Updated by   \| )\S+', $MachineId
        $content | Set-Content $memoryMd -Encoding UTF8
    }

    Git-CommitPush "push: $projectId from $MachineId ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"

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

# ── Command Router ──────────────────────────────────────────────────

switch ($Command) {
    'init'   { Cmd-Init -FullName $Arg1 -ShortName $Arg2 -LocalPath $Arg3 }
    'push'   { Cmd-Push -ProjectRef $Arg1 }
    'pull'   { Cmd-Pull -ProjectRef $Arg1 }
    'list'   { Cmd-List }
    'status' { Cmd-Status -ProjectRef $Arg1 }
    'sync'   { Cmd-Pull -ProjectRef $Arg1; Cmd-Push -ProjectRef $Arg1 }
    default  {
        Write-Host ''
        Write-Host '  MIMemoryLLMDb CLI' -ForegroundColor Cyan
        Write-Host '  Usage: mimp [command] [args]' -ForegroundColor Yellow
        Write-Host ''
        Write-Host '  Commands:'
        Write-Host '    init   [full_name] [short_name] [local_path]  Register new project'
        Write-Host '    push   [project_id_or_short_name]             Push local -> GitHub'
        Write-Host '    pull   [project_id_or_short_name]             Pull GitHub -> local'
        Write-Host '    list                                          List all projects'
        Write-Host '    status [project_id_or_short_name]             Compare local vs repo'
        Write-Host '    sync   [project_id_or_short_name]             Pull then push'
        Write-Host ''
    }
}
