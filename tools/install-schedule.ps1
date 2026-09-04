# One-time per-machine setup for ADR-0009: registers a Windows Scheduled Task that runs
# `mimp scheduled-run` daily. Run this once on each machine (machineA, machineB, ...).
# Re-run any time to update the trigger time - it replaces the existing task.
#
# Usage: powershell -File install-schedule.ps1 [-Time '23:00']

param(
    [string]$Time = '23:00'
)

$ErrorActionPreference = 'Stop'

$ConfigPath = Join-Path $env:USERPROFILE '.mimp-config.json'
if (-not (Test-Path $ConfigPath)) {
    Write-Host "ERROR: No mimp config found at $ConfigPath" -ForegroundColor Red
    Write-Host '       Set up mimp on this machine first (see docs), then re-run this script.'
    exit 1
}

$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$RepoPath = $Config.repo_path
$MimpScript = Join-Path $RepoPath 'tools\mimp.ps1'

if (-not (Test-Path $MimpScript)) {
    Write-Host "ERROR: mimp.ps1 not found at $MimpScript" -ForegroundColor Red
    exit 1
}

$TaskName = 'MIMemoryLLMDb-ScheduledSync'

$Action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$MimpScript`" scheduled-run"

# Daily at $Time; StartWhenAvailable is the missed-run catch-up (ADR-0009) - if the machine is
# off/asleep/locked-out at $Time, the run fires at next login instead of being skipped.
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

# LogonType Interactive = "run only when user is logged on" (ADR-0009) - required because git's
# wincred credential helper is bound to the interactive session, not the machine.
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Write-Host "Task '$TaskName' already exists - replacing it." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger `
    -Settings $Settings -Principal $Principal `
    -Description 'ADR-0009: nightly mimp push for active projects on this machine, plus a scan for unregistered project memory.' `
    | Out-Null

Write-Host ''
Write-Host "  Scheduled task '$TaskName' registered." -ForegroundColor Green
Write-Host "  Runs daily at $Time (catches up at next login if missed)."
Write-Host "  Test it now without touching git: powershell -File `"$MimpScript`" scheduled-run --dry-run"
Write-Host ''
