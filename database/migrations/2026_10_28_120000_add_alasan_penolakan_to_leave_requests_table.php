<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            // Alasan admin saat menolak pengajuan; ditampilkan ke peserta di riwayat izin.
            $table->string('alasan_penolakan', 500)->nullable()->after('status_approval');
        });
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn('alasan_penolakan');
        });
    }
};
