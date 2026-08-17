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
            $table->enum('status', ['hadir', 'alpha', 'izin', 'sakit', 'lupa_absen'])->default('hadir')->after('waktu_pulang');
            $table->foreignId('leave_request_id')->nullable()->constrained()->onDelete('set null')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['leave_request_id']);
            $table->dropColumn('leave_request_id');
            $table->dropColumn('status');
        });
    }
};
