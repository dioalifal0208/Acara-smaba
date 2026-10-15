<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Kreait\Firebase\Contract\Messaging;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Test TIDAK BOLEH mengirim push notification sungguhan. Tanpa ini, test yang membuat/
        // mengaktifkan workcode memakai kredensial Firebase asli di laptop developer dan mengirim
        // pesan ke topic produksi `workcode-updates` (diterima HP peserta). FcmService menangkap
        // error ini dan hanya mencatatnya ke log, persis seperti saat Firebase tidak tersedia.
        $this->app->bind(Messaging::class, function () {
            throw new \RuntimeException('Firebase Messaging dinonaktifkan di lingkungan test.');
        });
    }
}
