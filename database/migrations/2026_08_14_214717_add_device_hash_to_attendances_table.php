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
        Schema::table('attendances', function (Blueprint $table) {
            $table->string('device_hash', 64)->nullable()->after('waktu_hadir');
            $table->string('ip_address', 45)->nullable()->after('device_hash');

            // Index untuk pencarian cepat per event + device
            $table->index(['event_id', 'device_hash'], 'idx_attendances_event_device');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_attendances_event_device');
            $table->dropColumn(['device_hash', 'ip_address']);
        });
    }
};
