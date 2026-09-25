<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE attendances MODIFY COLUMN status ENUM('hadir', 'alpha', 'izin', 'sakit', 'lupa_absen', 'libur') DEFAULT 'hadir'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE attendances MODIFY COLUMN status ENUM('hadir', 'alpha', 'izin', 'sakit', 'lupa_absen') DEFAULT 'hadir'");
        }
    }
};
