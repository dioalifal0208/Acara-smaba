# ============================================
# DEPLOY SCRIPT - ACARA SMABA
# Ketik "deploy" di terminal untuk menjalankan
# ============================================

param(
    [string]$CommitMessage = ""
)

# ---- KONFIGURASI ----
$SSH_HOST = "45.90.229.210"
$SSH_PORT = "65002"
$SSH_USER = "u203096280"
$SSH_PASS = "@Sumowiharjo01"
$REMOTE_DIR = "domains/smanegeri1babatlmg.sch.id/presensi-app"
$GITHUB_REPO = "https://github.com/dioalifal0208/Acara-smaba.git"
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

# --- 2. PUSH KE GITHUB ---
Write-Step "Push ke GitHub..."
$commitMsg = $CommitMessage
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMsg = "deploy: update $timestamp"
}

git add -A
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m $commitMsg 2>&1 | Out-Null
    Write-OK "Commit: $commitMsg"
} else {
    Write-OK "Tidak ada perubahan untuk di-commit."
}

# Cek jika remote origin mengarah ke repo lama
git remote set-url origin $GITHUB_REPO 2>&1 | Out-Null

git push origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-OK "Push ke GitHub berhasil."
} else {
    Write-Fail "Push ke GitHub gagal! Pastikan akses repo sudah benar."
    exit 1
}

# --- 3. DEPLOY KE HOSTINGER VIA SSH ---
Write-Step "Deploy ke Hostinger via SSH..."
Write-Host "  (Menghubungi $SSH_HOST port $SSH_PORT...)" -ForegroundColor DarkGray

# Generate SSH command script
$sshCommand = @"
mkdir -p ~/\$REMOTE_DIR && cd ~/\$REMOTE_DIR &&
if [ ! -d .git ]; then git clone https://github.com/dioalifal0208/Acara-smaba.git .; else git pull origin main; fi &&
composer install --no-dev --optimize-autoloader --no-interaction &&
php artisan config:cache &&
php artisan route:cache &&
php artisan view:cache &&
php artisan migrate --force &&
chmod -R 775 storage bootstrap/cache && cp -r public/. ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/ && ln -sfn ~/domains/smanegeri1babatlmg.sch.id/presensi-app/storage/app/public ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/storage && sed -i 's|/../vendor|/../../presensi-app/vendor|g' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php && sed -i 's|/../bootstrap|/../../presensi-app/bootstrap|g' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php &&
echo DEPLOY_SUCCESS
"@

# Tulis command ke temp file
$tmpFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tmpFile -Value $sshCommand -Encoding UTF8

# Gunakan Python jika tersedia (lebih mudah handle password)
$pythonAvailable = Get-Command python -ErrorAction SilentlyContinue

$sshResult = $null

if ($pythonAvailable) {
    $pyScript = @"
import subprocess, sys

result = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'PasswordAuthentication=yes',
     '-o', 'BatchMode=no', '-p', '$SSH_PORT',
     '$SSH_USER@$SSH_HOST',
     'mkdir -p ~/$REMOTE_DIR && cd ~/$REMOTE_DIR && if [ ! -d .git ]; then git clone https://github.com/dioalifal0208/Acara-smaba.git .; else git pull origin main; fi && composer install --no-dev --optimize-autoloader --no-interaction && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate --force && chmod -R 775 storage bootstrap/cache && cp -r public/. ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/ && ln -sfn ~/domains/smanegeri1babatlmg.sch.id/presensi-app/storage/app/public ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/storage && sed -i \'s|/../vendor|/../../presensi-app/vendor|g\' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php && sed -i \'s|/../bootstrap|/../../presensi-app/bootstrap|g\' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php && echo DEPLOY_SUCCESS'],
    capture_output=True, text=True
)
print(result.stdout)
print(result.stderr, file=sys.stderr)
sys.exit(result.returncode)
"@
    $pyFile = [System.IO.Path]::ChangeExtension($tmpFile, ".py")
    Set-Content -Path $pyFile -Value $pyScript
    $sshResult = python $pyFile
}

# Fallback: gunakan Plink jika tersedia (PuTTY CLI)
$plinkAvailable = Get-Command plink -ErrorAction SilentlyContinue
if ($plinkAvailable) {
    Write-Host "  Menggunakan PuTTY Plink..." -ForegroundColor DarkGray
    $sshResult = plink -ssh -P $SSH_PORT -l $SSH_USER -pw $SSH_PASS $SSH_HOST `
        "mkdir -p ~/$REMOTE_DIR && cd ~/$REMOTE_DIR && if [ ! -d .git ]; then git clone https://github.com/dioalifal0208/Acara-smaba.git .; else git pull origin main; fi && composer install --no-dev --optimize-autoloader --no-interaction && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate --force && chmod -R 775 storage bootstrap/cache && cp -r public/. ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/ && ln -sfn ~/domains/smanegeri1babatlmg.sch.id/presensi-app/storage/app/public ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/storage && sed -i 's|/../vendor|/../../presensi-app/vendor|g' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php && sed -i 's|/../bootstrap|/../../presensi-app/bootstrap|g' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php && echo DEPLOY_SUCCESS" 2>&1
} else {
    # Gunakan ssh dengan PasswordAuthentication (membutuhkan input manual)
    Write-Host ""
    Write-Host "  ⚠️  Sistem tidak menemukan Plink (PuTTY)." -ForegroundColor Yellow
    Write-Host "  Masukkan password SSH saat diminta: $SSH_PASS" -ForegroundColor Yellow
    Write-Host ""
    $sshResult = ssh -o StrictHostKeyChecking=no -p $SSH_PORT "${SSH_USER}@${SSH_HOST}" `
        "mkdir -p ~/$REMOTE_DIR && cd ~/$REMOTE_DIR && if [ ! -d .git ]; then git clone https://github.com/dioalifal0208/Acara-smaba.git .; else git pull origin main; fi && composer install --no-dev --optimize-autoloader --no-interaction && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate --force && chmod -R 775 storage bootstrap/cache && cp -r public/. ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/ && ln -sfn ~/domains/smanegeri1babatlmg.sch.id/presensi-app/storage/app/public ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/storage && sed -i 's|/../vendor|/../../presensi-app/vendor|g' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php && sed -i 's|/../bootstrap|/../../presensi-app/bootstrap|g' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php && echo DEPLOY_SUCCESS" 2>&1
}

if ($sshResult -match "DEPLOY_SUCCESS") {
    Write-OK "Hostinger berhasil diperbarui!"
} else {
    Write-Host $sshResult -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  [i]  Jika koneksi SSH membutuhkan input password manual, itu normal." -ForegroundColor Yellow
}

# Cleanup
Remove-Item $tmpFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   ✅ PROSES DEPLOY SELESAI!" -ForegroundColor Green
Write-Host "   🌐 https://presensi.smanegeri1babatlmg.sch.id" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""


