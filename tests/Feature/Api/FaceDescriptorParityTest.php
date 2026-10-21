<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Support\FaceDescriptor;
use App\Support\FaceMatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Kontrak pencocokan descriptor Android (lihat docs/android/face-parity/README.md).
 * Mengubah threshold harus disertai evaluasi dataset dan persetujuan eksplisit; test ini sengaja gagal bila nilainya bergeser.
 */
class FaceDescriptorParityTest extends TestCase
{
    use RefreshDatabase;

    public function test_thresholds_are_pinned(): void
    {
        $this->assertSame(0.45, config('attendance.face.threshold'));
        $this->assertSame(0.45, FaceMatcher::threshold());
        $this->assertSame(128, FaceDescriptor::DIMENSIONS);
    }

    public function test_laravel_distance_matches_face_api_fixtures(): void
    {
        $fixtures = json_decode(file_get_contents(base_path('docs/android/face-parity/fixtures.json')), true);
        $byName = collect($fixtures['recognition'])->keyBy('name');

        foreach ($fixtures['distances'] as $pair) {
            $a = $byName[$pair['a']];
            $b = $byName[$pair['b']];

            $this->assertCount(128, $a['descriptor_raw']);
            $this->assertEqualsWithDelta($pair['euclidean_raw'], FaceDescriptor::minDistance($a['descriptor_raw'], $b['descriptor_raw']), 1e-6);
            $this->assertEqualsWithDelta($pair['euclidean_l2'], FaceDescriptor::minDistance($a['descriptor_raw'], $b['descriptor_raw'], normalize: true), 1e-6);
            // Android boleh mengirim vector yang sudah L2: normalisasi ulang di server tidak mengubah jarak.
            $this->assertEqualsWithDelta($pair['euclidean_l2'], FaceDescriptor::minDistance($a['descriptor_l2'], $b['descriptor_raw'], normalize: true), 1e-6);
        }
    }

    public function test_attendance_uses_unified_threshold_after_l2_normalization(): void
    {
        $this->actingParticipantWithDescriptor($this->vectorAtL2Distance(0, 1.0));

        // Input sengaja tidak ternormalisasi: server menormalisasi kedua sisi sebelum membandingkan.
        // Jarak 0.46 berada di luar ambang terpadu 0.45.
        $this->postJson('/api/v1/attendance', $this->payload($this->vectorAtL2Distance(0.46, 1.3)), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertStatus(400)
            ->assertJsonPath('status', 'face_mismatch');
        $this->assertDatabaseCount('attendances', 0);

        $this->postJson('/api/v1/attendance', $this->payload($this->vectorAtL2Distance(0.45, 1.3)), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertCreated()
            ->assertJsonPath('status', 'success');
    }

    private function vectorAtL2Distance(float $distance, float $scale): array
    {
        // Jarak antar vector satuan bersudut t adalah 2 sin(t/2).
        $angle = 2 * asin($distance / 2);

        return array_pad([cos($angle) * $scale, sin($angle) * $scale], FaceDescriptor::DIMENSIONS, 0.0);
    }

    private function actingParticipantWithDescriptor(array $descriptor): Participant
    {
        $participant = Participant::create([
            'nama' => 'Peserta Paritas',
            'nis_nip' => 'parity-'.Str::random(8),
            'qr_token' => Str::uuid(),
            'face_descriptor' => $descriptor,
            'face_status' => 'approved',
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Sanctum::actingAs($user, ['role:participant']);
        Workcode::create(['nama_workcode' => 'Kegiatan Paritas', 'kategori' => 'workcode', 'is_active' => true]);

        return $participant;
    }

    private function payload(array $descriptor): array
    {
        return [
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'accuracy' => 10,
            'device_timestamp' => now()->toIso8601String(),
            'installation_id' => Str::uuid()->toString(),
            'face_descriptor' => $descriptor,
        ];
    }
}
