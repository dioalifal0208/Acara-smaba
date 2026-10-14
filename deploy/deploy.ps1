[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$CommitMessage = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ConfigFile = Join-Path $PSScriptRoot ".env.deploy"

function Write-Step([string]$Message) {
    Write-Host "`n> $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "  OK: $Message" -ForegroundColor Green
}

function Stop-Deploy([string]$Message) {
    Write-Host "`n  GAGAL: $Message" -ForegroundColor Red
    exit 1
}

function Assert-LastCommand([string]$Message) {
    if ($LASTEXITCODE -ne 0) {
        Stop-Deploy $Message
    }
}

function Read-DeployConfig([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        Stop-Deploy "Konfigurasi tidak ditemukan: $Path"
    }

    $result = @{}
    Get-Content -LiteralPath $Path | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $result[$matches[1].Trim()] = $matches[2].Trim()
        }
    }
    return $result
}

function Get-RequiredConfig($Config, [string]$Name) {
    $value = $Config[$Name]
    if ([string]::IsNullOrWhiteSpace($value)) {
        Stop-Deploy "Nilai $Name belum diisi di $ConfigFile"
    }
    return $value
}

function Assert-SafeValue([string]$Name, [string]$Value, [string]$Pattern) {
    if ($Value -notmatch $Pattern) {
        Stop-Deploy "Nilai $Name mengandung karakter yang tidak diizinkan."
    }
}

