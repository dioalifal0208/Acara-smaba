#!/bin/bash
cd ~/domains/staging.smanegeri1babatlmg.sch.id/presensi-app

echo "=== Setting Seeder ==="
php artisan db:seed --class=SettingSeeder --force

echo "=== Create Admin User ==="
# Password diminta interaktif; jangan pernah menulis password di file ini.
php artisan user:make-admin admin --name="Admin SMABA"

echo "=== Test DB Connection ==="
php artisan tinker --execute="echo 'Users: ' . App\Models\User::count() . ', Settings: ' . App\Models\Setting::count();"

echo "=== INIT DONE ==="
