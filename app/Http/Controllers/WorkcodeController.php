<?php

namespace App\Http\Controllers;

use App\Models\Workcode;
use App\Services\FcmService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WorkcodeController extends Controller
{
    /**
     * Tampilkan halaman kelola workcode.
     */
    public function index()
    {
        $workcodes = Workcode::withCount('attendances')
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Workcodes/Index', [
            'workcodes' => $workcodes,
        ]);
    }

    /**
     * Simpan workcode baru.
     */
    public function store(Request $request, FcmService $fcmService)
    {
        $validated = $request->validate([
            'nama_workcode' => $this->namaWorkcodeRules($request),
            'deskripsi' => 'nullable|string|max:1000',
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
        ]);

        $isActivity = $validated['kategori'] === 'workcode';
        $setActive = $isActivity
            ? $this->scheduledWindowIsOpen($validated)
            : ($request->boolean('set_active') || Workcode::count() === 0);

        if ($setActive) {
            Workcode::query()->update(['is_active' => false]);
        }

        $isDaily = $validated['kategori'] === 'harian';

        $workcode = Workcode::create([
            'nama_workcode' => $validated['nama_workcode'],
            'deskripsi' => $validated['deskripsi'] ?? null,
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

        Workcode::query()->update(['is_active' => false]);
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
        $signaturePaths = $workcode->attendances()
            ->whereNotNull('signature_path')
            ->pluck('signature_path')
            ->all();

        // Kirim FCM notification sebelum delete (masih punya ID)
        $fcmService->sendWorkcodeUpdate('deleted', $workcode);

        $workcode->delete();
        Storage::disk('public')->delete($signaturePaths);

        return redirect()->back()->with('success', "Workcode '{$nama}' berhasil dihapus.");
    }

    /**
     * Update workcode.
     */
    public function update(Request $request, Workcode $workcode, FcmService $fcmService)
    {
        $validated = $request->validate([
            'nama_workcode' => $this->namaWorkcodeRules($request),
            'deskripsi' => 'nullable|string|max:1000',
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
        ]);

        $isActivity = $validated['kategori'] === 'workcode';
        $isDaily = $validated['kategori'] === 'harian';
        $shouldActivate = $isActivity && $this->scheduledWindowIsOpen($validated);

        if ($shouldActivate) {
            Workcode::where('id', '!=', $workcode->getKey())->update(['is_active' => false]);
        }

        $updates = [
            'nama_workcode' => $validated['nama_workcode'],
            'deskripsi' => $validated['deskripsi'] ?? null,
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

        // Kirim FCM notification ke semua subscriber
        $fcmService->sendWorkcodeUpdate('updated', $workcode);

        return redirect()->back()->with('success', "Workcode '{$workcode->nama_workcode}' berhasil diperbarui.");
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
}
