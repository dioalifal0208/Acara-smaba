<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\Workcode;
use App\Observers\AttendanceObserver;
use App\Services\FcmService;
use App\Support\AdminDashboardStats;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WorkcodeController extends Controller
{
    /**
     * Tampilkan halaman kelola workcode.
     */
    public function index()
    {
        $workcodes = Workcode::with(['participants:id', 'autoAttendees:id'])->withCount(['attendances', 'participants'])
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Setiap jadwal yang sedang berlangsung dapat aktif bersamaan.
        // Workcode yang sedang aktif ikut membawa Papan Hadir (tepat waktu/terlambat/izin/belum).
        $workcodes->each(function (Workcode $workcode): void {
            $active = $workcode->isEffectivelyActive();
            $workcode->setAttribute('is_effectively_active', $active);
            $workcode->setAttribute('board', $active ? AdminDashboardStats::board($workcode) : null);
        });

        return Inertia::render('Workcodes/Index', [
            'workcodes' => $workcodes,
            'participants' => Participant::orderBy('nama')->get(['id', 'nama', 'nis_nip', 'status']),
            'lateToleranceMinutes' => config('attendance.late_tolerance_minutes', 60),
        ]);
    }

    /**
     * Simpan workcode baru.
     */
    public function store(Request $request, FcmService $fcmService)
    {
        $validated = $request->validate([
            'nama_workcode' => $this->namaWorkcodeRules($request),
            'kategori' => 'required|in:workcode,harian',
            'tanggal' => 'required_if:kategori,workcode|nullable|date',
            'jam_aktif_mulai' => 'required_if:kategori,workcode|nullable|date_format:H:i,H:i:s',
            'jam_aktif_selesai' => 'required_if:kategori,workcode|nullable|date_format:H:i,H:i:s|after:jam_aktif_mulai',
            'hari_aktif' => 'nullable|array',
            'jam_datang_mulai' => 'nullable|date_format:H:i,H:i:s',
            'jam_datang_selesai' => 'nullable|date_format:H:i,H:i:s',
            'jam_pulang_mulai' => 'nullable|date_format:H:i,H:i:s',
            'jam_pulang_selesai' => 'nullable|date_format:H:i,H:i:s',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius_meters' => 'nullable|integer|min:1',
            'set_active' => 'boolean',
            'jadwal_per_hari' => 'nullable|array',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'integer|exists:participants,id',
            'auto_participant_ids' => 'nullable|array',
            'auto_participant_ids.*' => 'integer|exists:participants,id',
        ]);

        $isActivity = $validated['kategori'] === 'workcode';
        $setActive = $isActivity
            ? $this->scheduledWindowIsOpen($validated)
            : ($request->boolean('set_active') || Workcode::count() === 0);

        $isDaily = $validated['kategori'] === 'harian';

        if ($isDaily) {
            $this->ensureDailyScheduleDoesNotOverlap($validated);
        }

        $workcode = Workcode::create([
            'nama_workcode' => $validated['nama_workcode'],
            'kategori' => $validated['kategori'] ?? 'workcode',
            'tanggal' => $isActivity ? $validated['tanggal'] : null,
            'jam_aktif_mulai' => $isActivity ? $validated['jam_aktif_mulai'] : null,
            'jam_aktif_selesai' => $isActivity ? $validated['jam_aktif_selesai'] : null,
            'hari_aktif' => $isDaily ? ($validated['hari_aktif'] ?? null) : null,
            'jam_datang_mulai' => $isDaily ? ($validated['jam_datang_mulai'] ?? null) : null,
            'jam_datang_selesai' => $isDaily ? ($validated['jam_datang_selesai'] ?? null) : null,
            'jam_pulang_mulai' => $isDaily ? ($validated['jam_pulang_mulai'] ?? null) : null,
            'jam_pulang_selesai' => $isDaily ? ($validated['jam_pulang_selesai'] ?? null) : null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'radius_meters' => $validated['radius_meters'] ?? 50,
            'is_active' => $setActive,
            'jadwal_per_hari' => $isDaily ? ($validated['jadwal_per_hari'] ?? null) : null,
        ]);
        $this->syncParticipants($workcode, $validated, $isActivity);

        // Kirim FCM notification ke semua subscriber
        $fcmService->sendWorkcodeUpdate('created', $workcode);

        $message = $setActive
            ? "Workcode '{$workcode->nama_workcode}' berhasil dibuat dan diaktifkan!"
            : "Workcode '{$workcode->nama_workcode}' berhasil dibuat.";

        return redirect()->back()->with('success', $message);
    }

    /**
     * Aktifkan workcode tertentu.
     */
    public function activate(Workcode $workcode, FcmService $fcmService)
    {
        if ($workcode->hasScheduledActiveWindow() && ! $workcode->isWithinActiveWindow()) {
            return redirect()->back()->with(
                'error',
                "Workcode '{$workcode->nama_workcode}' hanya dapat aktif otomatis pada {$workcode->tanggal}, pukul "
                    .substr($workcode->jam_aktif_mulai, 0, 5).'–'.substr($workcode->jam_aktif_selesai, 0, 5).' WIB.'
            );
        }

        $workcode->update(['is_active' => true]);

        // Kirim FCM notification ke semua subscriber
        $fcmService->sendWorkcodeUpdate('activated', $workcode);

        return redirect()->back()->with('success', "Workcode '{$workcode->nama_workcode}' sekarang aktif.");
    }

    /**
     * Nonaktifkan workcode aktif.
     */
    public function deactivate(Workcode $workcode, FcmService $fcmService)
    {
        $workcode->update(['is_active' => false]);

        // Kirim FCM notification ke semua subscriber
        $fcmService->sendWorkcodeUpdate('deactivated', $workcode);

        return redirect()->back()->with('success', "Workcode '{$workcode->nama_workcode}' telah dinonaktifkan.");
    }

    /**
     * Hapus workcode.
     */
    public function destroy(Workcode $workcode, FcmService $fcmService)
    {
        $nama = $workcode->nama_workcode;

        // Kirim FCM notification sebelum delete (masih punya ID)
        $fcmService->sendWorkcodeUpdate('deleted', $workcode);

        // File presensi & dokumen izin terkait dibersihkan oleh event model Workcode.
        $workcode->delete();

        return redirect()->back()->with('success', "Workcode '{$nama}' berhasil dihapus.");
    }

    /**
     * Update workcode.
     */
    public function update(Request $request, Workcode $workcode, FcmService $fcmService)
    {
        $validated = $request->validate([
            'nama_workcode' => $this->namaWorkcodeRules($request),
            'kategori' => 'required|in:workcode,harian',
            'tanggal' => 'required_if:kategori,workcode|nullable|date',
            'jam_aktif_mulai' => 'required_if:kategori,workcode|nullable|date_format:H:i,H:i:s',
            'jam_aktif_selesai' => 'required_if:kategori,workcode|nullable|date_format:H:i,H:i:s|after:jam_aktif_mulai',
            'hari_aktif' => 'nullable|array',
            'jam_datang_mulai' => 'nullable|date_format:H:i,H:i:s',
            'jam_datang_selesai' => 'nullable|date_format:H:i,H:i:s',
            'jam_pulang_mulai' => 'nullable|date_format:H:i,H:i:s',
            'jam_pulang_selesai' => 'nullable|date_format:H:i,H:i:s',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius_meters' => 'nullable|integer|min:1',
            'jadwal_per_hari' => 'nullable|array',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'integer|exists:participants,id',
            'auto_participant_ids' => 'nullable|array',
            'auto_participant_ids.*' => 'integer|exists:participants,id',
        ]);

        $isActivity = $validated['kategori'] === 'workcode';
        $isDaily = $validated['kategori'] === 'harian';
        $shouldActivate = $isActivity && $this->scheduledWindowIsOpen($validated);

        if ($isDaily) {
            $this->ensureDailyScheduleDoesNotOverlap($validated);
        }

        $updates = [
            'nama_workcode' => $validated['nama_workcode'],
            'kategori' => $validated['kategori'] ?? 'workcode',
            'tanggal' => $isActivity ? $validated['tanggal'] : null,
            'jam_aktif_mulai' => $isActivity ? $validated['jam_aktif_mulai'] : null,
            'jam_aktif_selesai' => $isActivity ? $validated['jam_aktif_selesai'] : null,
            'hari_aktif' => $isDaily ? ($validated['hari_aktif'] ?? null) : null,
            'jam_datang_mulai' => $isDaily ? ($validated['jam_datang_mulai'] ?? null) : null,
            'jam_datang_selesai' => $isDaily ? ($validated['jam_datang_selesai'] ?? null) : null,
            'jam_pulang_mulai' => $isDaily ? ($validated['jam_pulang_mulai'] ?? null) : null,
            'jam_pulang_selesai' => $isDaily ? ($validated['jam_pulang_selesai'] ?? null) : null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'radius_meters' => $validated['radius_meters'] ?? 50,
            'jadwal_per_hari' => $isDaily ? ($validated['jadwal_per_hari'] ?? null) : null,
        ];

        if ($isActivity) {
            $updates['is_active'] = $shouldActivate;
        }

        $workcode->update($updates);
        $this->syncParticipants($workcode, $validated, $isActivity);

        // Kirim FCM notification ke semua subscriber
        $fcmService->sendWorkcodeUpdate('updated', $workcode);

        return redirect()->back()->with('success', "Workcode '{$workcode->nama_workcode}' berhasil diperbarui.");
    }

    /**
     * Simpan peserta terpilih dan stakeholder auto presensi (hanya kegiatan sekali), lalu samakan catatan
     * otomatisnya. Admin memilih stakeholder terpisah dari peserta; bila workcode membatasi peserta,
     * stakeholder tetap ikut boleh presensi agar scan mereka bisa menimpa catatan otomatis.
     * Tanpa push FCM per peserta: push 'created'/'updated' workcode sudah memuat ulang aplikasi.
     */
    private function syncParticipants(Workcode $workcode, array $validated, bool $isActivity): void
    {
        $participantIds = $validated['participant_ids'] ?? [];
        $autoIds = $isActivity ? ($validated['auto_participant_ids'] ?? []) : [];

        $workcode->participants()->sync($participantIds === [] ? [] : array_unique([...$participantIds, ...$autoIds]));
        $workcode->autoAttendees()->sync($autoIds);
        AttendanceObserver::withoutStatePush(fn () => $workcode->syncAutoAttendance());
    }

    /**
     * Aturan nama workcode. Menolak nama yang sama dengan username/nama/email akun yang
     * sedang login: itu tanda kolom terisi otomatis oleh pengelola password browser.
     */
    private function namaWorkcodeRules(Request $request): array
    {
        $identities = collect([$request->user()?->username, $request->user()?->name, $request->user()?->email])
            ->filter()
            ->map(fn ($value) => mb_strtolower(trim($value)));

        return [
            'required',
            'string',
            'max:255',
            function (string $attribute, mixed $value, \Closure $fail) use ($identities) {
                if (is_string($value) && $identities->contains(mb_strtolower(trim($value)))) {
                    $fail('Nama workcode tidak boleh sama dengan akun login. Kemungkinan kolom ini terisi otomatis oleh browser; ketik ulang nama kegiatan.');
                }
            },
        ];
    }

    /**
     * Periksa apakah jadwal kegiatan sedang berlangsung pada waktu server.
     */
    private function scheduledWindowIsOpen(array $data): bool
    {
        if (
            ($data['kategori'] ?? null) !== 'workcode'
            || empty($data['tanggal'])
            || empty($data['jam_aktif_mulai'])
            || empty($data['jam_aktif_selesai'])
        ) {
            return false;
        }

        $startsAt = Carbon::parse($data['tanggal'].' '.$data['jam_aktif_mulai']);
        $endsAt = Carbon::parse($data['tanggal'].' '.$data['jam_aktif_selesai']);

        return now()->greaterThanOrEqualTo($startsAt) && now()->lessThan($endsAt);
    }

    /**
     * Tolak jadwal presensi harian yang bentrok: presensi pulang tidak boleh dibuka sebelum presensi
     * datang ditutup (jam datang selesai + toleransi terlambat). Diperiksa per hari aktif memakai
     * jadwal hari itu (jadwal_per_hari), lalu jam bawaan workcode, sama seperti Workcode::scheduleFor.
     */
    private function ensureDailyScheduleDoesNotOverlap(array $data): void
    {
        $dayNames = [1 => 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        $tolerance = config('attendance.late_tolerance_minutes', 60);
        $errors = [];

        foreach (($data['hari_aktif'] ?? null) ?: array_keys($dayNames) as $day) {
            $daySchedule = $data['jadwal_per_hari'][$day] ?? [];
            $time = fn (string $key) => filled($daySchedule[$key] ?? null) ? $daySchedule[$key] : ($data[$key] ?? null);
            $datangSelesai = $time('jam_datang_selesai');
            $pulangMulai = $time('jam_pulang_mulai');

            if (! $datangSelesai || ! $pulangMulai) {
                continue;
            }

            $arrivalClosesAt = Workcode::withLateTolerance(Carbon::today()->setTimeFromTimeString($datangSelesai));

            if (Carbon::today()->setTimeFromTimeString($pulangMulai)->lessThanOrEqualTo($arrivalClosesAt)) {
                $key = filled($daySchedule['jam_pulang_mulai'] ?? null) ? "jadwal_per_hari.{$day}.jam_pulang_mulai" : 'jam_pulang_mulai';
                $errors[$key] = 'Jadwal '.($dayNames[(int) $day] ?? $day).' bentrok: jam pulang mulai harus setelah pukul '
                    .$arrivalClosesAt->format('H:i')." (jam datang selesai + toleransi terlambat {$tolerance} menit).";
            }
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }
}