function Assert-NoStagedSecrets {
    $stagedFiles = @(git diff --cached --name-only --diff-filter=ACMR)
    Assert-LastCommand "Tidak dapat memeriksa file yang akan di-commit."

    foreach ($file in $stagedFiles) {
        $normalized = $file.Replace('\', '/')
        if ($normalized -match '(^|/)(\.env($|\.)|id_rsa|id_ed25519|.*\.(pem|p12|pfx))$' -and $normalized -notmatch '\.env\.example$') {
            Stop-Deploy "File sensitif terdeteksi dalam commit: $file"
        }
        if ($normalized -match 'firebase-credentials\.json$') {
            Stop-Deploy "Firebase credential tidak boleh masuk commit: $file"
        }
    }

    $addedLines = @(git diff --cached --no-ext-diff --unified=0 | Where-Object { $_ -match '^\+(?!\+\+)' })
    Assert-LastCommand "Tidak dapat memindai perubahan untuk credential."
    $addedText = $addedLines -join "`n"

    if ($addedText -match 'BEGIN [A-Z ]*PRIVATE KEY') {
        Stop-Deploy "Private key terdeteksi pada perubahan Git."
    }
    if ($addedText -match '(?im)^\+?\s*\$?SSH_PASS\s*=\s*["''][^"'']+["'']') {
        Stop-Deploy "Password SSH plaintext terdeteksi pada perubahan Git."
    }
}

$config = Read-DeployConfig $ConfigFile
$SshHost = Get-RequiredConfig $config "SSH_HOST"
$SshPort = Get-RequiredConfig $config "SSH_PORT"
$SshUser = Get-RequiredConfig $config "SSH_USER"
$RemoteDir = Get-RequiredConfig $config "REMOTE_DIR"
$RemotePublicDir = Get-RequiredConfig $config "REMOTE_PUBLIC_DIR"
$GitHubRepo = Get-RequiredConfig $config "GITHUB_REPO"
$PublicUrl = $config["PUBLIC_URL"]
$SshKey = Join-Path $env:USERPROFILE ".ssh\acara_smaba_deploy_ed25519"

Assert-SafeValue "SSH_HOST" $SshHost '^[A-Za-z0-9.-]+$'
Assert-SafeValue "SSH_PORT" $SshPort '^\d+$'
Assert-SafeValue "SSH_USER" $SshUser '^[A-Za-z0-9._-]+$'
Assert-SafeValue "REMOTE_DIR" $RemoteDir '^[A-Za-z0-9._/-]+$'
Assert-SafeValue "REMOTE_PUBLIC_DIR" $RemotePublicDir '^[A-Za-z0-9._/-]+$'
if ($GitHubRepo -notmatch '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\.git$') {
    Stop-Deploy "GITHUB_REPO bukan URL repository GitHub HTTPS yang valid."
}

if (-not (Test-Path -LiteralPath $SshKey)) {
    Stop-Deploy "SSH key belum tersedia: $SshKey"
}

Push-Location $ProjectRoot
try {
    Write-Host "`n=== DEPLOY PRESENSI SMABA ===" -ForegroundColor Magenta

    $branch = (git branch --show-current).Trim()
    Assert-LastCommand "Folder proyek bukan repository Git yang valid."
    if ($branch -ne "main") {
        Stop-Deploy "Deployment hanya diizinkan dari branch main; branch aktif: $branch"
    }

    $sshCommonArguments = @(
        "-i", $SshKey,
        "-o", "BatchMode=yes",
        "-o", "IdentitiesOnly=yes",
        "-o", "StrictHostKeyChecking=accept-new",
        "-p", $SshPort,
        "${SshUser}@${SshHost}"
    )

    Write-Step "Memeriksa autentikasi SSH Hostinger"
    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $sshProbe = & ssh @sshCommonArguments "printf SSH_KEY_OK" 2>&1
        $sshProbeExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorAction
    }
    if ($sshProbeExitCode -ne 0 -or ($sshProbe -join "`n") -notmatch 'SSH_KEY_OK') {
        Stop-Deploy "SSH key belum diotorisasi di Hostinger. GitHub dan server belum diubah."
    }
    Write-Ok "SSH Hostinger siap."

    Write-Step "Menjalankan test Laravel"
    $phpCommand = Get-Command php -ErrorAction SilentlyContinue
    if ($null -eq $phpCommand) {
        $projectDrive = Split-Path -Qualifier $ProjectRoot
        $laragonPhpDirectory = Join-Path $projectDrive "laragon\bin\php"
        $knownPhp = Get-ChildItem -Path $laragonPhpDirectory -Filter "php.exe" -Recurse -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending |
            Select-Object -First 1
        if ($null -eq $knownPhp) {
            Stop-Deploy "PHP tidak ditemukan di PATH."
        }
        $phpExecutable = $knownPhp.FullName
    } else {
        $phpExecutable = $phpCommand.Source
    }
    & $phpExecutable artisan test
    Assert-LastCommand "Test Laravel gagal; deployment dihentikan."
    Write-Ok "Seluruh test Laravel lulus."

    Write-Step "Membangun asset frontend"
    $npmCommand = Get-Command npm -ErrorAction SilentlyContinue
    if ($null -eq $npmCommand) {
        $projectDrive = Split-Path -Qualifier $ProjectRoot
        $laragonNodeDirectory = Join-Path $projectDrive "laragon\bin\nodejs"
        $knownNpm = Get-ChildItem -Path $laragonNodeDirectory -Filter "npm.cmd" -Recurse -ErrorAction SilentlyContinue |
            Sort-Object { $_.FullName.Length } |
            Select-Object -First 1
        if ($null -eq $knownNpm) {
            Stop-Deploy "npm tidak ditemukan di PATH atau instalasi Laragon."
        }
        $npmExecutable = $knownNpm.FullName
    } else {
        $npmExecutable = $npmCommand.Source
    }
    $originalPath = $env:PATH
    try {
        $env:PATH = "$(Split-Path -Parent $npmExecutable);$originalPath"
        & $npmExecutable run build
    } finally {
        $env:PATH = $originalPath
    }
    Assert-LastCommand "Build frontend gagal; deployment dihentikan."
    Write-Ok "Build frontend berhasil."

    Write-Step "Menyiapkan commit Git"
    & git add -A
    Assert-LastCommand "git add gagal."
    Assert-NoStagedSecrets

    $stagedChanges = @(git diff --cached --name-only)
    Assert-LastCommand "Tidak dapat membaca status Git."
    if ($stagedChanges.Count -gt 0) {
        if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
            $CommitMessage = "deploy: update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        & git commit -m $CommitMessage
        Assert-LastCommand "Commit Git gagal."
        Write-Ok "Commit dibuat: $CommitMessage"
    } else {
        Write-Ok "Tidak ada perubahan baru untuk di-commit."
    }

    $origin = (git remote get-url origin).Trim()
    Assert-LastCommand "Remote origin tidak ditemukan."
    if ($origin -ne $GitHubRepo) {
        Stop-Deploy "Remote origin berbeda dari konfigurasi: $origin"
    }

    Write-Step "Mengirim branch main ke GitHub"
    & git push origin main
    Assert-LastCommand "Push GitHub gagal."
    Write-Ok "GitHub berhasil diperbarui."

    Write-Step "Memperbarui aplikasi di Hostinger"
    $remoteCommand = @"
set -eu
APP_DIR="`$HOME/$RemoteDir"
PUBLIC_DIR="`$HOME/$RemotePublicDir"

if [ ! -d "`$APP_DIR/.git" ]; then
    git clone '$GitHubRepo' "`$APP_DIR"
fi

cd "`$APP_DIR"
php artisan down || true
restore_app() { php artisan up >/dev/null 2>&1 || true; }
trap restore_app EXIT

git pull --ff-only origin main
composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
php artisan package:discover --ansi
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
# route:cache dilewati: cache route hasil server rusak (GET / -> 405), route dimuat langsung dari file
php artisan view:cache
chmod -R 775 storage bootstrap/cache

mkdir -p "`$PUBLIC_DIR"
cp -a public/. "`$PUBLIC_DIR/"
sed -i -e 's#/\.\./storage/framework/#/../../presensi-app/storage/framework/#' -e 's#/\.\./vendor/#/../../presensi-app/vendor/#' -e 's#/\.\./bootstrap/#/../../presensi-app/bootstrap/#' `$PUBLIC_DIR/index.php
grep -q presensi-app/vendor/autoload.php `$PUBLIC_DIR/index.php
if [ ! -e "`$PUBLIC_DIR/storage" ]; then
    ln -s "`$APP_DIR/storage/app/public" "`$PUBLIC_DIR/storage"
fi

php artisan up
trap - EXIT
echo DEPLOY_SUCCESS
"@

    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $sshOutput = & ssh @sshCommonArguments $remoteCommand 2>&1
        $sshExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorAction
    }
    $sshOutput | ForEach-Object { Write-Host $_ }
    if ($sshExitCode -ne 0 -or ($sshOutput -join "`n") -notmatch 'DEPLOY_SUCCESS') {
        Stop-Deploy "Deployment Hostinger gagal. Aplikasi akan dicoba diaktifkan kembali oleh server."
    }
    Write-Ok "Hostinger berhasil diperbarui."

    if (-not [string]::IsNullOrWhiteSpace($PublicUrl)) {
        Write-Step "Memeriksa website"
        try {
            $response = Invoke-WebRequest -Uri $PublicUrl -UseBasicParsing -TimeoutSec 30
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
                Write-Ok "Website merespons HTTP $($response.StatusCode): $PublicUrl"
            } else {
                Write-Warning "Website merespons HTTP $($response.StatusCode): $PublicUrl"
            }
        } catch {
            Write-Warning "Deployment selesai, tetapi health check gagal: $($_.Exception.Message)"
        }
    }

    Write-Host "`n=== DEPLOY SELESAI ===`n" -ForegroundColor Green
} finally {
    Pop-Location
}
