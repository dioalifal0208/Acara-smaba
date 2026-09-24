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
        Schema::create('api_idempotency_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained('participants')->onDelete('cascade');
            $table->string('idempotency_key', 36);
            $table->string('request_hash', 64);
            $table->integer('response_code');
            $table->json('response_payload');
            $table->timestamps();

            // Ensure a participant cannot reuse the same idempotency key for different requests
            $table->unique(['participant_id', 'idempotency_key'], 'idx_participant_idempotency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_idempotency_logs');
    }
};
