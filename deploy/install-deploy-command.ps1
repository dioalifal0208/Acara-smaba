[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$deployScript = (Resolve-Path (Join-Path $PSScriptRoot "deploy.ps1")).Path
$commandDirectory = (Resolve-Path (Join-Path $PSScriptRoot "bin")).Path
$sshDirectory = Join-Path $env:USERPROFILE ".ssh"
$sshKey = Join-Path $sshDirectory "acara_smaba_deploy_ed25519"
$profilePath = $PROFILE

if (-not (Test-Path -LiteralPath $sshDirectory)) {
    New-Item -ItemType Directory -Path $sshDirectory -Force | Out-Null
}

if (-not (Test-Path -LiteralPath $sshKey)) {
    & ssh-keygen -q -t ed25519 -C "acara-smaba-deploy" -f $sshKey -N '""'
    if ($LASTEXITCODE -ne 0) {
        throw "Gagal membuat SSH key."
    }
}

# Remove the older profile-based command, if this installer created it.
# A .cmd command on PATH also works when PowerShell script execution is disabled.
$startMarker = "# >>> acara-smaba deploy >>>"
$endMarker = "# <<< acara-smaba deploy <<<"
if (Test-Path -LiteralPath $profilePath) {
    $profileContent = Get-Content -Raw -LiteralPath $profilePath
    $markerPattern = "(?s)" + [regex]::Escape($startMarker) + ".*?" + [regex]::Escape($endMarker)
    $profileContent = [regex]::Replace($profileContent, $markerPattern, "").TrimEnd()
    if ([string]::IsNullOrWhiteSpace($profileContent)) {
        Remove-Item -LiteralPath $profilePath -Force
    } else {
        Set-Content -LiteralPath $profilePath -Value ($profileContent + "`r`n") -Encoding UTF8
    }
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$pathEntries = @($userPath -split ';' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
if ($pathEntries -notcontains $commandDirectory) {
    $newUserPath = (($pathEntries + $commandDirectory) -join ';')
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
}

Write-Host "Perintah deploy dipasang melalui PATH: $commandDirectory" -ForegroundColor Green
Write-Host "Buka terminal baru setelah instalasi agar perintah tersedia." -ForegroundColor Yellow
Write-Host "SSH public key:" -ForegroundColor Cyan
Get-Content -LiteralPath "$sshKey.pub"
