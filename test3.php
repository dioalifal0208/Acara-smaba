<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$p = \App\Models\Participant::whereNotNull('face_descriptor')->get();
foreach ($p as $participant) {
    echo "ID: " . $participant->id . " Name: " . $participant->nama . "\n";
    $desc = $participant->face_descriptor;
    echo "Is array: " . (is_array($desc) ? 'yes' : 'no') . "\n";
    echo "Count: " . count($desc) . "\n";
}
