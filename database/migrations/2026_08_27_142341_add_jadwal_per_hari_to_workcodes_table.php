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
            $table->json('jadwal_per_hari')->nullable()->after('hari_aktif');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workcodes', function (Blueprint $table) {
            $table->dropColumn('jadwal_per_hari');
        });
    }
};
