<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Fitur pengajuan pindah perangkat dihapus: ganti HP sekarang lewat Reset kunci oleh admin. */
    public function up(): void
    {
        Schema::dropIfExists('device_change_requests');
    }

    public function down(): void
    {
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
};
