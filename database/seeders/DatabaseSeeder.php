<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Buat akun Admin
        User::factory()->create([
            'name' => 'Administrator SMABA',
            'email' => 'admin@smaba.sch.id',
            'password' => bcrypt('password123'),
        ]);

        // Buat data Peserta (Guru SMABA) untuk pencarian QR
        \App\Models\Participant::create([
            'nama' => 'Drs. H. Mulyono, M.Pd.',
            'nis_nip' => '196803121994031005',
        ]);

        \App\Models\Participant::create([
            'nama' => 'Sri Wahyuni, S.Pd.',
            'nis_nip' => '197508242005012008',
        ]);

        \App\Models\Participant::create([
            'nama' => 'Budi Santoso, S.Kom.',
            'nis_nip' => '198811052015041003',
        ]);
    }
}
