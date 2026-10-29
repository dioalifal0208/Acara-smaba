<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Arsip workcode: disembunyikan dari daftar utama dan tidak pernah aktif lagi, tetapi data
     * kehadirannya tetap utuh (pengganti hapus untuk kegiatan yang sudah lewat).
     */
    public function up(): void
    {
        Schema::table('workcodes', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('workcodes', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};
