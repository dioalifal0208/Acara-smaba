<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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
                'message' => __('auth.failed') // Use generic message
            ], 401);
        }

        // Determine token abilities based on role
        $abilities = ['role:' . $user->role];
        
        $token = $user->createToken($request->input('device_name'), $abilities);

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
