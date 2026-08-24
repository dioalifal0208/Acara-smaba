<?php

namespace App\Http\Controllers;



use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function edit()
    {
        $settings = [
            'kepala_sekolah_nama' => Setting::get('kepala_sekolah_nama', 'Muhtarom, S.Pd., M.Si.'),
            'kepala_sekolah_nip' => Setting::get('kepala_sekolah_nip', '197205172006041015'),
        ];

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'kepala_sekolah_nama' => 'required|string|max:255',
            'kepala_sekolah_nip' => 'required|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Pengaturan Tanda Tangan berhasil diperbarui.');
    }
}
