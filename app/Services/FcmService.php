<?php

namespace App\Services;

use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Exception\Messaging\InvalidMessage;
use Kreait\Firebase\Exception\Messaging\NotFound;
use Kreait\Firebase\Messaging\AndroidConfig;
use Kreait\Firebase\Messaging\CloudMessage;

class FcmService
{
    /**
     * Topic yang digunakan untuk broadcast update workcode.
     */
    const TOPIC = 'workcode-updates';

    /** Alasan yang sah untuk pesan per-pengguna `state_changed` (kontrak API bagian E). */
    public const STATE_REASONS = ['face', 'attendance', 'photo', 'leave', 'workcode'];

    /** Pesan sama (pengguna + alasan) dalam rentang ini digabung jadi satu push. */
    private const STATE_DEDUPE_SECONDS = 3;

    protected ?Messaging $messaging = null;

    /**
     * Firebase di-resolve saat dipakai (di dalam try/catch tiap method), bukan di constructor.
     * Bila kredensial Firebase belum dikonfigurasi, hanya pengiriman FCM yang gagal dan tercatat
     * di log; aksi workcode dan scheduler tetap berjalan.
     */
    protected function messaging(): Messaging
    {
        return $this->messaging ??= app(Messaging::class);
    }

    /**
     * Kirim notifikasi perubahan workcode ke semua subscriber.
     *
     * @param  string  $action  Tipe aksi: created, updated, activated, deactivated, deleted
     * @param  Workcode  $workcode  Workcode yang berubah
     * @param  array  $extra  Data tambahan opsional
     */
    public function sendWorkcodeUpdate(string $action, Workcode $workcode, array $extra = []): void
    {
        if ($this->disabledForTests()) {
            return;
        }

        try {
            $data = array_merge([
                'type' => 'workcode_sync',
                'action' => $action,
                'workcode_id' => (string) $workcode->id,
                'workcode_name' => $workcode->nama_workcode,
                'is_active' => $workcode->is_active ? '1' : '0',
                'timestamp' => now()->toIso8601String(),
            ], $extra);

            $message = CloudMessage::new()
                ->withTopic(self::TOPIC)
                ->withData($data)
                ->withAndroidConfig($this->highPriorityAndroidConfig());

            $this->messaging()->send($message);

            Log::info('FCM workcode update sent', [
                'action' => $action,
                'workcode_id' => $workcode->id,
                'topic' => self::TOPIC,
            ]);
        } catch (\Throwable $e) {
            // Jangan sampai gagal kirim FCM menggagalkan proses utama
            Log::error('FCM workcode update failed', [
                'action' => $action,
                'workcode_id' => $workcode->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Sinkronisasi penuh dari tombol Sync admin: pesan topic `workcode_sync` (action `full_sync`) ke
     * semua HP. Aplikasi yang sudah ada sudah menanggapi `workcode_sync` dengan memuat ulang
     * GET /api/v1/me/state (dengan tunda acak); tanpa data pribadi. Mengembalikan false bila gagal kirim.
     */
    public function sendFullSync(): bool
    {
        if ($this->disabledForTests()) {
            return true;
        }

        try {
            $this->messaging()->send(
                CloudMessage::new()
                    ->withTopic(self::TOPIC)
                    ->withData([
                        'type' => 'workcode_sync',
                        'action' => 'full_sync',
                        'v' => '1',
                        'timestamp' => now()->toIso8601String(),
                    ])
                    ->withAndroidConfig($this->highPriorityAndroidConfig())
            );

            Log::info('FCM full_sync sent', ['topic' => self::TOPIC]);

            return true;
        } catch (\Throwable $e) {
            Log::error('FCM full_sync failed', ['error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Beri tahu aplikasi Android milik peserta bahwa statusnya berubah (wajah, presensi, foto, izin).
     * Payload tanpa data pribadi: {type: state_changed, reason, v: 1}. Aplikasi menanggapinya dengan
     * memuat ulang GET /api/v1/me/state (dengan ETag). Dikirim setelah transaksi DB selesai; gagal
     * kirim hanya dicatat ke log dan tidak pernah menggagalkan proses utama.
     */
    public function sendStateChanged(User|Participant $target, string $reason): void
    {
        if ($this->disabledForTests()) {
            return;
        }

        try {
            if (! in_array($reason, self::STATE_REASONS, true)) {
                throw new \InvalidArgumentException("Alasan state_changed tidak dikenal: {$reason}");
            }

            $userIds = $target instanceof User
                ? ($target->fcm_token ? [$target->id] : [])
                : User::where('participant_id', $target->id)->whereNotNull('fcm_token')->pluck('id')->all();

            foreach ($userIds as $userId) {
                DB::afterCommit(fn () => $this->dispatchStateChanged((int) $userId, $reason));
            }
        } catch (\Throwable $e) {
            Log::error('FCM state_changed gagal dijadwalkan', [
                'reason' => $reason,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function dispatchStateChanged(int $userId, string $reason): void
    {
        $token = null;

        try {
            // Beberapa perubahan dalam satu aksi (mis. izin multi-hari) cukup satu push.
            if (! Cache::add("fcm-state|{$userId}|{$reason}", true, self::STATE_DEDUPE_SECONDS)) {
                return;
            }

            $token = User::whereKey($userId)->value('fcm_token');
            if (! $token) {
                return;
            }

            $message = CloudMessage::new()
                ->withToken($token)
                ->withData([
                    'type' => 'state_changed',
                    'reason' => $reason,
                    'v' => '1',
                ])
                ->withAndroidConfig($this->highPriorityAndroidConfig());

            $this->messaging()->send($message);

            Log::info('FCM state_changed sent', ['user_id' => $userId, 'reason' => $reason]);
        } catch (NotFound|InvalidMessage $e) {
            // Token tidak terdaftar/tidak valid lagi (aplikasi dihapus, token kedaluwarsa): lepas dari akun.
            if ($token) {
                User::whereKey($userId)->where('fcm_token', $token)->update(['fcm_token' => null]);
            }

            Log::warning('FCM token tidak valid, dilepas dari akun', ['user_id' => $userId, 'reason' => $reason]);
        } catch (\Throwable $e) {
            Log::error('FCM state_changed failed', [
                'user_id' => $userId,
                'reason' => $reason,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** Alasan sesi HP dicabut: pindah perangkat disetujui admin, atau kunci perangkat direset admin. */
    public const SESSION_REVOKED_REASONS = ['device_reset'];

    /**
     * Beri tahu HP lama bahwa sesinya dicabut, agar aplikasi langsung keluar (tanpa menunggu request
     * berikutnya gagal 401). Token FCM harus diambil SEBELUM kunci perangkat dipindah, karena
     * DeviceLock::bind/release menghapus users.fcm_token. Dikirim setelah transaksi DB selesai.
     */
    public function sendSessionRevoked(?string $token, string $reason): void
    {
        if ($this->disabledForTests() || ! $token) {
            return;
        }

        DB::afterCommit(function () use ($token, $reason) {
            try {
                if (! in_array($reason, self::SESSION_REVOKED_REASONS, true)) {
                    throw new \InvalidArgumentException("Alasan session_revoked tidak dikenal: {$reason}");
                }

                $this->messaging()->send(
                    CloudMessage::new()
                        ->withToken($token)
                        ->withData(['type' => 'session_revoked', 'reason' => $reason, 'v' => '1'])
                        ->withAndroidConfig($this->highPriorityAndroidConfig())
                );

                Log::info('FCM session_revoked sent', ['reason' => $reason]);
            } catch (NotFound|InvalidMessage) {
                // HP lama sudah tidak terdaftar di FCM: tidak ada yang perlu diberi tahu.
            } catch (\Throwable $e) {
                Log::error('FCM session_revoked failed', ['reason' => $reason, 'error' => $e->getMessage()]);
            }
        });
    }

    /** Tidak ada pengiriman atau resolusi kredensial Firebase ketika menjalankan test. */
    private function disabledForTests(): bool
    {
        return app()->runningUnitTests();
    }

    /** Prioritas tinggi agar pesan data tetap sampai saat HP dalam mode Doze; kedaluwarsa 10 menit. */
    private function highPriorityAndroidConfig(): AndroidConfig
    {
        return AndroidConfig::fromArray([
            'priority' => 'high',
            'ttl' => '600s',
        ]);
    }

    /**
     * Subscribe token device ke topic workcode-updates.
     */
    public function subscribeToWorkcodeUpdates(string $token): void
    {
        if ($this->disabledForTests()) {
            return;
        }

        try {
            $this->messaging()->subscribeToTopic(self::TOPIC, [$token]);

            Log::info('FCM token subscribed to topic', [
                'topic' => self::TOPIC,
            ]);
        } catch (\Throwable $e) {
            Log::error('FCM subscribe failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Unsubscribe token device dari topic workcode-updates.
     */
    public function unsubscribeFromWorkcodeUpdates(string $token): void
    {
        if ($this->disabledForTests()) {
            return;
        }

        try {
            $this->messaging()->unsubscribeFromTopic(self::TOPIC, [$token]);

            Log::info('FCM token unsubscribed from topic', [
                'topic' => self::TOPIC,
            ]);
        } catch (\Throwable $e) {
            Log::error('FCM unsubscribe failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
