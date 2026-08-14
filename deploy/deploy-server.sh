#!/bin/bash
# ===========================================
# SCRIPT DEPLOY DI SERVER (dipanggil dari PC via SSH)
# ===========================================
set -e
PROJECT_DIR="$HOME/public_html/acara"
cd $PROJECT_DIR

echo ">>> [1/4] Pull dari GitHub..."
git pull origin main

echo ">>> [2/4] Install Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo ">>> [3/4] Jalankan Artisan commands..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

echo ">>> [4/4] Set permissions..."
chmod -R 775 storage bootstrap/cache

echo ""
echo "✅ DEPLOY SELESAI! Website sudah diperbarui."
