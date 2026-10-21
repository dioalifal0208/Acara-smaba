<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catatan percobaan presensi Android yang ditolak karena indikasi lokasi palsu
     * (mock location, aplikasi fake GPS, root/hooking). Dipantau admin di halaman Perangkat.
     */
    public function up(): void
    {
        Schema::create('location_integrity_violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('participant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('workcode_id')->nullable()->constrained()->nullOnDelete();
            $table->json('reasons');
            $table->json('signals')->nullable();
            $table->string('device_model', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_integrity_violations');
    }
};
