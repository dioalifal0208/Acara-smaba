<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$response = Http::withOptions(['cookies' => true])->get('http://127.0.0.1:8000/sanctum/csrf-cookie');
$response = Http::withOptions(['cookies' => true])->post('http://127.0.0.1:8000/login', [
    'login' => 'admin@smaba.sch.id',
    'password' => 'password123'
]);

echo 'Status: ' . $response->status() . PHP_EOL;
echo 'Body: ' . substr($response->body(), 0, 500) . PHP_EOL;
