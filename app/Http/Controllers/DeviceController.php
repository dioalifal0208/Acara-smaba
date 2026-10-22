<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FcmService;
use App\Support\DeviceLock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Panel admin: daftar HP yang terkunci ke akun peserta. Peserta yang ganti HP minta admin mereset
 * kuncinya; HP yang dipakai login berikutnya otomatis terdaftar.
 */
class DeviceController extends Controller
{
    public function index()
    {
        $participants = User::where('role', 'participant');

        $devices = (clone $participants)
            ->with('participant')
            ->whereNotNull('device_id_hash')
            ->orderByDesc('device_bound_at')
            ->get()
            ->map(fn (User $user) => [
                'user_id' => $user->id,
                'participant_name' => $user->participant?->nama ?? $user->name,
                'participant_nip' => $user->participant?->nis_nip ?? '-',
                'device_model' => $user->device_model ?: 'Tidak diketahui',
                'bound_at' => $user->device_bound_at?->format('d M Y H:i'),
                'app_version_name' => $user->app_version_name,
                'app_version_code' => $user->app_version_code,
            ]);

        return Inertia::render('Devices/Index', [
            'devices' => $devices,
            'participantCount' => (clone $participants)->count(),
            'minAppVersionCode' => (int) config('attendance.android_app.min_version_code'),
        ]);
    }

    public function reset(User $user, FcmService $fcm): RedirectResponse
    {
        if (! DeviceLock::appliesTo($user)) {
            return back()->with('error', 'Kunci perangkat hanya berlaku untuk akun peserta.');
        }

        $oldFcmToken = null;
        DB::transaction(function () use ($user, &$oldFcmToken) {
            $locked = User::lockForUpdate()->findOrFail($user->id);
            $oldFcmToken = $locked->fcm_token;
            DeviceLock::release($locked);
        });

        $fcm->sendSessionRevoked($oldFcmToken, 'device_reset');

        Log::info('Kunci perangkat peserta direset admin.', ['user_id' => $user->id, 'admin_id' => auth()->id()]);

        return back()->with('success', 'Kunci perangkat direset. HP yang dipakai login berikutnya akan otomatis terdaftar.');
    }

    /**
     * Reset kunci perangkat SEMUA peserta sekaligus, mis. saat aplikasi berganti kunci tanda tangan
     * (ANDROID_ID ikut berubah sehingga semua kunci lama tidak cocok lagi). Semua peserta keluar dari
     * aplikasi, dan HP yang dipakai login berikutnya otomatis terdaftar.
     */
    public function resetAll(FcmService $fcm): RedirectResponse
    {
        $oldFcmTokens = [];
        $count = DB::transaction(function () use (&$oldFcmTokens) {
            $users = User::lockForUpdate()
                ->where('role', 'participant')
                ->whereNotNull('device_id_hash')
                ->get();

            foreach ($users as $user) {
                $oldFcmTokens[] = $user->fcm_token;
                DeviceLock::release($user);
            }

            return $users->count();
        });

        if ($count === 0) {
            return back()->with('error', 'Tidak ada perangkat terdaftar yang perlu direset.');
        }

        foreach (array_filter($oldFcmTokens) as $token) {
            $fcm->sendSessionRevoked($token, 'device_reset');
        }

        Log::warning('Kunci perangkat SEMUA peserta direset admin.', ['count' => $count, 'admin_id' => auth()->id()]);

        return back()->with('success', "Kunci perangkat {$count} peserta direset. Semua peserta perlu login ulang, dan HP yang dipakai otomatis terdaftar.");
    }
}
