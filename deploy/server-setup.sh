#!/bin/bash
# ===========================================
# SCRIPT SETUP AWAL (Jalankan SEKALI SAJA)
# ===========================================
set -e
PROJECT_DIR="$HOME/public_html/acara"
REPO_URL="https://github.com/dioalifal0208/Acara-smaba.git"

echo "[1/5] Clone repository..."
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "  Sudah ada, skip."
else
    git clone "$REPO_URL" "$PROJECT_DIR"
fi

cd $PROJECT_DIR

echo "[2/5] Install PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "[3/5] Setup .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "  PENTING: Edit .env dan isi konfigurasi database!"
fi

echo "[4/5] Generate APP_KEY..."
php artisan key:generate --force

echo "[5/5] Set permissions..."
chmod -R 775 storage bootstrap/cache

echo ""
echo "✅ Setup selesai! Jangan lupa edit .env dan jalankan:"
echo "   php artisan migrate --force"
echo "   php artisan storage:link"
