<?php

namespace Tests\Feature;

use App\Logging\RedactSensitiveData;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use App\Models\User;
use App\Models\Workcode;
use App\Support\PrivateFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Log\Logger;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Monolog\Handler\TestHandler;
use Monolog\Logger as Monolog;
use Tests\TestCase;

class PrivateFilesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');
        Storage::fake('public');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function participantWithPhoto(): Participant
    {
        Storage::disk('private')->put('faces/1.jpg', 'face-bytes');

        return Participant::create([
            'nama' => 'Peserta',
            'nis_nip' => (string) random_int(1000, 9999),
            'photo_path' => 'faces/1.jpg',
            'face_status' => 'approved',
        ]);
    }

    public function test_private_file_is_only_served_with_a_valid_signature(): void
    {
        $participant = $this->participantWithPhoto();
        $url = PrivateFile::url('participant-photo', $participant);

        $response = $this->get($url)->assertOk();
        $response->assertStreamedContent('face-bytes');
        $this->assertStringContainsString('private', $response->headers->get('Cache-Control'));
        $this->assertSame('nosniff', $response->headers->get('X-Content-Type-Options'));

        // Tanpa tanda tangan, tanda tangan diubah, atau mengganti id peserta: ditolak.
        $this->get(route('files.show', ['type' => 'participant-photo', 'id' => $participant->id]))->assertForbidden();
        $this->get($url.'x')->assertForbidden();
        $other = Participant::create(['nama' => 'Lain', 'nis_nip' => '1', 'photo_path' => 'faces/2.jpg']);
        $this->get(str_replace("/participant-photo/{$participant->id}", "/participant-photo/{$other->id}", $url))->assertForbidden();
    }

    public function test_signed_url_expires(): void
    {
        $url = PrivateFile::url('participant-photo', $this->participantWithPhoto());

        Carbon::setTestNow(now()->addMinutes(PrivateFile::TTL_MINUTES + 1));

        $this->get($url)->assertForbidden();
    }

    public function test_unsafe_stored_path_is_never_served(): void
    {
        $participant = Participant::create(['nama' => 'X', 'nis_nip' => '2', 'photo_path' => '../.env']);

        $this->get(URL::temporarySignedRoute('files.show', now()->addMinute(), ['type' => 'participant-photo', 'id' => $participant->id]))
            ->assertNotFound();
    }

    public function test_storage_fallback_does_not_serve_private_data_or_traversal(): void
    {
        Storage::disk('public')->put('dokumen_izin/surat.pdf', 'pdf');
        Storage::disk('public')->put('faces/1.jpg', 'face');

        $this->get('/storage/dokumen_izin/surat.pdf')->assertNotFound();
        $this->get('/storage/faces/1.jpg')->assertNotFound();
        $this->get('/storage/../.env')->assertNotFound();
        $this->get('/storage/branding/../../.env')->assertNotFound();
    }

    public function test_participant_photo_url_is_not_serialized_by_default(): void
    {
        $participant = $this->participantWithPhoto();
        $participant->update(['face_descriptor' => array_fill(0, 128, 0.1)]);

        $json = $participant->fresh()->toArray();

        $this->assertArrayNotHasKey('photo_url', $json);
        $this->assertArrayNotHasKey('photo_path', $json);
        $this->assertArrayNotHasKey('face_descriptor', $json);
    }

    public function test_uploaded_leave_document_is_stored_privately_and_disguised_scripts_are_rejected(): void
    {
        $participant = Participant::create(['nama' => 'Izin', 'nis_nip' => '3']);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Workcode::create(['nama_workcode' => 'Kegiatan', 'kategori' => 'workcode', 'is_active' => true]);
        Sanctum::actingAs($user, ['role:participant']);

        $payload = fn (UploadedFile $file) => [
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Cuti',
            'tanggal' => now()->addDay()->toDateString(),
            'dokumen' => $file,
        ];

        // File sungguhan di disk agar jenisnya dideteksi dari ISI (finfo), bukan dari nama file
        // seperti UploadedFile::fake().
        $disguised = tempnam(sys_get_temp_dir(), 'upl');
        file_put_contents($disguised, '<?php system($_GET["c"]); ?>');
        $this->postJson('/api/v1/leave-requests', $payload(new UploadedFile($disguised, 'surat.pdf', null, null, true)), [
            'Idempotency-Key' => (string) Str::uuid(),
        ])->assertStatus(422);

        $this->postJson('/api/v1/leave-requests', $payload(UploadedFile::fake()->image('surat.jpg')), [
            'Idempotency-Key' => (string) Str::uuid(),
        ])->assertCreated();

        $path = LeaveRequest::sole()->bukti_path;
        Storage::disk('private')->assertExists($path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_deleting_participant_removes_all_private_files(): void
    {
        $participant = $this->participantWithPhoto();
        $workcode = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian']);
        foreach (['photo-change-requests/c.jpg', 'attendance-face-captures/f.jpg', 'attendance-signatures/s.png', 'dokumen_izin/d.pdf'] as $path) {
            Storage::disk('private')->put($path, 'x');
        }
        PhotoChangeRequest::create(['participant_id' => $participant->id, 'photo_path' => 'photo-change-requests/c.jpg', 'status' => 'pending']);
        Attendance::create([
            'workcode_id' => $workcode->id, 'participant_id' => $participant->id, 'tanggal' => now()->toDateString(),
            'waktu_hadir' => now(), 'face_capture_path' => 'attendance-face-captures/f.jpg', 'signature_path' => 'attendance-signatures/s.png',
        ]);
        LeaveRequest::create([
            'participant_id' => $participant->id, 'workcode_id' => $workcode->id, 'tanggal' => now()->toDateString(),
            'tipe' => 'izin', 'tipe_izin' => 'izin_penuh', 'jenis_izin' => 'cuti', 'keterangan' => 'x', 'alasan' => 'x', 'bukti_path' => 'dokumen_izin/d.pdf',
        ]);

        $participant->delete();

        foreach (['faces/1.jpg', 'photo-change-requests/c.jpg', 'attendance-face-captures/f.jpg', 'attendance-signatures/s.png', 'dokumen_izin/d.pdf'] as $path) {
            Storage::disk('private')->assertMissing($path);
        }
    }

    public function test_migrate_command_moves_legacy_public_files(): void
    {
        Storage::disk('public')->put('faces/old.jpg', 'face');
        Storage::disk('public')->put('dokumen_izin/old.pdf', 'pdf');
        Storage::disk('public')->put('branding/logo.png', 'logo');

        // Simulasi tidak mengubah apa pun.
        $this->artisan('files:migrate-private')->assertSuccessful();
        Storage::disk('public')->assertExists('faces/old.jpg');
        Storage::disk('private')->assertMissing('faces/old.jpg');

        $this->artisan('files:migrate-private', ['--execute' => true])->assertSuccessful();
        Storage::disk('private')->assertExists('faces/old.jpg');
        Storage::disk('private')->assertExists('dokumen_izin/old.pdf');
        Storage::disk('public')->assertMissing('faces/old.jpg');
        Storage::disk('public')->assertMissing('dokumen_izin/old.pdf');
        Storage::disk('public')->assertExists('branding/logo.png'); // file non-sensitif tidak disentuh

        // Idempoten: dijalankan ulang tetap sukses.
        $this->artisan('files:migrate-private', ['--execute' => true])->assertSuccessful();
    }

    public function test_log_redaction_removes_sensitive_values(): void
    {
        $handler = new TestHandler;
        $logger = new Logger(new Monolog('test', [$handler]));
        (new RedactSensitiveData)($logger);

        $logger->info('presensi', [
            'participant_id' => 7,
            'face_descriptor' => [0.12, 0.34],
            'nested' => ['token' => 'secret-token', 'password' => 'p4ss'],
        ]);

        $context = $handler->getRecords()[0]->context;
        $this->assertSame(7, $context['participant_id']);
        $this->assertSame('[REDACTED]', $context['face_descriptor']);
        $this->assertSame('[REDACTED]', $context['nested']['token']);
        $this->assertSame('[REDACTED]', $context['nested']['password']);
    }
}
