<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// __DIR__ = /home/u203096280/domains/smanegeri1babatlmg.sch.id/public_html/staging
// ../../../../../ = /home/u203096280/
// Jadi path ke app: ../../../../../domains/staging.smanegeri1babatlmg.sch.id/presensi-app

if (file_exists($maintenancePath = __DIR__.'/../../../../../domains/staging.smanegeri1babatlmg.sch.id/presensi-app/storage/framework/maintenance.php')) {
    require $maintenancePath;
}

require __DIR__.'/../../../../../domains/staging.smanegeri1babatlmg.sch.id/presensi-app/vendor/autoload.php';

$app = require_once __DIR__.'/../../../../../domains/staging.smanegeri1babatlmg.sch.id/presensi-app/bootstrap/app.php';

$app->handleRequest(Request::capture());
