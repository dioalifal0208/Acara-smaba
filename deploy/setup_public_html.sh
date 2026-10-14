#!/bin/bash
# Setup public_html untuk staging di Hostinger
# Jalankan setelah composer install dan migrate berhasil

set -e

APP_DIR=~/domains/staging.smanegeri1babatlmg.sch.id/presensi-app
PUB_DIR=~/domains/staging.smanegeri1babatlmg.sch.id/public_html

echo "=== Setup public_html staging ==="

# Hapus isi public_html lama
rm -rf "$PUB_DIR"/*
rm -rf "$PUB_DIR"/.[^.]*  2>/dev/null || true

# Copy semua dari public/ ke public_html/
cp -r "$APP_DIR/public/." "$PUB_DIR/"

# Perbaiki path di index.php agar menunjuk ke presensi-app
sed -i "s|/../vendor|/../../presensi-app/vendor|g" "$PUB_DIR/index.php"
sed -i "s|/../bootstrap|/../../presensi-app/bootstrap|g" "$PUB_DIR/index.php"

# Storage symlink: public_html/storage -> presensi-app/storage/app/public
rm -f "$PUB_DIR/storage"
ln -sfn "$APP_DIR/storage/app/public" "$PUB_DIR/storage"

echo "=== index.php setelah patch ==="
head -5 "$PUB_DIR/index.php"

echo "=== Storage symlink ==="
ls -la "$PUB_DIR/storage"

echo "=== PUBLIC_HTML SETUP DONE ==="
