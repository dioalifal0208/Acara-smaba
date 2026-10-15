<?php

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\LogRecord;

/**
 * Pengaman terakhir log: nilai pada kunci sensitif (descriptor wajah, password, token, dokumen,
 * foto) di `context`/`extra` diganti `[REDACTED]` sebelum ditulis, termasuk di array bersarang.
 * Didaftarkan lewat opsi `tap` pada channel log di config/logging.php.
 */
class RedactSensitiveData
{
    private const SENSITIVE_KEYS = [
        'face_descriptor', 'descriptor', 'descriptors', 'face_capture', 'photo', 'signature',
        'password', 'password_confirmation', 'current_password', 'token', 'fcm_token',
        'authorization', 'api_token', 'access_token', 'idempotency_key', 'dokumen',
    ];

    public function __invoke(Logger $logger): void
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->pushProcessor(fn (LogRecord $record) => $record->with(
                context: $this->redact($record->context),
                extra: $this->redact($record->extra),
            ));
        }
    }

    private function redact(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($key) && in_array(strtolower($key), self::SENSITIVE_KEYS, true)) {
                $data[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $data[$key] = $this->redact($value);
            }
        }

        return $data;
    }
}
