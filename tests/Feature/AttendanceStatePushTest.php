<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Services\FcmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AttendanceStatePushTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_qr_scan_attendance_triggers_participant_state_sync(): void
    {
        $participant = Participant::create([
            'nama' => 'Peserta Push',
            'nis_nip' => 'push-'.Str::random(8),
            'qr_token' => Str::uuid(),
        ]);
        Workcode::create(['nama_workcode' => 'Workcode Push', 'kategori' => 'workcode', 'is_active' => true]);

        $fcm = $this->mock(FcmService::class);
        $fcm->shouldReceive('sendStateChanged')->once()->withArgs(function ($target, $reason) use ($participant): bool {
            return $target instanceof Participant && $target->is($participant) && $reason === 'attendance';
        });

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->postJson(route('scan'), ['qr_token' => $participant->qr_token])
            ->assertOk()
            ->assertJsonPath('status', 'success');
    }
}
