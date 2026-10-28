<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tanggal lahir & jenis kelamin untuk ID khusus GTT/PTT pengganti NIP (format NIP:
     * tanggal lahir + TMT 2026 + bulan daftar + kode jenis kelamin + nomor urut). GTT/PTT lama
     * mendapat ID setelah admin melengkapi kedua data ini.
     */
    public function up(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->date('tanggal_lahir')->nullable()->after('status');
            $table->char('jenis_kelamin', 1)->nullable()->after('tanggal_lahir'); // L / P
        });
    }

    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropColumn(['tanggal_lahir', 'jenis_kelamin']);
        });
    }
};
