# machineA's Image and Mirrors (ADR-0012, docs/machine-continuity-design-2026-11.md).
# Each run writes <StatusDir>\<job>.json and <job>.log; the nightly scheduled-run copies the
# results into the Heartbeat, where lint check 11 raises an ERROR for a stale or failed job.
#
#   backup.ps1 mirror -Target D:   hourly    E: + user folder -> D:\Backup\Mirror
#   backup.ps1 mirror -Target G:   nightly   the same -> G:\Backup\Mirror, one day behind = an undo
#   backup.ps1 image               weekly    wbadmin C:+E: -> D:, keeps the last 4 (Administrator)
#
# Registered by install-backup.ps1: Mirrors write to ~/.mimp-backup; the Image runs as SYSTEM from
# an admin-only copy in C:\ProgramData\mimp-backup and writes there. Dot-sourced with no
# arguments it only defines its functions (test-backup-guard.ps1).

param(
    [ValidateSet('mirror', 'image')][string]$Mode,
    [ValidateSet('D:', 'G:')][string]$Target,   # the two HDDs - never the SSD (C:, E:)
    [string]$StatusDir = (Join-Path $env:USERPROFILE '.mimp-backup'),
    [string]$UserFolder = $env:USERPROFILE
)

function Write-Result([string]$Job, [bool]$Ok, [string]$Detail, [string]$Log) {
    New-Item -ItemType Directory -Path $StatusDir -Force | Out-Null
    $path = Join-Path $StatusDir "$Job.json"
    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK'
    # Carry the last success across failed runs: lint measures staleness from it.
    $lastOk = $null
    if (Test-Path $path) {
        try { $lastOk = (Get-Content $path -Raw | ConvertFrom-Json).last_ok }
        catch { $Detail = "$Detail; previous result unreadable, last success lost" }
    }
    if ($Ok) { $lastOk = $now }
    $result = [ordered]@{ job = $Job; last_run = $now; ok = $Ok; last_ok = $lastOk; detail = $Detail; log = $Log }
    # WriteAllText, not Set-Content: PS 5.1's UTF8 adds a BOM, which JSON.parse rejects.
    [IO.File]::WriteAllText($path, ($result | ConvertTo-Json))
}

# After an SSD crash, E: and C: come back from an Image days older than the Mirrors - and the
# Image brings these scheduled tasks back with it. Mirroring that older copy would delete from the
# Mirror exactly the newer files the restore needs. So every run leaves a stamp in each source,
# and a run refuses when a source's stamp is older than the Mirror's copy of it (or missing while
# the Mirror has one: a reinstalled Windows, a blank new disk).
function Get-RollbackReason([string]$Label, [string]$SourceStamp, [string]$MirrorStamp) {
    if (-not (Test-Path $MirrorStamp)) { return $null }   # first run onto this disk
    $mirror = (Get-Content $MirrorStamp -Raw).Trim()
    if (-not (Test-Path $SourceStamp)) {
        return "$Label has no stamp but its Mirror does (last mirrored $mirror) - $Label looks new or restored"
    }
    $source = (Get-Content $SourceStamp -Raw).Trim()
    if ([string]::CompareOrdinal($source, $mirror) -lt 0) {
        return "$Label says it was last mirrored $source but its Mirror holds $mirror - $Label looks restored from an older Image"
    }
    return $null
}

