<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // APK Android yang diunggah otomatis oleh deploy (php artisan apk:publish).
        Schema::create('app_releases', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('version_code')->unique();
            $table->string('version_name', 30);
            $table->string('file_name');
            $table->unsignedBigInteger('size_bytes');
            $table->char('sha256', 64);
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamp('published_at');
            $table->timestamps();
        });

        // Link Google Drive lama digantikan unduhan APK dari server sendiri.
        DB::table('settings')->where('key', 'android_apk_url')->delete();
    }

    public function down(): void
    {
        Schema::dropIfExists('app_releases');
    }
};
