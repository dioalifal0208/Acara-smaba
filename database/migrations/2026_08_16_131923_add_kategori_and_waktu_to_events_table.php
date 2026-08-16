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
        Schema::table('events', function (Blueprint $table) {
            $table->enum('kategori', ['acara', 'harian'])->default('acara')->after('deskripsi');
            $table->json('hari_aktif')->nullable()->after('kategori');
            $table->time('jam_datang_mulai')->nullable()->after('hari_aktif');
            $table->time('jam_datang_selesai')->nullable()->after('jam_datang_mulai');
            $table->time('jam_pulang_mulai')->nullable()->after('jam_datang_selesai');
            $table->time('jam_pulang_selesai')->nullable()->after('jam_pulang_mulai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'kategori',
                'hari_aktif',
                'jam_datang_mulai',
                'jam_datang_selesai',
                'jam_pulang_mulai',
                'jam_pulang_selesai',
            ]);
        });
    }
};
