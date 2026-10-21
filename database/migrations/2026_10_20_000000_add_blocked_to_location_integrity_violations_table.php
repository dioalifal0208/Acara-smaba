<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catatan fake GPS juga memuat temuan yang tidak menolak presensi (mis. Opsi Pengembang aktif):
     * blocked=false berarti presensi tetap diterima, hanya dicatat untuk admin.
     */
    public function up(): void
    {
        Schema::table('location_integrity_violations', function (Blueprint $table) {
            $table->boolean('blocked')->default(true)->after('signals')->index();
        });
    }

    public function down(): void
    {
        Schema::table('location_integrity_violations', function (Blueprint $table) {
            $table->dropIndex(['blocked']);
            $table->dropColumn('blocked');
        });
    }
};
