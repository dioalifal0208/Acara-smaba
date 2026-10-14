#!/bin/bash
cd ~/domains/staging.smanegeri1babatlmg.sch.id/presensi-app

echo "=== Setting Seeder ==="
php artisan db:seed --class=SettingSeeder --force

echo "=== Create Admin User ==="
php artisan tinker --execute="
\$user = App\Models\User::firstOrCreate(
    ['email' => 'admin@smaba.sch.id'],
    [
        'name' => 'Admin SMABA',
        'password' => bcrypt('password123'),
        'role' => 'admin',
        'email_verified_at' => now(),
    ]
);
echo 'Admin: ' . \$user->email . ' (' . (\$user->wasRecentlyCreated ? 'created' : 'exists') . ')';
"

echo "=== Test DB Connection ==="
php artisan tinker --execute="echo 'Users: ' . App\Models\User::count() . ', Settings: ' . App\Models\Setting::count();"

echo "=== INIT DONE ==="
