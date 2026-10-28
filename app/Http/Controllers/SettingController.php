<?php

namespace App\Http\Controllers;

use App\Models\AppRelease;
use App\Models\Setting;
use App\Models\User;
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
            'androidApp' => $this->androidApp(),
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

    /**
     * APK terbaru yang diunggah deploy, versi minimum aplikasi saat ini, dan berapa peserta yang akan
     * diminta update saat rilis berikutnya menggeser versi minimum (jendela bergeser).
     */
    private function androidApp(): array
    {
        $latest = AppRelease::latestRelease();
        $nextMinimum = AppRelease::minimumFor(($latest?->version_code ?? 0) + 1);

        return [
            'latest' => $latest ? [
                'version_name' => $latest->version_name,
                'version_code' => $latest->version_code,
                'size_bytes' => $latest->size_bytes,
                'download_count' => $latest->download_count,
                'published_at' => $latest->published_at->toIso8601String(),
                'download_url' => route('apk.download'),
            ] : null,
            'min_version_code' => AppRelease::minimumVersionCode(),
            'min_version_lag' => (int) config('attendance.android_app.min_version_lag'),
            'next_min_version_code' => $nextMinimum,
            // Hanya peserta yang versinya tercatat (aplikasi baru mengirim X-App-Version-Code).
            'outdated_next_release' => User::where('role', 'participant')
                ->whereNotNull('app_version_code')
                ->where('app_version_code', '<', $nextMinimum)
                ->count(),
        ];
    }
}
