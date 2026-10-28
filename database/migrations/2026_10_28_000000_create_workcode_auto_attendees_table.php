<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stakeholder yang otomatis tercatat hadir saat kegiatan dimulai (lihat Workcode::syncAutoAttendance).
        Schema::create('workcode_auto_attendees', function (Blueprint $table) {
            $table->foreignId('workcode_id')->constrained()->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['workcode_id', 'participant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workcode_auto_attendees');
    }
};
