<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Hanya domain aplikasi sendiri. Aplikasi Android tidak memakai CORS (bukan browser).
    // Tambahan origin bisa lewat CORS_ALLOWED_ORIGINS (dipisah koma).
    'allowed_origins' => array_values(array_filter(array_merge(
        [rtrim((string) parse_url((string) env('APP_URL'), PHP_URL_SCHEME).'://'.parse_url((string) env('APP_URL'), PHP_URL_HOST), ':/')],
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
