<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Riwayat wajah peserta: setiap foto/wajah yang disetujui admin (halaman Data Peserta → Riwayat Wajah).
     * Diisi awal dari pengajuan ganti foto yang sudah disetujui dan wajah aktif yang sudah disetujui.
     * File foto lama yang sudah terhapus sebelum fitur ini ada tetap tercatat, tanpa foto.
     */
    public function up(): void
    {
        Schema::create('face_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained()->cascadeOnDelete();
            $table->string('photo_path')->nullable();
            // registration (pendaftaran wajah disetujui) | photo_change (ganti foto disetujui) | admin (didaftarkan admin)
            $table->string('source', 20);
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['participant_id', 'approved_at']);
        });

        $now = now();
        DB::table('photo_change_requests')->where('status', 'approved')->orderBy('id')
            ->each(function ($request) use ($now) {
                DB::table('face_histories')->insert([
                    'participant_id' => $request->participant_id,
                    'photo_path' => $request->photo_path,
                    'source' => 'photo_change',
                    'approved_by' => $request->reviewed_by,
                    'approved_at' => $request->reviewed_at,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            });

        // Wajah aktif yang disetujui tanpa catatan ganti foto: pendaftaran sebelum riwayat dicatat (waktu tidak diketahui).
        DB::table('participants')->where('face_status', 'approved')->whereNotNull('photo_path')->orderBy('id')
            ->each(function ($participant) use ($now) {
                $recorded = DB::table('face_histories')
                    ->where('participant_id', $participant->id)
                    ->where('photo_path', $participant->photo_path)
                    ->exists();

                if (! $recorded) {
                    DB::table('face_histories')->insert([
                        'participant_id' => $participant->id,
                        'photo_path' => $participant->photo_path,
                        'source' => 'registration',
                        'approved_by' => null,
                        'approved_at' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('face_histories');
    }
};
