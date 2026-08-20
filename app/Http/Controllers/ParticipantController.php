<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ParticipantController extends Controller
{
    /**
     * Tampilkan daftar peserta.
     */
    public function index()
    {
        $participants = Participant::withCount('attendances')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($participant) {
                return [
                    'id' => $participant->id,
                    'nama' => $participant->nama,
                    'nis_nip' => $participant->nis_nip,
                    'status' => $participant->status,
                    'qr_token' => $participant->qr_token,
                    'has_face' => $participant->face_descriptor !== null,
                    'face_status' => $participant->face_status,
                    'photo_url' => $participant->photo_path ? asset('storage/' . $participant->photo_path) : null,
                    'has_attended' => $participant->attendances_count > 0,
                    'created_at' => $participant->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('Participants/Index', [
            'participants' => $participants,
        ]);
    }

    /**
     * Bersihkan NIP dari tanda petik awal dan format desimal (.00).
     */
    private function cleanNisNip($val): string
    {
        if (empty($val)) return '';
        $val = trim((string)$val);
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
        if (empty($status)) return null;
        $norm = strtolower(preg_replace('/\s+/', ' ', trim($status)));
        if ($norm === 'pns') return 'PNS';
        if ($norm === 'pppk') return 'PPPK';
        if ($norm === 'pppk paruh waktu' || str_contains($norm, 'paruh waktu')) return 'PPPK Paruh Waktu';
        return trim($status);
    }

    /**
     * Simpan peserta baru — QR token otomatis di-generate via Model boot().
     */
    public function store(Request $request)
    {
        $cleanNip = $this->cleanNisNip($request->input('nis_nip'));
        $cleanNama = trim((string)$request->input('nama'));
        $cleanStatus = $this->normalizeStatus($request->input('status'));

        $request->merge([
            'nama' => $cleanNama,
            'nis_nip' => $cleanNip,
            'status' => $cleanStatus,
        ]);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nis_nip' => 'required|string|max:50|unique:participants,nis_nip',
            'status' => 'nullable|in:PNS,PPPK,PPPK Paruh Waktu',
        ], [
            'nis_nip.unique' => 'NIP sudah terdaftar pada sistem.',
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

        // Buat akun user
        User::updateOrCreate(
            ['username' => $participant->nis_nip],
            [
                'name' => $participant->nama,
                'password' => Hash::make($participant->nis_nip),
                'role' => 'participant',
                'participant_id' => $participant->id,
            ]
        );

        return redirect()->route('participants.index')
            ->with('success', 'Peserta berhasil ditambahkan! Akun peserta (username & password: NIP) siap digunakan.');
    }

    /**
     * Update data peserta.
     */
    public function update(Request $request, Participant $participant)
    {
        $cleanNip = $this->cleanNisNip($request->input('nis_nip'));
        $cleanNama = trim((string)$request->input('nama'));
        $cleanStatus = $this->normalizeStatus($request->input('status'));

        $request->merge([
            'nama' => $cleanNama,
            'nis_nip' => $cleanNip,
            'status' => $cleanStatus,
        ]);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nis_nip' => 'required|string|max:50|unique:participants,nis_nip,' . $participant->id,
            'status' => 'nullable|in:PNS,PPPK,PPPK Paruh Waktu',
        ], [
            'nis_nip.unique' => 'NIP sudah digunakan oleh peserta lain.',
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

        // Perbarui akun user jika ada
        User::where('participant_id', $participant->id)
            ->orWhere('username', $oldNip)
            ->update([
                'name' => $cleanNama,
                'username' => $cleanNip,
            ]);

        return redirect()->route('participants.index')
            ->with('success', 'Data peserta berhasil diperbarui!');
    }

    /**
     * Hapus peserta tunggal.
     */
    public function destroy(Participant $participant)
    {
        if ($participant->photo_path && Storage::disk('public')->exists($participant->photo_path)) {
            Storage::disk('public')->delete($participant->photo_path);
        }

        User::where('participant_id', $participant->id)
            ->orWhere('username', $participant->nis_nip)
            ->delete();

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
            if ($participant->photo_path && Storage::disk('public')->exists($participant->photo_path)) {
                Storage::disk('public')->delete($participant->photo_path);
            }

            User::where('participant_id', $participant->id)
                ->orWhere('username', $participant->nis_nip)
                ->delete();

            $participant->delete();
            $count++;
        }

        return redirect()->route('participants.index')
            ->with('success', "{$count} peserta berhasil dihapus!");
    }

    /**
     * Generate & tampilkan QR code SVG untuk peserta (inline view).
     */
    public function qrCode(Participant $participant, QrCodeService $qrCodeService)
    {
        $svg = $qrCodeService->generate($participant->qr_token, 400);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Download QR code sebagai SVG file (dengan label nama).
     */
    public function downloadSvg(Participant $participant, QrCodeService $qrCodeService)
    {
        $svg = $qrCodeService->generateWithLabel(
            $participant->qr_token,
            $participant->nama,
            $participant->nis_nip,
            400
        );

        $filename = 'QR_' . Str::slug($participant->nama) . '_' . $participant->nis_nip . '.svg';

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Download QR code sebagai PNG file.
     * Fallback ke SVG jika Imagick tidak tersedia.
     */
    public function downloadPng(Participant $participant, QrCodeService $qrCodeService)
    {
        $png = $qrCodeService->generatePng($participant->qr_token, 400);

        if ($png) {
            $filename = 'QR_' . Str::slug($participant->nama) . '_' . $participant->nis_nip . '.png';

            return response($png, 200, [
                'Content-Type' => 'image/png',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        }

        // Fallback ke SVG download jika PNG tidak bisa di-generate
        return $this->downloadSvg($participant, $qrCodeService);
    }

    /**
     * Cari peserta berdasarkan NIP/NIS atau nama (untuk pencarian QR publik).
     */
    public function lookup(Request $request)
    {
        $query = trim($request->query('query'));

        if (empty($query)) {
            return response()->json(['participant' => null]);
        }

        $participant = Participant::where('nis_nip', $query)
            ->orWhere('nama', 'like', '%' . $query . '%')
            ->first();

        if (!$participant) {
            return response()->json(['participant' => null]);
        }

        return response()->json([
            'participant' => [
                'id' => $participant->id,
                'nama' => $participant->nama,
                'nis_nip' => $participant->nis_nip,
                'qr_token' => $participant->qr_token,
            ]
        ]);
    }

    /**
     * Cari daftar peserta untuk autocomplete (rekomendasi).
     */
    public function search(Request $request)
    {
        $query = trim($request->query('query'));

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $participants = Participant::where('nis_nip', 'like', $query . '%')
            ->orWhere('nama', 'like', '%' . $query . '%')
            ->limit(5)
            ->get(['id', 'nama', 'nis_nip']);

        return response()->json($participants);
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
            // Gunakan StringValueBinder agar angka panjang (seperti NIP) tidak diubah menjadi float dan kehilangan presisi
            \PhpOffice\PhpSpreadsheet\Cell\Cell::setValueBinder(new \PhpOffice\PhpSpreadsheet\Cell\StringValueBinder());
            $spreadsheet = IOFactory::load($filePath);
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

            if (!$namaColKey) $namaColKey = 'A';
            if (!$nisNipColKey) $nisNipColKey = 'B';
            if (!$statusColKey) $statusColKey = 'C';

            $conflicts = [];
            $cleanData = [];
            $seenInExcelNip = [];
            $seenInExcelName = [];
            $rowIndex = 1;

            foreach ($rows as $row) {
                $rowIndex++;
                $rawNama = trim((string)($row[$namaColKey] ?? ''));
                $rawNip = trim((string)($row[$nisNipColKey] ?? ''));
                $rawStatus = isset($row[$statusColKey]) ? trim((string)$row[$statusColKey]) : null;

                if (empty($rawNama) || empty($rawNip)) {
                    continue;
                }

                $cleanNip = $this->cleanNisNip($rawNip);
                $cleanNama = $rawNama;
                $cleanStatus = $this->normalizeStatus($rawStatus);

                $normNameLower = strtolower(preg_replace('/\s+/', ' ', $cleanNama));

                // Cek database
                $existingByNip = Participant::where('nis_nip', $cleanNip)->first();
                $existingByName = Participant::whereRaw('LOWER(TRIM(nama)) = ?', [$normNameLower])->first();

                // Cek duplikasi di dalam file excel itu sendiri
                $duplicateInFile = isset($seenInExcelNip[$cleanNip]) || isset($seenInExcelName[$normNameLower]);

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
                            'nis_nip' => $target->nis_nip,
                            'status' => $target->status ?? '-',
                        ],
                        'new' => [
                            'nama' => $cleanNama,
                            'nis_nip' => $cleanNip,
                            'status' => $cleanStatus ?? '-',
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
                            'nis_nip' => $seenInExcelNip[$cleanNip]['nis_nip'] ?? $cleanNip,
                            'status' => $seenInExcelNip[$cleanNip]['status'] ?? '-',
                        ],
                        'new' => [
                            'nama' => $cleanNama,
                            'nis_nip' => $cleanNip,
                            'status' => $cleanStatus ?? '-',
                        ],
                        'conflict_reason' => 'Duplikat di baris lain dalam file Excel',
                        'default_resolution' => 'skip',
                    ];
                } else {
                    $cleanData[] = [
                        'nama' => $cleanNama,
                        'nis_nip' => $cleanNip,
                        'status' => $cleanStatus,
                    ];
                    $seenInExcelNip[$cleanNip] = ['nama' => $cleanNama, 'nis_nip' => $cleanNip, 'status' => $cleanStatus];
                    $seenInExcelName[$normNameLower] = ['nama' => $cleanNama, 'nis_nip' => $cleanNip, 'status' => $cleanStatus];
                }
            }

            // Jika tidak ada konflik, langsung simpan
            if (empty($conflicts)) {
                $savedCount = 0;
                foreach ($cleanData as $item) {
                    $p = Participant::create($item);
                    User::updateOrCreate(
                        ['username' => $item['nis_nip']],
                        [
                            'name' => $item['nama'],
                            'password' => Hash::make($item['nis_nip']),
                            'role' => 'participant',
                            'participant_id' => $p->id,
                        ]
                    );
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
            return response()->json(['error' => 'Gagal memproses file Excel: ' . $e->getMessage()], 422);
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
            $p = Participant::create([
                'nama' => $item['nama'],
                'nis_nip' => $item['nis_nip'],
                'status' => $item['status'] ?? null,
            ]);
            User::updateOrCreate(
                ['username' => $item['nis_nip']],
                [
                    'name' => $item['nama'],
                    'password' => Hash::make($item['nis_nip']),
                    'role' => 'participant',
                    'participant_id' => $p->id,
                ]
            );
            $newCount++;
        }

        // 2. Proses resolved conflicts
        foreach ($resolvedConflicts as $item) {
            $resolution = $item['resolution'] ?? 'skip';
            $existingId = $item['existing']['id'] ?? null;
            $newData = $item['new'];

            if ($resolution === 'update') {
                if ($existingId) {
                    $participant = Participant::find($existingId);
                    if ($participant) {
                        $oldNip = $participant->nis_nip;
                        $participant->update([
                            'nama' => $newData['nama'],
                            'nis_nip' => $newData['nis_nip'],
                            'status' => $newData['status'] === '-' ? null : $newData['status'],
                        ]);

                        User::where('participant_id', $participant->id)
                            ->orWhere('username', $oldNip)
                            ->update([
                                'name' => $newData['nama'],
                                'username' => $newData['nis_nip'],
                            ]);

                        $updatedCount++;
                    }
                } else {
                    $p = Participant::updateOrCreate(
                        ['nis_nip' => $newData['nis_nip']],
                        [
                            'nama' => $newData['nama'],
                            'status' => $newData['status'] === '-' ? null : $newData['status'],
                        ]
                    );
                    User::updateOrCreate(
                        ['username' => $newData['nis_nip']],
                        [
                            'name' => $newData['nama'],
                            'password' => Hash::make($newData['nis_nip']),
                            'role' => 'participant',
                            'participant_id' => $p->id,
                        ]
                    );
                    $updatedCount++;
                }
            } else {
                $skippedCount++;
            }
        }

        $summary = "Impor selesai! {$newCount} data baru ditambahkan";
        if ($updatedCount > 0) $summary .= ", {$updatedCount} data diperbarui";
        if ($skippedCount > 0) $summary .= ", {$skippedCount} data dilewati";
        $summary .= ".";

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
            // Gunakan StringValueBinder agar angka panjang (seperti NIP) tidak diubah menjadi float dan kehilangan presisi
            \PhpOffice\PhpSpreadsheet\Cell\Cell::setValueBinder(new \PhpOffice\PhpSpreadsheet\Cell\StringValueBinder());
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true); // Dapatkan baris ber-key kolom A, B, C...
            
            if (empty($rows)) {
                return redirect()->back()->with('error', 'File Excel/CSV kosong.');
            }

            // Dapatkan header dari baris pertama
            $firstRow = array_shift($rows);
            $headers = array_map(function($h) {
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
            if (!$namaColKey) $namaColKey = 'A';
            if (!$nisNipColKey) $nisNipColKey = 'B';
            if (!$statusColKey) $statusColKey = 'C';

            $successCount = 0;

            foreach ($rows as $row) {
                $rawNama = trim((string)($row[$namaColKey] ?? ''));
                $rawNip = trim((string)($row[$nisNipColKey] ?? ''));
                $rawStatus = isset($row[$statusColKey]) ? trim((string)$row[$statusColKey]) : null;

                if (empty($rawNama) || empty($rawNip)) {
                    continue; // Lewati baris kosong
                }

                $cleanNip = $this->cleanNisNip($rawNip);
                $cleanNama = $rawNama;
                $cleanStatus = $this->normalizeStatus($rawStatus);

                // Update data jika NIP/NIS sudah terdaftar, atau buat baru jika belum
                $participant = Participant::updateOrCreate(
                    ['nis_nip' => $cleanNip],
                    [
                        'nama' => $cleanNama,
                        'status' => $cleanStatus,
                    ]
                );

                // Buat akun user
                User::updateOrCreate(
                    ['username' => $cleanNip],
                    [
                        'name' => $cleanNama,
                        'password' => Hash::make($cleanNip),
                        'role' => 'participant',
                        'participant_id' => $participant->id,
                    ]
                );

                $successCount++;
            }

            return redirect()->route('participants.index')
                ->with('success', $successCount . ' data peserta berhasil diproses (diimpor/diperbarui). Akun peserta siap digunakan.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses file Excel: ' . $e->getMessage());
        }
    }

    /**
     * Download format / template file Excel untuk acuan impor peserta.
     */
    public function downloadTemplate()
    {
        try {
            if (class_exists('PhpOffice\PhpSpreadsheet\Spreadsheet')) {
                $spreadsheet = new Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->setTitle('Data Peserta');

                // Header kolom terpisah: Kolom A = Nama, Kolom B = NIP, Kolom C = Keterangan
                $sheet->setCellValue('A1', 'Nama');
                $sheet->setCellValue('B1', 'NIP');
                $sheet->setCellValue('C1', 'Status');

                // Format kolom B (NIP) sebagai Text agar angka panjang tidak terpotong
                $sheet->getStyle('B:B')->getNumberFormat()->setFormatCode('@');

                // Contoh baris data terpisah per kolom
                $sheet->setCellValueExplicit('A2', 'Drs. H. Ahmad Fauzi, M.Pd', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('B2', '197503122000031002', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('C2', 'PNS', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

                $sheet->setCellValueExplicit('A3', 'Siti Nurhaliza, S.Pd', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('B3', '198504152010012004', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('C3', 'PPPK', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

                $sheet->setCellValueExplicit('A4', 'Bambang Sudarsono, S.T', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('B4', '198207182008011007', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                $sheet->setCellValueExplicit('C4', 'PPPK Paruh Waktu', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

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
                $sheet->getStyle('A1:C1')->applyFromArray($headerStyle);
                $sheet->getColumnDimension('A')->setWidth(32);
                $sheet->getColumnDimension('B')->setWidth(26);
                $sheet->getColumnDimension('C')->setWidth(26);

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
            fputs($handle, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel
            fputcsv($handle, ['Nama', 'NIP', 'Status']);
            fputcsv($handle, ['Drs. H. Ahmad Fauzi, M.Pd', '197503122000031002', 'PNS']);
            fputcsv($handle, ['Siti Nurhaliza, S.Pd', '198504152010012004', 'PPPK']);
            fputcsv($handle, ['Bambang Sudarsono, S.T', '198207182008011007', 'PPPK Paruh Waktu']);
            fclose($handle);
        }, $csvFilename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
