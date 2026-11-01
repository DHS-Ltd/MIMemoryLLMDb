# Run: powershell -File tools/test-backup-guard.ps1 - temp files only, never a real Mirror.
# The guard in backup.ps1 that stops a Mirror from wiping newer files after an Image restore.
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'backup.ps1')

$dir = Join-Path $env:TEMP "backup-guard-$PID"
New-Item -ItemType Directory -Path $dir | Out-Null
$src = Join-Path $dir 'source.stamp'
$mir = Join-Path $dir 'mirror.stamp'
function Check([string]$Case, [bool]$ShouldRefuse) {
    $reason = Get-RollbackReason 'E:' $src $mir
    if ([bool]$reason -ne $ShouldRefuse) { throw "FAIL: $Case (got: '$reason')" }
}

try {
    Check 'first run: no stamps' $false
    Set-Content $src '2026-11-01T10:00:00Z'; Check 'first run onto an empty disk' $false
    Set-Content $mir '2026-11-01T10:00:00Z'; Check 'same stamp' $false
    Set-Content $src '2026-11-01T11:00:00Z'; Check 'normal next run' $false
    Set-Content $src '2026-10-25T01:40:00Z'; Check 'E: restored from an older Image' $true
    Remove-Item $src;                        Check 'blank E: while the Mirror has data' $true
    Write-Host 'backup-guard: all checks passed'
} finally {
    Remove-Item $dir -Recurse -Force
}
