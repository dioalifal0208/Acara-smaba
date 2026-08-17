<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = \App\Models\User::where('role', 'participant')->get();
$count = 0;
foreach ($users as $user) {
    if (!$user->participant_id) {
        $p = \App\Models\Participant::where('nis_nip', $user->username)->first();
        if ($p) {
            $user->participant_id = $p->id;
            $user->save();
            $count++;
        }
    }
}
echo "Fixed $count users.";
