<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\DefaultPassword;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $nisNip = $request->user()->participant?->nis_nip;

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed', function (string $attribute, mixed $value, \Closure $fail) use ($nisNip) {
                if ($nisNip && $value === $nisNip) {
                    $fail('Kata sandi baru tidak boleh sama dengan NIS/NIP.');
                }
            }],
        ]);

        // Ganti password awal yang diwajibkan EnsurePasswordChanged: lanjut ke beranda peserta.
        $wasDefault = DefaultPassword::inUse($request);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        if ($wasDefault) {
            return redirect()->route('participant.dashboard')->with('success', 'Kata sandi berhasil diganti.');
        }

        return back();
    }
}
