<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\DeviceLock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /** ANDROID_ID: 16 karakter heksadesimal; dibuat longgar agar tetap menerima format lain. */
    public const DEVICE_ID_RULES = ['string', 'min:8', 'max:128', 'regex:/^[A-Za-z0-9._:-]+$/'];

    /**
     * API Login endpoint.
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['required', 'string', 'max:100'],
            'device_id' => ['nullable', ...self::DEVICE_ID_RULES],
            'device_model' => ['nullable', 'string', 'max:100'],
        ]);

        $user = self::userFromCredentials($request);

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => __('auth.failed'), // Use generic message
            ], 401);
        }

        if (DeviceLock::appliesTo($user) && ($blocked = $this->enforceDeviceLock($request, $user))) {
            return $blocked;
        }

        // Determine token abilities based on role
        $abilities = ['role:'.$user->role];

        $token = $user->createToken($request->input('device_name'), $abilities);

        // Cegah token menumpuk tiap login ulang: simpan hanya 5 sesi perangkat terbaru.
        $user->tokens()
            ->whereNotIn('id', $user->tokens()->latest('id')->limit(5)->pluck('id'))
            ->delete();

        return response()->json([
            'status' => 'success',
            'data' => [
                'token' => $token->plainTextToken,
            ],
        ]);
    }

    /**
     * API Logout endpoint.
     */
    public function logout(Request $request)
    {
        // Revoke the current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil logout.',
        ]);
    }

    public static function userFromCredentials(Request $request): ?User
    {
        $login = trim($request->input('login'));
        $user = User::where('username', $login)->orWhere('email', $login)->first();

        return $user && Hash::check($request->input('password'), $user->password) ? $user : null;
    }

    /** HP sudah terkunci untuk akun peserta lain. Identitas akun pemilik sengaja tidak dibocorkan. */
    public static function deviceInUseResponse(): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'code' => 'device_in_use',
            'message' => 'User sudah terdaftar pada device lain, kontak admin!',
        ], 403);
    }

    /**
     * Login pertama mengunci akun ke HP tersebut; login dari HP lain ditolak sampai admin
     * menyetujui pengajuan pindah perangkat. Mengembalikan respons penolakan, atau null bila boleh lanjut.
     */
    private function enforceDeviceLock(Request $request, User $user): ?JsonResponse
    {
        if (! $request->filled('device_id')) {
            if (! config('attendance.device_lock.require_device_id')) {
                return null; // aplikasi versi lama: diterima tanpa penguncian selama masa transisi
            }

            return response()->json([
                'status' => 'error',
                'code' => 'app_update_required',
                'message' => 'Versi aplikasi Anda sudah usang. Perbarui aplikasi untuk dapat login.',
            ], 426);
        }

        $deviceHash = DeviceLock::hash($request->input('device_id'));

        // Kunci baris user agar dua HP yang login bersamaan untuk pertama kali tidak sama-sama terdaftar.
        $allowed = DB::transaction(function () use ($user, $deviceHash, $request) {
            $locked = User::lockForUpdate()->findOrFail($user->id);

            // HP ini sudah terkunci untuk akun lain: tolak sebelum akun ini sempat terikat ke sini.
            if (DeviceLock::boundToOther($locked, $deviceHash)) {
                return 'in_use';
            }

            if ($locked->device_id_hash === null) {
                DeviceLock::bind($locked, $deviceHash, $request->input('device_model'));

                return true;
            }

            return DeviceLock::matches($locked, $deviceHash);
        });

        if ($allowed === 'in_use') {
            return self::deviceInUseResponse();
        }

        if ($allowed) {
            return null;
        }

        $user->refresh();
        $changeRequest = $user->deviceChangeRequests()
            ->where('device_id_hash', $deviceHash)
            ->latest('id')
            ->first();

        $pending = $changeRequest?->status === 'pending';
        $message = match (true) {
            $pending => 'Pengajuan pindah perangkat Anda sedang menunggu persetujuan admin.',
            $changeRequest?->status === 'rejected' => 'Pengajuan pindah perangkat sebelumnya ditolak admin. Anda dapat mengajukan kembali.',
            default => 'Akun Anda terdaftar di perangkat lain. Ajukan pindah perangkat untuk login di HP ini.',
        };

        return response()->json([
            'status' => 'error',
            'code' => $pending ? 'device_change_pending' : 'device_not_registered',
            'message' => $message,
            'data' => [
                'registered_device_model' => $user->device_model,
                'device_change_request' => $changeRequest?->toApiArray(),
            ],
        ], 403);
    }
}
