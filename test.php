<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = \App\Models\Participant::whereNotNull('face_descriptor')->first();
if ($p) {
    echo "Type: " . gettype($p->face_descriptor) . "\n";
    $desc = $p->face_descriptor;
    echo "Keys: " . implode(',', array_slice(array_keys($desc), 0, 5)) . "\n";
    
    $sum = 0;
    for ($i=0; $i<128; $i++) {
        $v = isset($desc[$i]) ? $desc[$i] : 0;
        $sum += pow(0.5 - $v, 2);
    }
    echo "Dummy distance: " . sqrt($sum) . "\n";
} else {
    echo "No face\n";
}
