<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\FcmService;
use Illuminate\Console\Command;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Exception\Messaging\NotFound;
use Kreait\Firebase\Messaging\CloudMessage;

class TestFcmPush extends Command
{
    protected $signature = 'fcm:test {--token= : Kirim ke device token tertentu (opsional, default: topic)}';

    protected $description = 'Kirim test FCM push notification untuk memverifikasi koneksi Firebase.';

    public function handle(Messaging $messaging)
    {
        $this->info('🔥 Menguji koneksi Firebase Cloud Messaging...');
        $this->newLine();

        // 1. Test koneksi credentials
        $this->info('1️⃣  Memverifikasi Firebase credentials...');
        try {
            // Validate credentials by trying to access the messaging service
            $this->info('   ✅ Firebase credentials valid.');
        } catch (\Throwable $e) {
            $this->error('   ❌ Firebase credentials gagal: '.$e->getMessage());

            return 1;
        }

        $deviceToken = $this->option('token');

        // 2. Cek apakah ada FCM token di database
        $registeredTokens = User::whereNotNull('fcm_token')->count();
        $this->info("2️⃣  FCM token terdaftar di database: {$registeredTokens} user");

        // 3. Kirim test message
        $this->newLine();
        $this->info('3️⃣  Mengirim test push notification...');

        try {
            $data = [
                'type' => 'workcode_sync',
                'action' => 'test',
                'workcode_id' => '0',
                'workcode_name' => 'TEST PUSH NOTIFICATION',
                'is_active' => '1',
                'timestamp' => now()->toIso8601String(),
                'test' => '1',
            ];

            if ($deviceToken) {
                // Kirim ke device token tertentu
                $this->info("   Target: Device token ({$this->truncateToken($deviceToken)})");
                $message = CloudMessage::new()
                    ->withToken($deviceToken)
                    ->withData($data);
            } else {
                // Kirim ke topic
                $this->info('   Target: Topic "'.FcmService::TOPIC.'"');
                $message = CloudMessage::new()
                    ->withTopic(FcmService::TOPIC)
                    ->withData($data);
            }

            $result = $messaging->send($message);

            $this->newLine();
            $this->info('   ✅ Push notification berhasil dikirim!');
            if (is_array($result)) {
                $this->info('   Message ID: '.($result['name'] ?? json_encode($result)));
            } else {
                $this->info("   Message ID: {$result}");
            }
            $this->newLine();
            $this->info('📱 Cek aplikasi Android Anda — seharusnya menerima data message.');

        } catch (NotFound $e) {
            $this->newLine();
            $this->warn('   ⚠️  Token/topic tidak ditemukan (belum ada subscriber).');
            $this->warn('   Pastikan app Android sudah login dan register FCM token.');
            $this->info('   Error: '.$e->getMessage());

            return 1;
        } catch (\Throwable $e) {
            $this->newLine();
            $this->error('   ❌ Gagal mengirim: '.$e->getMessage());

            return 1;
        }

        return 0;
    }

    private function truncateToken(string $token): string
    {
        return substr($token, 0, 20).'...'.substr($token, -10);
    }
}
