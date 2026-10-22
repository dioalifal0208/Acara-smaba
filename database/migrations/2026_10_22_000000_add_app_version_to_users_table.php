<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Versi aplikasi Android terakhir yang dipakai peserta (lihat EnsureSupportedAppVersion). */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('app_version_code')->nullable()->after('device_bound_at');
            $table->string('app_version_name', 30)->nullable()->after('app_version_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['app_version_code', 'app_version_name']);
        });
    }
};
