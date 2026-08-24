<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Workcode;
use App\Models\Setting;
use Inertia\Inertia;

class VerificationController extends Controller
{
    public function verify(Workcode $workcode)
    {
        $namaKepsek = Setting::get('kepala_sekolah_nama', 'Muhtarom, S.Pd., M.Si.');
        $nipKepsek = Setting::get('kepala_sekolah_nip', '197205172006041015');

        return Inertia::render('VerifySignature', [
            'workcode' => $workcode,
            'kepalaSekolahNama' => $namaKepsek,
            'kepalaSekolahNip' => $nipKepsek,
            'waktuCetak' => now()->translatedFormat('l, d F Y H:i') . ' WIB',
        ]);
    }
}