function Invoke-Mirror {
    $job = 'mirror-' + $Target.TrimEnd(':')
    $log = Join-Path $StatusDir "$job.log"
    if (-not (Test-Path "$Target\")) {   # the HDD died or lost its drive letter
        Write-Result $job $false "drive $Target not found" $log
        exit 1
    }
    $dest = Join-Path $Target 'Backup\Mirror'
    New-Item -ItemType Directory -Path $StatusDir -Force | Out-Null
    $e = @{ Label = 'E:'; Source = 'E:\'; Mirror = (Join-Path $dest 'E') }
    $u = @{ Label = 'the user folder'; Source = $UserFolder
            Mirror = (Join-Path (Join-Path $dest 'Users') (Split-Path $UserFolder -Leaf)) }

    # Both checked before either is touched: C: and E: can be restored or rebuilt separately.
    $stampName = ".mimp-$job.stamp"
    foreach ($p in $e, $u) {
        $reason = Get-RollbackReason $p.Label (Join-Path $p.Source $stampName) (Join-Path $p.Mirror $stampName)
        if ($reason) {
            Write-Result $job $false "REFUSED: $reason. Copy newer files back from $($p.Mirror) first, then delete its $stampName to resume." $log
            exit 1
        }
    }
    # UTC, fixed width: compares correctly as plain text.
    $now = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    foreach ($p in $e, $u) { [IO.File]::WriteAllText((Join-Path $p.Source $stampName), $now) }

    # /MIR mirrors (deletes what E: no longer has); /XJ skips junctions (~/.claude/skills is full of
    # them, and their targets are copied anyway); /R:1 /W:1 because the default retries a locked file
    # 1,000,000 times x 30 s. /XD takes folder names (matched anywhere) and full paths. Exclusions
    # are Q4's, plus the Desktop (nothing important kept there; it stays in the weekly Image), the
    # locked registry hive (ntuser.*) and Windows Installer's rollback folder (Config.Msi:
    # system-only, access denied on the first run). OneDrive itself is mirrored: its app had
    # silently stopped for 3 months, so its cloud copy is no backup. /XA:O skips its cloud-only
    # files - they hold no data here, and reading one fails while the app is not running.
    $common = @('/MIR', '/XJ', '/R:1', '/W:1', '/MT:8', '/NP', '/NDL', '/NFL')
    $eArgs = @($e.Source, $e.Mirror,
        '/XD', '$RECYCLE.BIN', 'System Volume Information', 'Config.Msi', 'E:\DHS-ERP\WSL',
        'node_modules', '.venv', 'venv', '.next', '.gradle') + $common + "/LOG:$log"
    $uArgs = @($u.Source, $u.Mirror,
        '/XD', 'AppData', '.ollama', '.cache', '.gradle', '.m2', 'node_modules',
        (Join-Path $UserFolder 'OneDrive\Desktop'), (Join-Path $UserFolder 'Desktop'),
        (Join-Path $UserFolder '.vscode\extensions'), (Join-Path $UserFolder '.cursor\extensions'),
        '/XF', 'ntuser.*', '/XA:O') + $common + "/LOG+:$log"

    & robocopy @eArgs | Out-Null
    $eCode = $LASTEXITCODE
    & robocopy @uArgs | Out-Null
    $uCode = $LASTEXITCODE
    # robocopy: below 8 = success (bits for copied / extra / mismatched files), 8 and up = failures.
    $ok = ($eCode -lt 8) -and ($uCode -lt 8)
    Write-Result $job $ok "robocopy exit E:=$eCode, user folder=$uCode" $log
    if (-not $ok) { exit 1 }
}

function Invoke-Image {
    $log = Join-Path $StatusDir 'image.log'
    New-Item -ItemType Directory -Path $StatusDir -Force | Out-Null
    # Quoted: unquoted, PowerShell would split C:,E: into two arguments. -allCritical adds what a
    # bare-metal restore needs besides C: (boot and recovery partitions).
    $out = & wbadmin start backup '-backupTarget:D:' '-include:C:,E:' -allCritical -quiet 2>&1
    $code = $LASTEXITCODE
    [IO.File]::WriteAllText($log, ($out | Out-String))   # Out-String: safe when wbadmin printed nothing
    # The exit code is the signal; wbadmin's last line rides along as evidence for the Heartbeat.
    $last = @($out | ForEach-Object { "$_".Trim() } | Where-Object { $_ }) | Select-Object -Last 1
    $detail = "wbadmin exit ${code}: $last"
    if ($code -eq 0) {
        # Q5: keep the last 4 (~1 month back). A failed clean-up is reported, not a failed Image.
        $del = & wbadmin delete backup '-keepVersions:4' '-backupTarget:D:' -quiet 2>&1
        $delCode = $LASTEXITCODE
        [IO.File]::AppendAllText($log, ($del | Out-String))
        if ($delCode -ne 0) { $detail += "; keep-4 clean-up exit $delCode" }
    }
    Write-Result 'image' ($code -eq 0) $detail $log
    if ($code -ne 0) { exit 1 }
}

if (-not $Mode) { return }   # dot-sourced: functions only
if ($Mode -eq 'image') { Invoke-Image; exit 0 }
if (-not $Target) {
    Write-Host 'ERROR: mirror needs -Target D: or -Target G:' -ForegroundColor Red
    exit 1
}
Invoke-Mirror
