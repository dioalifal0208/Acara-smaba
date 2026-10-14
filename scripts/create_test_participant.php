<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Buat participant
$participant = App\Models\Participant::create([
    'nama' => 'Peserta Test',
    'nis_nip' => '12345',
    'status_kepegawaian' => 'pns',
]);
echo "Participant dibuat: ID {$participant->id}\n";

// Link ke user
$updated = App\Models\User::where('email', 'peserta@smaba.sch.id')
    ->update(['participant_id' => $participant->id]);
echo "User diperbarui: {$updated} baris\n";

// Verifikasi
$user = App\Models\User::where('email', 'peserta@smaba.sch.id')->first();
echo "User participant_id: {$user->participant_id}\n";
echo "Role: {$user->role}\n";
