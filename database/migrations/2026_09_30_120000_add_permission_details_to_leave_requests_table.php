<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the structured fields for the single "Izin" category. Existing
     * records remain readable because they may have been submitted under the
     * earlier izin/sakit flow.
     */
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->string('tipe_izin', 32)->nullable()->after('tipe');
            $table->string('jenis_izin', 64)->nullable()->after('tipe_izin');
            $table->text('keterangan')->nullable()->after('jenis_izin');
        });
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn(['tipe_izin', 'jenis_izin', 'keterangan']);
        });
    }
};
