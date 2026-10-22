<?php

namespace App\Http\Controllers;

use App\Models\DeviceChangeRequest;
use App\Models\LocationIntegrityViolation;
use App\Models\User;
use App\Services\FcmService;
use App\Support\DeviceLock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/** Panel admin: pengajuan pindah perangkat dan daftar HP yang terkunci ke akun peserta. */
class DeviceController extends Controller
{
    public function index()
    {
        $requests = DeviceChangeRequest::with(['user.participant', 'reviewer'])
            ->latest('id')
            ->limit(500)
            ->get()
            ->map(fn (DeviceChangeRequest $req) => [
                'id' => $req->id,
                'participant_name' => $req->user?->participant?->nama ?? $req->user?->name ?? 'Tidak diketahui',
                'participant_nip' => $req->user?->participant?->nis_nip ?? '-',
                'device_model' => $req->device_model ?: 'Tidak diketahui',
                'previous_device_model' => $req->previous_device_model ?: 'Tidak diketahui',
                'reason' => $req->reason,
                'status' => $req->status,
                'rejection_reason' => $req->rejection_reason,
                'reviewer_name' => $req->reviewer?->name,
                'reviewed_at' => $req->reviewed_at?->format('d M Y H:i'),
                'created_at' => $req->created_at->format('d M Y H:i'),
            ]);

        $devices = User::with('participant')
            ->where('role', 'participant')
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
            'deviceRequests' => $requests,
            'devices' => $devices,
            'minAppVersionCode' => (int) config('attendance.android_app.min_version_code'),
            'violationsToday' => LocationIntegrityViolation::where('blocked', true)->whereDate('created_at', today())->count(),
        ]);
    }

    public function approve(DeviceChangeRequest $deviceChangeRequest, FcmService $fcm): RedirectResponse
    {
        $oldFcmToken = null;
        $approved = DB::transaction(function () use ($deviceChangeRequest, &$oldFcmToken) {
            $changeRequest = DeviceChangeRequest::lockForUpdate()->findOrFail($deviceChangeRequest->id);
            if ($changeRequest->status !== 'pending') {
                return false;
            }

            $user = User::lockForUpdate()->findOrFail($changeRequest->user_id);
            // Satu HP satu akun: HP baru ternyata sudah terkunci untuk akun lain.
            if (DeviceLock::boundToOther($user, $changeRequest->device_id_hash)) {
                return 'in_use';
            }

            // Token FCM HP lama diambil sebelum bind() menghapusnya, untuk push "sesi dicabut".
            $oldFcmToken = $user->fcm_token;
            // HP lama langsung keluar karena semua tokennya dicabut.
            DeviceLock::bind($user, $changeRequest->device_id_hash, $changeRequest->device_model);

            $changeRequest->update([
                'status' => 'approved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);

            return true;
        });

        if ($approved === 'in_use') {
            return back()->with('error', 'HP baru ini sudah terkunci untuk akun lain. Reset perangkat akun tersebut terlebih dahulu.');
        }

        if (! $approved) {
            return back()->with('error', 'Pengajuan ini sudah diproses.');
        }

        $fcm->sendSessionRevoked($oldFcmToken, 'device_changed');

        return back()->with('success', 'Pindah perangkat disetujui. Peserta dapat login di HP barunya.');
    }

    public function reject(Request $request, DeviceChangeRequest $deviceChangeRequest): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $rejected = DB::transaction(function () use ($deviceChangeRequest, $validated) {
            $changeRequest = DeviceChangeRequest::lockForUpdate()->findOrFail($deviceChangeRequest->id);
            if ($changeRequest->status !== 'pending') {
                return false;
            }

            $changeRequest->update([
                'status' => 'rejected',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'rejection_reason' => $validated['rejection_reason'] ?? null,
            ]);

            return true;
        });

        if (! $rejected) {
            return back()->with('error', 'Pengajuan ini sudah diproses.');
        }

        return back()->with('success', 'Pengajuan pindah perangkat ditolak.');
    }

    /** HP hilang/rusak: lepas kunci tanpa pengajuan; login berikutnya mendaftarkan HP baru. */
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

            DeviceChangeRequest::where('status', 'pending')->update([
                'status' => 'rejected',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'rejection_reason' => 'Kunci perangkat direset admin. Silakan login langsung.',
            ]);

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

            // Pengajuan yang masih menunggu tidak relevan lagi setelah kunci dilepas.
            DeviceChangeRequest::where('user_id', $user->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'rejected',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'rejection_reason' => 'Kunci perangkat direset admin. Silakan login langsung.',
                ]);
        });

        $fcm->sendSessionRevoked($oldFcmToken, 'device_reset');

        Log::info('Kunci perangkat peserta direset admin.', ['user_id' => $user->id, 'admin_id' => auth()->id()]);

        return back()->with('success', 'Kunci perangkat direset. HP yang dipakai login berikutnya akan otomatis terdaftar.');
    }
}
