<?php

namespace App\Services;

use App\Models\Workcode;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;

class FcmService
{
    /**
     * Topic yang digunakan untuk broadcast update workcode.
     */
    const TOPIC = 'workcode-updates';

    protected Messaging $messaging;

    public function __construct(Messaging $messaging)
    {
        $this->messaging = $messaging;
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
                ->withData($data);

            $this->messaging->send($message);

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
     * Subscribe token device ke topic workcode-updates.
     */
    public function subscribeToWorkcodeUpdates(string $token): void
    {
        try {
            $this->messaging->subscribeToTopic(self::TOPIC, [$token]);

            Log::info('FCM token subscribed to topic', [
                'topic' => self::TOPIC,
                'token' => substr($token, 0, 20).'...',
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
        try {
            $this->messaging->unsubscribeFromTopic(self::TOPIC, [$token]);

            Log::info('FCM token unsubscribed from topic', [
                'topic' => self::TOPIC,
                'token' => substr($token, 0, 20).'...',
            ]);
        } catch (\Throwable $e) {
            Log::error('FCM unsubscribe failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
