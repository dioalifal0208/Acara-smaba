# ============================================
# DEPLOY SCRIPT - ACARA SMABA
# ============================================
#
# KONFIGURASI:
# Buat file deploy/.env.deploy (TIDAK di-commit) dengan isi:
#   SSH_HOST=xxx.xxx.xxx.xxx
#   SSH_PORT=65002
#   SSH_USER=username
#   REMOTE_DIR=domains/smanegeri1babatlmg.sch.id/presensi-app
#   GITHUB_REPO=https://github.com/dioalifal0208/Acara-smaba.git
#
# Autentikasi SSH menggunakan SSH key (bukan password).
# Langkah setup:
#   1. ssh-keygen -t ed25519 -C "deploy@smaba"
#   2. ssh-copy-id -p 65002 username@host
#   3. Pastikan login tanpa password berhasil sebelum deploy.
#
# Jalankan: .\deploy\deploy.ps1
# ============================================

param(
    [string]$CommitMessage = ""
)

# ---- BACA KONFIGURASI DARI FILE ----
$envFile = Join-Path $PSScriptRoot ".env.deploy"
if (-Not (Test-Path $envFile)) {
    Write-Host ""
    Write-Host "  ❌ File konfigurasi tidak ditemukan: $envFile" -ForegroundColor Red
    Write-Host "  Buat file deploy/.env.deploy dengan variabel SSH_HOST, SSH_PORT, SSH_USER, REMOTE_DIR, GITHUB_REPO." -ForegroundColor Yellow
    Write-Host "  Lihat komentar di awal script ini untuk contoh." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

$config = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $config[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$SSH_HOST   = $config['SSH_HOST']
$SSH_PORT   = $config['SSH_PORT']
$SSH_USER   = $config['SSH_USER']
$REMOTE_DIR = $config['REMOTE_DIR']
$GITHUB_REPO = $config['GITHUB_REPO']

if (-Not $SSH_HOST -or -Not $SSH_USER -or -Not $REMOTE_DIR) {
    Write-Host "  ❌ Konfigurasi tidak lengkap. Pastikan SSH_HOST, SSH_USER, REMOTE_DIR terisi di .env.deploy" -ForegroundColor Red
    exit 1
}

# ---------------------

function Write-Step { param($msg) Write-Host "`n  ▶ $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "  ❌ $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   🚀 DEPLOY PRESENSI SMABA" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

# --- 1. BUILD ASSETS ---
Write-Step "Build assets (Vite)..."
try {
    npm run build | Out-Null
    Write-OK "Build berhasil."
} catch {
    Write-Fail "Build gagal! Periksa error di atas."
    exit 1
}

# --- 2. GIT OPERATIONS ---
Write-Step "Mempersiapkan Git..."
$commitMsg = $CommitMessage
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMsg = "deploy: update $timestamp"
}

# JANGAN gunakan git add -A. Stage file secara selektif.
Write-Host "  ⚠️  Pastikan Anda sudah 'git add' file yang akan di-deploy." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "  Ada perubahan belum di-stage. Gunakan 'git add <file>' sebelum deploy." -ForegroundColor Yellow
    Write-Host "  Atau jalankan deploy dengan parameter: -CommitMessage 'pesan commit'" -ForegroundColor Yellow
}

git remote set-url origin $GITHUB_REPO 2>&1 | Out-Null

git push origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-OK "Push ke GitHub berhasil."
} else {
    Write-Fail "Push ke GitHub gagal! Pastikan akses repo sudah benar."
    exit 1
}

# --- 3. DEPLOY KE SERVER VIA SSH (KEY-BASED AUTH) ---
Write-Step "Deploy ke server via SSH..."
Write-Host "  (Menghubungi $SSH_HOST port $SSH_PORT...)" -ForegroundColor DarkGray

$remoteCmd = @"
cd ~/$REMOTE_DIR &&
git pull origin main &&
composer install --no-dev --optimize-autoloader --no-interaction &&
php artisan config:cache &&
php artisan route:cache &&
php artisan view:cache &&
php artisan migrate --force &&
chmod -R 775 storage bootstrap/cache &&
echo DEPLOY_SUCCESS
"@

$sshResult = ssh -o StrictHostKeyChecking=no -p $SSH_PORT "${SSH_USER}@${SSH_HOST}" $remoteCmd 2>&1

if ($sshResult -match "DEPLOY_SUCCESS") {
    Write-OK "Server berhasil diperbarui!"
} else {
    Write-Host $sshResult -ForegroundColor Yellow
    Write-Fail "Deploy mungkin tidak berhasil. Periksa output di atas."
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   ✅ PROSES DEPLOY SELESAI!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""
