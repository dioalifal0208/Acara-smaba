<?php

namespace App\Http\Controllers;

use App\Models\Workcode;
use Illuminate\Http\Request;
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_workcode' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:1000',
            'kategori' => 'required|in:workcode,harian,24_jam',
            'tanggal' => 'nullable|date',
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

        $isFutureDate = false;
        if (($validated['kategori'] ?? 'workcode') === 'workcode' && !empty($validated['tanggal'])) {
            $isFutureDate = \Carbon\Carbon::parse($validated['tanggal'])->startOfDay()->isFuture();
        }

        $setActive = $request->boolean('set_active') || Workcode::count() === 0;
        
        if ($isFutureDate) {
            $setActive = false;
        }

        if ($setActive) {
            Workcode::query()->update(['is_active' => false]);
        }

        $isDaily = $validated['kategori'] === 'harian';

        $workcode = Workcode::create([
            'nama_workcode' => $validated['nama_workcode'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'kategori' => $validated['kategori'] ?? 'workcode',
            'tanggal' => $validated['kategori'] === 'workcode' ? ($validated['tanggal'] ?? null) : null,
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

        $message = $setActive
            ? "Workcode '{$workcode->nama_workcode}' berhasil dibuat dan diaktifkan!"
            : "Workcode '{$workcode->nama_workcode}' berhasil dibuat.";

        return redirect()->back()->with('success', $message);
    }

    /**
     * Aktifkan workcode tertentu.
     */
    public function activate(Workcode $workcode)
    {
        Workcode::query()->update(['is_active' => false]);
        $workcode->update(['is_active' => true]);

        return redirect()->back()->with('success', "Workcode '{$workcode->nama_workcode}' sekarang aktif.");
    }

    /**
     * Nonaktifkan workcode aktif.
     */
    public function deactivate(Workcode $workcode)
    {
        $workcode->update(['is_active' => false]);

        return redirect()->back()->with('success', "Workcode '{$workcode->nama_workcode}' telah dinonaktifkan.");
    }

    /**
     * Hapus workcode.
     */
    public function destroy(Workcode $workcode)
    {
        $nama = $workcode->nama_workcode;
        $workcode->delete();

        return redirect()->back()->with('success', "Workcode '{$nama}' berhasil dihapus.");
    }

    /**
     * Update workcode.
     */
    public function update(Request $request, Workcode $workcode)
    {
        $validated = $request->validate([
            'nama_workcode' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:1000',
            'kategori' => 'required|in:workcode,harian,24_jam',
            'tanggal' => 'nullable|date',
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

        $isDaily = $validated['kategori'] === 'harian';

        $workcode->update([
            'nama_workcode' => $validated['nama_workcode'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'kategori' => $validated['kategori'] ?? 'workcode',
            'tanggal' => $validated['kategori'] === 'workcode' ? ($validated['tanggal'] ?? null) : null,
            'hari_aktif' => $isDaily ? ($validated['hari_aktif'] ?? null) : null,
            'jam_datang_mulai' => $isDaily ? ($validated['jam_datang_mulai'] ?? null) : null,
            'jam_datang_selesai' => $isDaily ? ($validated['jam_datang_selesai'] ?? null) : null,
            'jam_pulang_mulai' => $isDaily ? ($validated['jam_pulang_mulai'] ?? null) : null,
            'jam_pulang_selesai' => $isDaily ? ($validated['jam_pulang_selesai'] ?? null) : null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'radius_meters' => $validated['radius_meters'] ?? 50,
            'jadwal_per_hari' => $isDaily ? ($validated['jadwal_per_hari'] ?? null) : null,
        ]);

        return redirect()->back()->with('success', "Workcode '{$workcode->nama_workcode}' berhasil diperbarui.");
    }
}
