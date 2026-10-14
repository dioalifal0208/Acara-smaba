<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('workcodes', function (Blueprint $table) {
            $table->time('jam_aktif_mulai')->nullable()->after('tanggal');
            $table->time('jam_aktif_selesai')->nullable()->after('jam_aktif_mulai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workcodes', function (Blueprint $table) {
            $table->dropColumn(['jam_aktif_mulai', 'jam_aktif_selesai']);
        });
    }
};
