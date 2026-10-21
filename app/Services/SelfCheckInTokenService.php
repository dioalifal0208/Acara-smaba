<?php

namespace App\Services;

use App\Models\Workcode;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Token URL presensi mandiri per workcode. Setiap workcode aktif punya QR/URL sendiri
 * sehingga hasil scan selalu tercatat ke workcode yang QR-nya dipindai.
 * Token berganti otomatis tiap hari (cache s.d. akhir hari) atau saat diregenerasi admin.
 */
class SelfCheckInTokenService
{
    public function tokenFor(Workcode $workcode): string
    {
        $key = $this->workcodeKey($workcode->id);

        // add() atomik: permintaan bersamaan tidak saling menimpa token.
        Cache::add($key, Str::random(40), now()->endOfDay());
        $token = (string) Cache::get($key);

        Cache::put($this->tokenKey($token), $workcode->id, now()->endOfDay());

        return $token;
    }

    /** Workcode pemilik token, atau null bila token tidak dikenal/kedaluwarsa. */
    public function resolve(string $token): ?Workcode
    {
        $workcodeId = Cache::get($this->tokenKey($token));

        if (! $workcodeId || ! hash_equals((string) Cache::get($this->workcodeKey((int) $workcodeId)), $token)) {
            return null;
        }

        return Workcode::withCount('participants')->find($workcodeId);
    }

    public function regenerate(Workcode $workcode): void
    {
        $key = $this->workcodeKey($workcode->id);
        $oldToken = Cache::pull($key);

        if ($oldToken) {
            Cache::forget($this->tokenKey((string) $oldToken));
        }
    }

    private function workcodeKey(int $workcodeId): string
    {
        return "self_checkin_token:workcode:{$workcodeId}";
    }

    private function tokenKey(string $token): string
    {
        return 'self_checkin_token:token:'.hash('sha256', $token);
    }
}
