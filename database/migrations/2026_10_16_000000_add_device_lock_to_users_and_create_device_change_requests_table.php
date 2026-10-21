<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kunci perangkat Android per akun peserta + pengajuan pindah perangkat yang disetujui admin.
     * ID perangkat (ANDROID_ID) hanya disimpan sebagai HMAC, bukan nilai aslinya.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('device_id_hash', 64)->nullable()->after('fcm_token');
            $table->string('device_model', 100)->nullable()->after('device_id_hash');
            $table->timestamp('device_bound_at')->nullable()->after('device_model');
        });

        Schema::create('device_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_id_hash', 64);
            $table->string('device_model', 100)->nullable();
            $table->string('previous_device_model', 100)->nullable();
            $table->string('reason', 500);
            $table->string('status', 20)->default('pending')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('rejection_reason', 500)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_change_requests');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['device_id_hash', 'device_model', 'device_bound_at']);
        });
    }
};
