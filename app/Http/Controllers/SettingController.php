<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /** Folder Google Drive berisi APK aplikasi Android; bisa diganti admin di halaman Pengaturan. */
    public const DEFAULT_APK_URL = 'https://drive.google.com/drive/folders/1tUWcH1BLWqDvE19nH1HbVd99uf3RAbJI?usp=sharing';

    /** Link unduhan aplikasi Android untuk halaman depan; null bila admin mengosongkannya. */
    public static function apkUrl(): ?string
    {
        return Setting::get('android_apk_url', self::DEFAULT_APK_URL) ?: null;
    }

    public function edit()
    {
        $settings = [
            'kepala_sekolah_nama' => Setting::get('kepala_sekolah_nama', 'Muhtarom, S.Pd., M.Si.'),
            'kepala_sekolah_nip' => Setting::get('kepala_sekolah_nip', '197205172006041015'),
            'android_apk_url' => self::apkUrl() ?? '',
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

    /** Simpan link unduhan APK; dikosongkan berarti tombol unduh di halaman depan disembunyikan. */
    public function updateApk(Request $request)
    {
        $validated = $request->validate([
            'android_apk_url' => 'nullable|url:https|max:500',
        ], [
            'android_apk_url.url' => 'Masukkan link lengkap yang diawali https://, misalnya link folder Google Drive.',
        ]);

        Setting::updateOrCreate(['key' => 'android_apk_url'], ['value' => $validated['android_apk_url'] ?? '']);

        return redirect()->back()->with('success', 'Link unduhan aplikasi Android berhasil diperbarui.');
    }
}
