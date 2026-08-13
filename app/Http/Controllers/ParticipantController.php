<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

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
                    'keterangan' => $participant->keterangan,
                    'qr_token' => $participant->qr_token,
                    'has_attended' => $participant->attendances_count > 0,
                    'created_at' => $participant->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('Participants/Index', [
            'participants' => $participants,
        ]);
    }

    /**
     * Simpan peserta baru — QR token otomatis di-generate via Model boot().
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nis_nip' => 'required|string|max:50|unique:participants,nis_nip',
            'keterangan' => 'nullable|string|max:100',
        ]);

        // QR token di-generate otomatis oleh Participant model boot()
        Participant::create($validated);

        return redirect()->route('participants.index')
            ->with('success', 'Peserta berhasil ditambahkan! QR Code siap diunduh.');
    }

    /**
     * Update data peserta.
     */
    public function update(Request $request, Participant $participant)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nis_nip' => 'required|string|max:50|unique:participants,nis_nip,' . $participant->id,
            'keterangan' => 'nullable|string|max:100',
        ]);

        $participant->update($validated);

        return redirect()->route('participants.index')
            ->with('success', 'Data peserta berhasil diperbarui!');
    }

    /**
     * Hapus peserta.
     */
    public function destroy(Participant $participant)
    {
        $participant->delete();

        return redirect()->route('participants.index')
            ->with('success', 'Peserta berhasil dihapus!');
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
     * Import peserta secara massal via Excel/CSV.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120', // Max 5MB
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        try {
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
            $ketColKey = null;

            foreach ($headers as $colKey => $headerVal) {
                if (in_array($headerVal, ['nama', 'name', 'nama lengkap', 'nama_lengkap'])) {
                    $namaColKey = $colKey;
                }
                if (in_array($headerVal, ['nis/nip', 'nis', 'nip', 'nis_nip', 'nomor induk', 'no induk', 'nip/nis'])) {
                    $nisNipColKey = $colKey;
                }
                if (in_array($headerVal, ['keterangan', 'ket', 'status', 'role', 'jabatan'])) {
                    $ketColKey = $colKey;
                }
            }

            // Fallback default jika header tidak terdeteksi
            if (!$namaColKey) $namaColKey = 'A';
            if (!$nisNipColKey) $nisNipColKey = 'B';
            if (!$ketColKey) $ketColKey = 'C';

            $successCount = 0;

            foreach ($rows as $row) {
                $nama = trim($row[$namaColKey] ?? '');
                $nisNip = trim($row[$nisNipColKey] ?? '');
                $keterangan = isset($row[$ketColKey]) ? trim($row[$ketColKey]) : null;

                if (empty($nama) || empty($nisNip)) {
                    continue; // Lewati baris kosong
                }

                // Update data jika NIP/NIS sudah terdaftar, atau buat baru jika belum
                Participant::updateOrCreate(
                    ['nis_nip' => $nisNip],
                    [
                        'nama' => $nama,
                        'keterangan' => $keterangan,
                    ]
                );

                $successCount++;
            }

            return redirect()->route('participants.index')
                ->with('success', $successCount . ' data peserta berhasil diproses (diimpor/diperbarui).');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses file Excel: ' . $e->getMessage());
        }
    }
}
