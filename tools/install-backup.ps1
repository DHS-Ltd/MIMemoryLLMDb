# One-time, from an Administrator PowerShell on machineA: registers ADR-0012's three backup tasks.
# Re-run any time - it replaces them.
#
#   powershell -ExecutionPolicy Bypass -File E:\MIMemoryLLMDb\tools\install-backup.ps1 [-RunImageNow]
#
# -RunImageNow starts the first Image straight away instead of waiting for Sunday 02:00.

param([switch]$RunImageNow)
$ErrorActionPreference = 'Stop'

$me = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $me.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'ERROR: run this from an Administrator PowerShell - the Image task runs as SYSTEM.' -ForegroundColor Red
    exit 1
}

# The repo from mimp's config, not this script's folder: tasks must point at the master checkout,
# never at a worktree.
$Config = Get-Content (Join-Path $env:USERPROFILE '.mimp-config.json') -Raw | ConvertFrom-Json
$Script = Join-Path (Join-Path $Config.repo_path 'tools') 'backup.ps1'
$UserStatus = Join-Path $env:USERPROFILE '.mimp-backup'

# The Image runs as SYSTEM, so it must not run a script, or write into a folder, that this user can
# change without elevation - that would hand SYSTEM to anything running as this user. It gets its
# own copy in a folder only SYSTEM and Administrators can write (Users may read: the nightly run
# reads its result). Re-run this installer after editing backup.ps1.
$SystemDir = Join-Path $env:ProgramData 'mimp-backup'
New-Item -ItemType Directory -Path $SystemDir -Force | Out-Null
& icacls $SystemDir /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-32-545:(OI)(CI)RX' | Out-Null
if ($LASTEXITCODE -ne 0) { throw "icacls could not lock down $SystemDir" }
$SystemScript = Join-Path $SystemDir 'backup.ps1'
Copy-Item $Script $SystemScript -Force

function Register-BackupTask([string]$Name, [string]$ScriptPath, [string]$Arguments, $Trigger, $Principal, [int]$Hours, [string]$Description) {
    $action = New-ScheduledTaskAction -Execute 'powershell.exe' `
        -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`" $Arguments"
    # StartWhenAvailable: a run missed while the PC was off fires when it is back, not next week.
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours $Hours)
    if (Get-ScheduledTask -TaskName $Name -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $Name -Confirm:$false
    }
    Register-ScheduledTask -TaskName $Name -Action $action -Trigger $Trigger -Settings $settings `
        -Principal $Principal -Description $Description | Out-Null
    Write-Host "  registered $Name" -ForegroundColor Green
}

# Mirrors run as this user with no window popping up each hour (S4U: no password stored; it
# reaches local disks only, which is all a Mirror needs). The Image needs SYSTEM for wbadmin.
$user = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Limited
$system = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest

# Passed explicitly rather than trusting each logon type's own profile variables.
$mirrorArgs = "-StatusDir `"$UserStatus`" -UserFolder `"$env:USERPROFILE`""

# Times keep clear of the 23:00 memory sync (design brief, "Assumed").
Register-BackupTask 'MIMemoryLLMDb-Backup-MirrorD' $Script "mirror -Target D: $mirrorArgs" `
    (New-ScheduledTaskTrigger -Once -At '00:40' -RepetitionInterval (New-TimeSpan -Hours 1)) $user 4 `
    'ADR-0012: hourly Mirror of E: and the user folder to D:\Backup\Mirror.'
Register-BackupTask 'MIMemoryLLMDb-Backup-MirrorG' $Script "mirror -Target G: $mirrorArgs" `
    (New-ScheduledTaskTrigger -Daily -At '00:30') $user 4 `
    'ADR-0012: nightly Mirror to G:\Backup\Mirror - one day behind, so a mistake made today can be undone from it.'
Register-BackupTask 'MIMemoryLLMDb-Backup-Image' $SystemScript "image -StatusDir `"$SystemDir`"" `
    (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At '02:00') $system 8 `
    'ADR-0012: weekly Image of C: and E: to D: (wbadmin), keeping the last 4.'

if ($RunImageNow) {
    Start-ScheduledTask -TaskName 'MIMemoryLLMDb-Backup-Image'
    Write-Host '  first Image started in the background; result in' (Join-Path $SystemDir 'image.json') -ForegroundColor Cyan
}
Write-Host ''
Write-Host "  Results land in $UserStatus (Mirrors) and $SystemDir (Image); the 23:00 run puts them in the Heartbeat."
