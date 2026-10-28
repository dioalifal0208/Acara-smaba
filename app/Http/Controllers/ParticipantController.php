<?php

namespace App\Http\Controllers;

use App\Models\FaceHistory;
use App\Models\Participant;
use App\Models\User;
use App\Services\QrCodeService;
use App\Support\PrivateFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\StringValueBinder;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ParticipantController extends Controller
{
    private const EMPLOYMENT_STATUSES = ['PNS', 'PPPK', 'PPPK Paruh Waktu', 'GTT', 'PTT'];

    private const NON_PERMANENT_STATUSES = Participant::NON_PERMANENT_STATUSES;

    /**
     * Tampilkan daftar peserta.
     */
    public function index()
    {
        $participants = Participant::withCount('attendances')
            ->with(['photoChangeRequests' => fn ($query) => $query->where('status', 'pending')->latest()])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Participant $participant) => $this->participantPayload($participant));

        return Inertia::render('Participants/Index', [
            'participants' => $participants,
        ]);
    }

    /**
     * Halaman detail peserta: edit data, QR, wajah, verifikasi, riwayat wajah, dan hapus.
     */
    public function show(Participant $participant)
    {
        $participant->loadCount('attendances')
            ->load(['photoChangeRequests' => fn ($query) => $query->where('status', 'pending')->latest()]);
        $account = User::where('participant_id', $participant->id)->first(['id', 'username', 'device_model', 'app_version_name']);

        return Inertia::render('Participants/Show', [
            'participant' => $this->participantPayload($participant) + [
                'attendances_count' => $participant->attendances_count,
                'account' => $account ? [
                    'username' => $account->username,
                    'device_model' => $account->device_model,
                    'app_version_name' => $account->app_version_name,
                ] : null,
            ],
        ]);
    }

    /** Data peserta untuk halaman admin; butuh attendances_count dan photoChangeRequests pending. */
    private function participantPayload(Participant $participant): array
    {
        $pendingPhotoChangeRequest = $participant->photoChangeRequests->first();

        return [
            'id' => $participant->id,
            'nama' => $participant->nama,
            'nis_nip' => $participant->nis_nip ?? '-',
            'status' => $participant->status,
            // Bahan ID khusus GTT/PTT (lihat Participant::staffIdPrefix).
            'tanggal_lahir' => $participant->tanggal_lahir?->toDateString(),
            'jenis_kelamin' => $participant->jenis_kelamin,
            'qr_token' => $participant->qr_token,
            'has_face' => $participant->face_descriptor !== null,
            'face_status' => $participant->face_status,
            'photo_url' => $participant->photo_url,
            'pending_photo_change_request' => $pendingPhotoChangeRequest ? [
                'id' => $pendingPhotoChangeRequest->id,
                'photo_url' => PrivateFile::url('photo-change-request', $pendingPhotoChangeRequest),
                'created_at' => $pendingPhotoChangeRequest->created_at->toIso8601String(),
            ] : null,
            'has_attended' => $participant->attendances_count > 0,
            'created_at' => $participant->created_at->format('d M Y H:i'),
        ];
    }

    /**
     * Bersihkan NIP dari tanda petik awal dan format desimal (.00).
     */
    private function cleanNisNip($val): string
    {
        if (empty($val)) {
            return '';
        }
        $val = trim((string) $val);
        // Hapus tanda petik tunggal/ganda di awal (contoh: '1980... atau "1980...)
        $val = preg_replace('/^[\'"]+/', '', $val);
        // Hapus desimal .00 / .0 di akhir jika terbaca sebagai float oleh Excel
        if (preg_match('/^(\d+)\.0+$/', $val, $m)) {
            $val = $m[1];
        }

        return trim($val);
    }

    /**
     * Normalisasi status kepegawaian standar.
     */
    private function normalizeStatus($status): ?string
    {
        if (empty($status)) {
            return null;
        }
        $norm = strtolower(preg_replace('/\s+/', ' ', trim($status)));
        if ($norm === 'pns') {
            return 'PNS';
        }
        if ($norm === 'pppk') {
            return 'PPPK';
        }
        if ($norm === 'gtt') {
            return 'GTT';
        }
        if ($norm === 'ptt') {
            return 'PTT';
        }
        if ($norm === 'pppk paruh waktu' || str_contains($norm, 'paruh waktu')) {
            return 'PPPK Paruh Waktu';
        }

        return trim($status);
    }

    private function isNonPermanentStatus(?string $status): bool
    {
        return in_array($status, self::NON_PERMANENT_STATUSES, true);
    }

    /** Aturan tanggal lahir & jenis kelamin: wajib untuk GTT/PTT (bahan ID khusus pengganti NIP). */
    private function birthDataRules(bool $nonPermanent): array
    {
        return [
            'tanggal_lahir' => [Rule::requiredIf($nonPermanent), 'nullable', 'date', 'before:today', 'after:1940-01-01'],
            'jenis_kelamin' => [Rule::requiredIf($nonPermanent), 'nullable', Rule::in(array_keys(Participant::GENDER_CODES))],
        ];
    }

    private const BIRTH_DATA_MESSAGES = [
        'tanggal_lahir.required' => 'Tanggal lahir wajib diisi untuk GTT/PTT (dipakai untuk ID pengganti NIP).',
        'jenis_kelamin.required' => 'Jenis kelamin wajib diisi untuk GTT/PTT (dipakai untuk ID pengganti NIP).',
    ];

    /** Kolom impor: tanggal lahir (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, atau angka tanggal Excel). */
    private function parseBirthDate(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        try {
            if (is_numeric($value) && (int) $value > 0 && (int) $value < 100000) {
                return Carbon::instance(ExcelDate::excelToDateTimeObject((float) $value))->toDateString();
            }

            foreach (['!Y-m-d', '!d/m/Y', '!j/n/Y', '!d-m-Y', '!j-n-Y', '!d.m.Y', '!Ymd'] as $format) {
                $date = \DateTime::createFromFormat($format, $value);
                if ($date && $date->format(ltrim($format, '!')) === $value) {
                    return $date->format('Y-m-d');
                }
            }
        } catch (\Throwable $e) {
            return null;
        }

        return null;
    }

    /** Kolom impor: jenis kelamin (L/P, 1/2, Laki-laki/Perempuan, Pria/Wanita). */
    private function parseGender(mixed $value): ?string
    {
        $value = strtolower(trim((string) $value));

        return match (true) {
            in_array($value, ['l', '1', 'laki-laki', 'laki laki', 'lakilaki', 'pria'], true) => 'L',
            in_array($value, ['p', '2', 'perempuan', 'wanita'], true) => 'P',
            default => null,
        };
    }

    /** Cari kolom tanggal lahir & jenis kelamin dari header impor. */
    private function birthColumnKeys(array $headers): array
    {
        $birthKey = null;
        $genderKey = null;

        foreach ($headers as $colKey => $headerVal) {
            if (in_array($headerVal, ['tanggal lahir', 'tanggal_lahir', 'tgl lahir', 'tgl. lahir', 'tgl_lahir', 'lahir'], true)) {
                $birthKey = $colKey;
            }
            if (in_array($headerVal, ['jenis kelamin', 'jenis_kelamin', 'jk', 'l/p', 'gender', 'kelamin'], true)) {
                $genderKey = $colKey;
            }
        }

        return [$birthKey, $genderKey];
    }

    /** @return array{tanggal_lahir: ?string, jenis_kelamin: ?string} */
    private function birthDataFromRow(array $row, ?string $birthKey, ?string $genderKey): array
    {
        return [
            'tanggal_lahir' => $birthKey ? $this->parseBirthDate($row[$birthKey] ?? null) : null,
            'jenis_kelamin' => $genderKey ? $this->parseGender($row[$genderKey] ?? null) : null,
        ];
    }

    /** Data lahir dari payload impor (clean_data / konflik) yang dikirim balik oleh browser. */
    private function birthDataFromItem(array $item): array
    {
        return [
            'tanggal_lahir' => $this->parseBirthDate($item['tanggal_lahir'] ?? null),
            'jenis_kelamin' => $this->parseGender($item['jenis_kelamin'] ?? null),
        ];
    }

    private function normalizeNisNipForStatus($nisNip, ?string $status): ?string
    {
        if ($this->isNonPermanentStatus($status)) {
            return null;
        }

        return $this->cleanNisNip($nisNip);
    }

    private function deleteParticipantUser(Participant $participant, ?string $fallbackUsername = null): void
    {
        $username = $fallbackUsername ?? $participant->nis_nip;

        User::where('role', 'participant')
            ->where(function ($query) use ($participant, $username) {
                $query->where('participant_id', $participant->id);

                if (! empty($username) && $username !== '-') {
                    $query->orWhere('username', $username);
                }
            })
            ->delete();
    }

    private function syncParticipantUser(Participant $participant, ?string $oldNip = null): void
    {
        if (empty($participant->nis_nip)) {
            // GTT/PTT yang ID pengganti NIP-nya belum bisa dibuat (data lahir belum lengkap, mis. lewat
            // impor): akun yang sudah ada dibiarkan (kunci HP, riwayat) sampai ID terbentuk.
            if (Participant::isNonPermanent($participant->status)) {
                return;
            }

            $this->deleteParticipantUser($participant, $oldNip);

            return;
        }

        $user = User::where('participant_id', $participant->id)->first();

        if (! $user && ! empty($oldNip)) {
            $user = User::where('role', 'participant')
                ->where('username', $oldNip)
                ->first();
        }

        $user ??= new User;

        if (! $user->exists) {
            $user->password = Hash::make($participant->nis_nip);
        }

        $user->name = $participant->nama;
        $user->username = $participant->nis_nip;
        $user->role = 'participant';
        $user->participant_id = $participant->id;
        $user->save();
    }

    /**
     * Simpan peserta baru — QR token otomatis di-generate via Model boot().
     */
    public function store(Request $request)
    {
        $cleanNama = trim((string) $request->input('nama'));
        $cleanStatus = $this->normalizeStatus($request->input('status'));
        $cleanNip = $this->normalizeNisNipForStatus($request->input('nis_nip'), $cleanStatus);
        $nipIsRequired = ! $this->isNonPermanentStatus($cleanStatus);

        $request->merge([
            'nama' => $cleanNama,
            'nis_nip' => $cleanNip,
            'status' => $cleanStatus,
        ]);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nis_nip' => [Rule::requiredIf($nipIsRequired), 'nullable', 'string', 'max:50', Rule::unique('participants', 'nis_nip')],
            'status' => ['nullable', Rule::in(self::EMPLOYMENT_STATUSES)],
            ...$this->birthDataRules(! $nipIsRequired),
        ], [
            'nis_nip.required' => 'NIP wajib diisi untuk status pegawai ini.',
            'nis_nip.unique' => 'NIP sudah terdaftar pada sistem.',
            ...self::BIRTH_DATA_MESSAGES,
        ]);

        // Cek apakah nama sudah terdaftar (case-insensitive & spasi seragam)
        $existingByName = Participant::whereRaw('LOWER(TRIM(nama)) = ?', [strtolower($cleanNama)])->first();
        if ($existingByName) {
            return back()->withErrors([
                'nama' => "Nama \"{$cleanNama}\" sudah terdaftar pada sistem (NIP: {$existingByName->nis_nip}).",
            ])->withInput();
        }

        // QR token di-generate otomatis oleh Participant model boot()
        $participant = Participant::create($validated);

        $this->syncParticipantUser($participant);

        $message = Participant::isNonPermanent($participant->status)
            ? "Peserta berhasil ditambahkan dengan ID {$participant->nis_nip} (pengganti NIP). Akun peserta (username & password: ID tersebut) siap digunakan."
            : 'Peserta berhasil ditambahkan! Akun peserta (username & password: NIP) siap digunakan.';

        return redirect()->route('participants.index')
            ->with('success', $message);
    }

    /**
     * Update data peserta.
     */
    public function update(Request $request, Participant $participant)
    {
        $cleanNama = trim((string) $request->input('nama'));
        $cleanStatus = $this->normalizeStatus($request->input('status'));
        $cleanNip = $this->normalizeNisNipForStatus($request->input('nis_nip'), $cleanStatus);
        $nipIsRequired = ! $this->isNonPermanentStatus($cleanStatus);

        $request->merge([
            'nama' => $cleanNama,
            'nis_nip' => $cleanNip,
            'status' => $cleanStatus,
        ]);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nis_nip' => [
                Rule::requiredIf($nipIsRequired), 'nullable', 'string', 'max:50', Rule::unique('participants', 'nis_nip')->ignore($participant),
                // GTT/PTT → pegawai tetap: isian NIP tidak boleh masih ID khusus lama.
                function (string $attribute, mixed $value, \Closure $fail) use ($participant, $nipIsRequired) {
                    if ($nipIsRequired && $this->isNonPermanentStatus($participant->status) && filled($value) && $value === $participant->nis_nip) {
                        $fail('Isi NIP asli untuk pegawai tetap. ID ini khusus GTT/PTT.');
                    }
                },
            ],
            'status' => ['nullable', Rule::in(self::EMPLOYMENT_STATUSES)],
            ...$this->birthDataRules(! $nipIsRequired),
        ], [
            'nis_nip.required' => 'NIP wajib diisi untuk status pegawai ini.',
            'nis_nip.unique' => 'NIP sudah digunakan oleh peserta lain.',
            ...self::BIRTH_DATA_MESSAGES,
        ]);

        // Cek nama sama pada peserta lain
        $existingByName = Participant::whereRaw('LOWER(TRIM(nama)) = ?', [strtolower($cleanNama)])
            ->where('id', '!=', $participant->id)
            ->first();

        if ($existingByName) {
            return back()->withErrors([
                'nama' => "Nama \"{$cleanNama}\" sudah digunakan oleh peserta lain (NIP: {$existingByName->nis_nip}).",
            ])->withInput();
        }

        $oldNip = $participant->nis_nip;
        $participant->update($validated);

        $this->syncParticipantUser($participant, $oldNip);

        return redirect()->route('participants.show', $participant)
            ->with('success', 'Data peserta berhasil diperbarui!');
    }

    /** Riwayat wajah yang disetujui admin (modal Riwayat Wajah di Data Peserta). */
    public function faceHistory(Participant $participant): JsonResponse
    {
        $history = $participant->faceHistories()->with('approver:id,name')->get();

        return response()->json([
            'participant' => ['id' => $participant->id, 'nama' => $participant->nama, 'nis_nip' => $participant->nis_nip],
            'items' => $history->map(fn (FaceHistory $item) => $item->toAdminArray($participant->photo_path))->values(),
        ]);
    }

    /**
     * Hapus peserta tunggal.
     */
    public function destroy(Participant $participant)
    {
        if ($participant->photo_path && Storage::disk('private')->exists($participant->photo_path)) {
            Storage::disk('private')->delete($participant->photo_path);
        }

        $this->deleteParticipantUser($participant);

        $participant->delete();

        return redirect()->route('participants.index')
            ->with('success', 'Peserta berhasil dihapus!');
    }

    /**
     * Hapus peserta secara massal (Bulk Delete).
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:participants,id',
        ]);

        $ids = $request->input('ids');
        $participants = Participant::whereIn('id', $ids)->get();

        $count = 0;
        foreach ($participants as $participant) {
            if ($participant->photo_path && Storage::disk('private')->exists($participant->photo_path)) {
                Storage::disk('private')->delete($participant->photo_path);
            }

            $this->deleteParticipantUser($participant);

            $participant->delete();
            $count++;
        }

        return redirect()->route('participants.index')
            ->with('success', "{$count} peserta berhasil dihapus!");
    }

    /**
     * QR pribadi berisi token presensi: hanya admin atau peserta pemiliknya yang boleh melihat.
     */
    private function authorizeQrAccess(Participant $participant): void
    {
        $user = auth()->user();

        abort_unless($user && ($user->role === 'admin' || (int) $user->participant_id === $participant->id), 403);
    }

    /**
     * Admin mengganti password akun login peserta: reset ke NIS/NIP (password awal) atau password baru.
     * Tidak ada reset mandiri lewat email, jadi ini satu-satunya jalan bila peserta lupa password.
     * Opsional: cabut semua sesi (token aplikasi Android dan sesi web) agar login ulang dengan password baru.
     */
    public function updatePassword(Request $request, Participant $participant)
    {
        $validated = $request->validate([
            'mode' => ['required', Rule::in(['reset', 'custom'])],
            'password' => ['exclude_unless:mode,custom', 'required', 'confirmed', Password::defaults()],
            'logout_sessions' => ['boolean'],
        ]);

        $user = User::where('participant_id', $participant->id)->where('role', 'participant')->first();

        if (! $user) {
            return back()->with('error', "{$participant->nama} tidak memiliki akun login.");
        }

        $user->forceFill([
            'password' => Hash::make($validated['mode'] === 'reset' ? $participant->nis_nip : $validated['password']),
            'remember_token' => Str::random(60),
        ])->save();

        $logout = $request->boolean('logout_sessions');
        if ($logout) {
            // Aplikasi Android menerima 401 pada request berikutnya dan kembali ke layar login.
            $user->tokens()->delete();
            DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
        }

        // Password tidak pernah dicatat ke log.
        Log::info('Password peserta diganti admin.', [
            'user_id' => $user->id,
            'admin_id' => auth()->id(),
            'mode' => $validated['mode'],
            'logout_sessions' => $logout,
        ]);

        $message = $validated['mode'] === 'reset'
            ? "Password {$participant->nama} direset ke NIS/NIP."
            : "Password {$participant->nama} berhasil diganti.";

        return back()->with('success', $logout ? "{$message} Semua sesi login dikeluarkan." : $message);
    }

    /**
     * Ganti token QR peserta (mis. bila QR diduga bocor). QR lama langsung tidak berlaku di scanner.
     */
    public function regenerateQrToken(Participant $participant)
    {
        $participant->forceFill(['qr_token' => Str::uuid()->toString()])->save();

        return redirect()->back()->with('success', "QR {$participant->nama} berhasil direset. QR lama tidak berlaku lagi.");
    }

    /**
     * Generate & tampilkan QR code SVG untuk peserta (inline view).
     */
    public function qrCode(Participant $participant, QrCodeService $qrCodeService)
    {
        $this->authorizeQrAccess($participant);

        $svg = $qrCodeService->generate($participant->qr_token, 400);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    /**
     * Download QR code sebagai SVG file (dengan label nama).
     */
    public function downloadSvg(Participant $participant, QrCodeService $qrCodeService)
    {
        $this->authorizeQrAccess($participant);

        $svg = $qrCodeService->generateWithLabel(
            $participant->qr_token,
            $participant->nama,
            $participant->nis_nip,
            400
        );

        $filename = 'QR_'.Str::slug($participant->nama).'_'.$participant->nis_nip.'.svg';

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /**
     * Download QR code sebagai PNG file.
     * Fallback ke SVG jika Imagick tidak tersedia.
     */
    public function downloadPng(Participant $participant, QrCodeService $qrCodeService)
    {
        $this->authorizeQrAccess($participant);

        $png = $qrCodeService->generatePng($participant->qr_token, 400);

        if ($png) {
            $filename = 'QR_'.Str::slug($participant->nama).'_'.$participant->nis_nip.'.png';

            return response($png, 200, [
                'Content-Type' => 'image/png',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ]);
        }

        // Fallback ke SVG download jika PNG tidak bisa di-generate
        return $this->downloadSvg($participant, $qrCodeService);
    }

    /**
     * Preview impor peserta: memeriksa nama & NIP duplikat serta format NIP.
     */
    public function importPreview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        try {
            $spreadsheet = $this->loadSpreadsheetAsStrings($filePath);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true);

            if (empty($rows)) {
                return response()->json(['error' => 'File Excel/CSV kosong.'], 422);
            }

            $firstRow = array_shift($rows);
            $headers = array_map(function ($h) {
                return strtolower(trim($h ?? ''));
            }, $firstRow);

            $namaColKey = null;
            $nisNipColKey = null;
            $statusColKey = null;

            foreach ($headers as $colKey => $headerVal) {
                if (in_array($headerVal, ['nama', 'name', 'nama lengkap', 'nama_lengkap'])) {
                    $namaColKey = $colKey;
                }
                if (in_array($headerVal, ['nis/nip', 'nis', 'nip', 'nis_nip', 'nomor induk', 'no induk', 'nip/nis'])) {
                    $nisNipColKey = $colKey;
                }
                if (in_array($headerVal, ['keterangan', 'ket', 'status', 'role', 'jabatan'])) {
                    $statusColKey = $colKey;
                }
            }

            if (! $namaColKey) {
                $namaColKey = 'A';
            }
            if (! $nisNipColKey) {
                $nisNipColKey = 'B';
            }
            if (! $statusColKey) {
                $statusColKey = 'C';
            }
            [$birthColKey, $genderColKey] = $this->birthColumnKeys($headers);

            $conflicts = [];
            $cleanData = [];
            $seenInExcelNip = [];
            $seenInExcelName = [];
            $rowIndex = 1;

            foreach ($rows as $row) {
                $rowIndex++;
                $rawNama = trim((string) ($row[$namaColKey] ?? ''));
                $rawNip = trim((string) ($row[$nisNipColKey] ?? ''));
                $rawStatus = isset($row[$statusColKey]) ? trim((string) $row[$statusColKey]) : null;
                $cleanStatus = $this->normalizeStatus($rawStatus);

                if (empty($rawNama) || (empty($rawNip) && ! $this->isNonPermanentStatus($cleanStatus))) {
                    continue;
                }

                $cleanNip = $this->normalizeNisNipForStatus($rawNip, $cleanStatus);
                $cleanNama = $rawNama;
                $birthData = $this->birthDataFromRow($row, $birthColKey, $genderColKey);

                $normNameLower = strtolower(preg_replace('/\s+/', ' ', $cleanNama));

                // Cek database
                $existingByNip = $cleanNip
                    ? Participant::where('nis_nip', $cleanNip)->first()
                    : null;
                $existingByName = Participant::whereRaw('LOWER(TRIM(nama)) = ?', [$normNameLower])->first();

                // Cek duplikasi di dalam file excel itu sendiri
                $duplicateInFile = ($cleanNip && isset($seenInExcelNip[$cleanNip])) || isset($seenInExcelName[$normNameLower]);

                if ($existingByNip || $existingByName) {
                    $target = $existingByNip ?? $existingByName;
                    $reason = '';
                    if ($existingByNip && $existingByName && $existingByNip->id === $existingByName->id) {
                        $reason = 'Nama & NIP sudah terdaftar';
                    } elseif ($existingByName) {
                        $reason = "Nama sudah terdaftar (NIP di DB: {$existingByName->nis_nip})";
                    } else {
                        $reason = "NIP sudah terdaftar (Nama di DB: {$existingByNip->nama})";
                    }

                    $conflicts[] = [
                        'row_index' => $rowIndex,
                        'existing' => [
                            'id' => $target->id,
                            'nama' => $target->nama,
                            'nis_nip' => $target->nis_nip ?? '-',
                            'status' => $target->status ?? '-',
                        ],
                        'new' => [
                            'nama' => $cleanNama,
                            'nis_nip' => $cleanNip ?? '-',
                            'status' => $cleanStatus ?? '-',
                            ...$birthData,
                        ],
                        'conflict_reason' => $reason,
                        'default_resolution' => 'update',
                    ];
                } elseif ($duplicateInFile) {
                    $conflicts[] = [
                        'row_index' => $rowIndex,
                        'existing' => [
                            'id' => null,
                            'nama' => $seenInExcelName[$normNameLower]['nama'] ?? $cleanNama,
                            'nis_nip' => $cleanNip ? ($seenInExcelNip[$cleanNip]['nis_nip'] ?? $cleanNip) : '-',
                            'status' => $cleanNip ? ($seenInExcelNip[$cleanNip]['status'] ?? '-') : ($seenInExcelName[$normNameLower]['status'] ?? '-'),
                        ],
                        'new' => [
                            'nama' => $cleanNama,
                            'nis_nip' => $cleanNip ?? '-',
                            'status' => $cleanStatus ?? '-',
                            ...$birthData,
                        ],
                        'conflict_reason' => 'Duplikat di baris lain dalam file Excel',
                        'default_resolution' => 'skip',
                    ];
                } else {
                    $cleanData[] = [
                        'nama' => $cleanNama,
                        'nis_nip' => $cleanNip,
                        'status' => $cleanStatus,
                        ...$birthData,
                    ];
                    if ($cleanNip) {
                        $seenInExcelNip[$cleanNip] = ['nama' => $cleanNama, 'nis_nip' => $cleanNip, 'status' => $cleanStatus];
                    }
                    $seenInExcelName[$normNameLower] = ['nama' => $cleanNama, 'nis_nip' => $cleanNip, 'status' => $cleanStatus];
                }
            }

            // Jika tidak ada konflik, langsung simpan
            if (empty($conflicts)) {
                $savedCount = 0;
                foreach ($cleanData as $item) {
                    $p = Participant::create($item);
                    $this->syncParticipantUser($p);
                    $savedCount++;
                }

                return response()->json([
                    'status' => 'success',
                    'has_conflicts' => false,
                    'message' => "{$savedCount} data peserta berhasil diimpor.",
                ]);
            }

            return response()->json([
                'status' => 'conflict',
                'has_conflicts' => true,
                'conflicts' => $conflicts,
                'clean_data' => $cleanData,
                'total_rows' => count($cleanData) + count($conflicts),
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal memproses file Excel: '.$e->getMessage()], 422);
        }
    }

    /**
     * Konfirmasi impor setelah user memilih update/skip pada data konflik.
     */
    public function importConfirm(Request $request)
    {
        $cleanData = $request->input('clean_data', []);
        $resolvedConflicts = $request->input('resolved_conflicts', []);

        $newCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        // 1. Simpan clean data
        foreach ($cleanData as $item) {
            $cleanStatus = ($item['status'] ?? null) === '-'
                ? null
                : $this->normalizeStatus($item['status'] ?? null);
            $cleanNip = $this->normalizeNisNipForStatus($item['nis_nip'] ?? null, $cleanStatus);
            $p = Participant::create([
                'nama' => $item['nama'],
                'nis_nip' => $cleanNip,
                'status' => $cleanStatus,
                ...$this->birthDataFromItem($item),
            ]);
            $this->syncParticipantUser($p);
            $newCount++;
        }

        // 2. Proses resolved conflicts
        foreach ($resolvedConflicts as $item) {
            $resolution = $item['resolution'] ?? 'skip';
            $existingId = $item['existing']['id'] ?? null;
            $newData = $item['new'];

            if ($resolution === 'update') {
                $cleanStatus = ($newData['status'] ?? null) === '-'
                    ? null
                    : $this->normalizeStatus($newData['status'] ?? null);
                $cleanNip = $this->normalizeNisNipForStatus($newData['nis_nip'] ?? null, $cleanStatus);

                if ($existingId) {
                    $participant = Participant::find($existingId);
                    if ($participant) {
                        $oldNip = $participant->nis_nip;
                        $participant->update([
                            'nama' => $newData['nama'],
                            'nis_nip' => $cleanNip,
                            'status' => $cleanStatus,
                            // Kolom lahir kosong di Excel tidak menghapus data yang sudah ada.
                            ...array_filter($this->birthDataFromItem($newData)),
                        ]);

                        $this->syncParticipantUser($participant, $oldNip);

                        $updatedCount++;
                    }
                } else {
                    $lookup = $cleanNip
                        ? ['nis_nip' => $cleanNip]
                        : ['nama' => $newData['nama']];
                    $p = Participant::updateOrCreate($lookup, [
                        'nama' => $newData['nama'],
                        'nis_nip' => $cleanNip,
                        'status' => $cleanStatus,
                        ...array_filter($this->birthDataFromItem($newData)),
                    ]);
                    $this->syncParticipantUser($p);
                    $updatedCount++;
                }
            } else {
                $skippedCount++;
            }
        }

        $summary = "Impor selesai! {$newCount} data baru ditambahkan";
        if ($updatedCount > 0) {
            $summary .= ", {$updatedCount} data diperbarui";
        }
        if ($skippedCount > 0) {
            $summary .= ", {$skippedCount} data dilewati";
        }
        $summary .= '.';

        return redirect()->route('participants.index')->with('success', $summary);
    }

    /**
     * Import peserta secara massal via Excel/CSV (Direct fallback).
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120', // Max 5MB
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        try {
            $spreadsheet = $this->loadSpreadsheetAsStrings($filePath);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true); // Dapatkan baris ber-key kolom A, B, C...

            if (empty($rows)) {
                return redirect()->back()->with('error', 'File Excel/CSV kosong.');
            }

            // Dapatkan header dari baris pertama
            $firstRow = array_shift($rows);
            $headers = array_map(function ($h) {
                return strtolower(trim($h ?? ''));
            }, $firstRow);

            // Cari index kolom untuk Nama, NIS/NIP, dan Keterangan
            $namaColKey = null;
            $nisNipColKey = null;
            $statusColKey = null;

            foreach ($headers as $colKey => $headerVal) {
                if (in_array($headerVal, ['nama', 'name', 'nama lengkap', 'nama_lengkap'])) {
                    $namaColKey = $colKey;
                }
                if (in_array($headerVal, ['nis/nip', 'nis', 'nip', 'nis_nip', 'nomor induk', 'no induk', 'nip/nis'])) {
                    $nisNipColKey = $colKey;
                }
                if (in_array($headerVal, ['keterangan', 'ket', 'status', 'role', 'jabatan'])) {
                    $statusColKey = $colKey;
                }
            }

            // Fallback default jika header tidak terdeteksi
            if (! $namaColKey) {
                $namaColKey = 'A';
            }
            if (! $nisNipColKey) {
                $nisNipColKey = 'B';
            }
            if (! $statusColKey) {
                $statusColKey = 'C';
            }
            [$birthColKey, $genderColKey] = $this->birthColumnKeys($headers);

            $successCount = 0;

            foreach ($rows as $row) {
                $rawNama = trim((string) ($row[$namaColKey] ?? ''));
                $rawNip = trim((string) ($row[$nisNipColKey] ?? ''));
                $rawStatus = isset($row[$statusColKey]) ? trim((string) $row[$statusColKey]) : null;
                $cleanStatus = $this->normalizeStatus($rawStatus);

                if (empty($rawNama) || (empty($rawNip) && ! $this->isNonPermanentStatus($cleanStatus))) {
                    continue; // Lewati baris kosong
                }

                $cleanNip = $this->normalizeNisNipForStatus($rawNip, $cleanStatus);
                $cleanNama = $rawNama;

                // Update data jika NIP/NIS sudah terdaftar, atau buat baru jika belum
                $lookup = $cleanNip
                    ? ['nis_nip' => $cleanNip]
                    : ['nama' => $cleanNama];
                $participant = Participant::updateOrCreate(
                    $lookup,
                    [
                        'nama' => $cleanNama,
                        'nis_nip' => $cleanNip,
                        'status' => $cleanStatus,
                        ...array_filter($this->birthDataFromRow($row, $birthColKey, $genderColKey)),
                    ]
                );

                $this->syncParticipantUser($participant);

                $successCount++;
            }

            return redirect()->route('participants.index')
                ->with('success', $successCount.' data peserta berhasil diproses (diimpor/diperbarui).');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses file Excel: '.$e->getMessage());
        }
    }

    /**
     * Download format / template file Excel untuk acuan impor peserta.
     */
    /**
     * Baca file impor dengan StringValueBinder agar angka panjang (seperti NIP) tidak diubah menjadi
     * float dan kehilangan presisi. Binder PhpSpreadsheet bersifat global (static), jadi dikembalikan
     * setelah membaca; kalau tidak, penulisan spreadsheet berikutnya di proses yang sama (mis. ekspor
     * laporan, queue worker, test) ikut menyimpan angka sebagai teks.
     */
    private function loadSpreadsheetAsStrings(string $filePath): Spreadsheet
    {
        $previousBinder = Cell::getValueBinder();
        Cell::setValueBinder(new StringValueBinder);

        try {
            return IOFactory::load($filePath);
        } finally {
            Cell::setValueBinder($previousBinder);
        }
    }

    public function downloadTemplate()
    {
        try {
            if (class_exists('PhpOffice\PhpSpreadsheet\Spreadsheet')) {
                $spreadsheet = new Spreadsheet;
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->setTitle('Data Peserta');

                // Header kolom terpisah: Kolom A = Nama, Kolom B = NIP, Kolom C = Keterangan
                $sheet->setCellValue('A1', 'Nama');
                $sheet->setCellValue('B1', 'NIP');
                $sheet->setCellValue('C1', 'Status');
                // Wajib untuk GTT/PTT: bahan ID pengganti NIP (format NIP, tahun TMT 2026).
                $sheet->setCellValue('D1', 'Tanggal Lahir');
                $sheet->setCellValue('E1', 'Jenis Kelamin');
                $sheet->getStyle('D:D')->getNumberFormat()->setFormatCode('@');

                // Format kolom B (NIP) sebagai Text agar angka panjang tidak terpotong
                $sheet->getStyle('B:B')->getNumberFormat()->setFormatCode('@');

                // Contoh baris data terpisah per kolom
                $sheet->setCellValueExplicit('A2', 'Drs. H. Ahmad Fauzi, M.Pd', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('B2', '197503122000031002', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('C2', 'PNS', DataType::TYPE_STRING);

                $sheet->setCellValueExplicit('A3', 'Siti Nurhaliza, S.Pd', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('B3', '198504152010012004', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('C3', 'PPPK', DataType::TYPE_STRING);

                $sheet->setCellValueExplicit('A4', 'Bambang Sudarsono, S.T', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('B4', '198207182008011007', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('C4', 'PPPK Paruh Waktu', DataType::TYPE_STRING);

                $sheet->setCellValueExplicit('A5', 'Contoh Guru Tidak Tetap, S.Pd', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('B5', '-', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('C5', 'GTT', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('D5', '1995-04-12', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('E5', 'L', DataType::TYPE_STRING);

                $sheet->setCellValueExplicit('A6', 'Contoh Pegawai Tidak Tetap', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('B6', '-', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('C6', 'PTT', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('D6', '1998-11-03', DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('E6', 'P', DataType::TYPE_STRING);

                // Styling header
                $headerStyle = [
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '4F46E5'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],
                ];
                $sheet->getStyle('A1:E1')->applyFromArray($headerStyle);
                $sheet->getColumnDimension('A')->setWidth(32);
                $sheet->getColumnDimension('B')->setWidth(26);
                $sheet->getColumnDimension('C')->setWidth(26);
                $sheet->getColumnDimension('D')->setWidth(18);
                $sheet->getColumnDimension('E')->setWidth(16);

                $writer = new Xlsx($spreadsheet);
                $filename = 'template_import_peserta.xlsx';

                return response()->streamDownload(function () use ($writer) {
                    $writer->save('php://output');
                }, $filename, [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Cache-Control' => 'max-age=0',
                ]);
            }
        } catch (\Throwable $e) {
            // Fallback
        }

        // Native CSV Fallback with UTF-8 BOM
        $csvFilename = 'template_import_peserta.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel
            fputcsv($handle, ['Nama', 'NIP', 'Status', 'Tanggal Lahir', 'Jenis Kelamin']);
            fputcsv($handle, ['Drs. H. Ahmad Fauzi, M.Pd', '197503122000031002', 'PNS', '', '']);
            fputcsv($handle, ['Siti Nurhaliza, S.Pd', '198504152010012004', 'PPPK', '', '']);
            fputcsv($handle, ['Bambang Sudarsono, S.T', '198207182008011007', 'PPPK Paruh Waktu', '', '']);
            fputcsv($handle, ['Contoh Guru Tidak Tetap, S.Pd', '-', 'GTT', '1995-04-12', 'L']);
            fputcsv($handle, ['Contoh Pegawai Tidak Tetap', '-', 'PTT', '1998-11-03', 'P']);
            fclose($handle);
        }, $csvFilename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
