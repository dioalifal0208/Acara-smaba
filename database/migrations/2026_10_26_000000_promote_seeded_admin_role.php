<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * User::isAdmin() kini hanya membaca role. Akun admin bawaan (seeder) yang dulu dianggap admin
     * karena emailnya tetap admin, asalkan username-nya juga `admin`: username peserta adalah NIS/NIP,
     * jadi peserta yang mengganti emailnya menjadi email admin tidak ikut dinaikkan.
     */
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'admin@smaba.sch.id')
            ->where('username', 'admin')
            ->where('role', '!=', 'admin')
            ->update(['role' => 'admin']);
    }

    public function down(): void
    {
        // Tidak dikembalikan: menurunkan role bisa mengunci admin dari panel.
    }
};
