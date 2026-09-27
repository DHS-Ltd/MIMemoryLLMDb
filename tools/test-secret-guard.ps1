# Runnable check for mimp's secret guard (Find-Secrets). Token-shaped fixtures are assembled at
# runtime so no literal secret-looking string is ever committed.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tools\test-secret-guard.ps1  (exit 0 = pass)

. (Join-Path $PSScriptRoot 'mimp.ps1') *> $null   # no command: loads the functions, prints help

$dir = Join-Path $env:TEMP "mimp-secret-guard-$PID"
New-Item -ItemType Directory -Path $dir -Force | Out-Null

$cases = [ordered]@{
    'GitHub token'        = 'gh' + 'p_' + ('a1' * 18)
    'Meta Graph token'    = 'EA' + 'A' + ('Bc9' * 20)
    'Telegram bot token'  = '123456789' + ':AA' + ('x' * 33)
    'Google API key'      = 'AI' + 'za' + ('Q' * 35)
    'Google OAuth secret' = 'GOCSPX' + '-' + ('k' * 28)
    'AI provider key'     = 'sk' + '-ant-' + ('z' * 40)
    'Stripe live key'     = 's' + 'k_live_' + ('4' * 24)
    'AWS access key'      = 'AK' + 'IA' + ('Z' * 16)
    'Slack token'         = 'xo' + 'xb-' + ('1' * 12)
    'Notion token'        = 'nt' + 'n_' + ('n' * 45)
    'JWT'                 = 'ey' + 'JhbGciOiJIUzI1NiJ9.' + 'ey' + 'JzdWIiOiIxMjM0In0.' + ('s' * 20)
    'Private key'         = '-----BEGIN ' + 'OPENSSH PRIVATE KEY-----'
}

$failed = 0
foreach ($kind in $cases.Keys) {
    $f = Join-Path $dir "$($kind -replace ' ', '-').md"
    Set-Content $f "line one`nvalue: $($cases[$kind])"
    $hits = @(Find-Secrets @($f))
    # exactly one hit, right kind, right line - and the value itself never in the report
    $ok = $hits.Count -eq 1 -and $hits[0] -like "*:2 - $kind" -and $hits[0] -notlike "*$($cases[$kind])*"
    if (-not $ok) { $failed++; Write-Host "FAIL $kind -> $($hits -join ' | ')" -ForegroundColor Red }
}

# Prose about credentials (as memory files really contain) must not trip it.
$prose = Join-Path $dir 'prose.md'
Set-Content $prose @(
    'Page ID, token info, token renewal process',
    'use an sk-proj-xxxxx style key',
    'the EAA token expires every 60 days',
    'AKIA keys rotate quarterly',
    'ghp_ tokens are classic PATs'
)
$hits = @(Find-Secrets @($prose))
if ($hits.Count) { $failed++; Write-Host "FAIL prose false positive -> $($hits -join ' | ')" -ForegroundColor Red }

Remove-Item $dir -Recurse -Force
if ($failed) { Write-Host "secret guard: $failed check(s) failed" -ForegroundColor Red; exit 1 }
Write-Host "secret guard: all $($cases.Count + 1) checks passed" -ForegroundColor Green
