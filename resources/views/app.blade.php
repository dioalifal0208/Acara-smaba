<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'E-Presensi SMABA') }}</title>

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', 'E-Presensi SMABA') }}">
        <meta property="og:description" content="Sistem Presensi Cerdas & Terintegrasi SMA Negeri 1 Babat. Pantau statistik kehadiran acara secara langsung dengan Face Recognition.">
        <meta property="og:image" content="{{ asset('images/og-banner.png') }}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="{{ config('app.name', 'E-Presensi SMABA') }}">
        <meta property="twitter:description" content="Sistem Presensi Cerdas & Terintegrasi SMA Negeri 1 Babat. Pantau statistik kehadiran acara secara langsung dengan Face Recognition.">
        <meta property="twitter:image" content="{{ asset('images/og-banner.png') }}">
        <!-- Favicon / Logo Sekolah -->
        <link rel="icon" type="image/png" href="/images/logo.png">
        <link rel="shortcut icon" type="image/png" href="/images/logo.png">
        <link rel="apple-touch-icon" href="/images/logo.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
