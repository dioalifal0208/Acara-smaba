<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * API Login endpoint.
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['required', 'string', 'max:100'],
        ]);

        $login = trim($request->input('login'));
        $password = $request->input('password');

        $user = User::where('username', $login)->orWhere('email', $login)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => __('auth.failed'), // Use generic message
            ], 401);
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
}
