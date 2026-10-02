<?php
/**
 * PRE-MIGRATION AUDIT & BACKUP SCRIPT
 * 
 * Jalankan SEBELUM menerapkan migration 2026_10_02_115508 di staging/production.
 * Script ini:
 * 1. Mendeteksi presensi duplikat (workcode_id, participant_id, tanggal yang sama)
 * 2. Membuat backup tabel attendances ke file CSV
 * 3. Menghapus duplikat (menyisakan record paling awal)
 * 4. Mengisi kolom tanggal yang NULL dari created_at
 * 
 * Jalankan: php artisan tinker < scripts/pre_migration_audit.php
 * Atau:     php scripts/pre_migration_audit.php (dari root project)
 */

require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== PRE-MIGRATION AUDIT & BACKUP ===\n\n";

// --- STEP 1: Backup attendances ke CSV ---
$backupDir = storage_path('app/backups');
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

$timestamp = date('Ymd_His');
$backupFile = "{$backupDir}/attendances_backup_{$timestamp}.csv";

echo "1. Membuat backup attendances...\n";
$attendances = DB::table('attendances')->get();
echo "   Total records: {$attendances->count()}\n";

$fp = fopen($backupFile, 'w');
if ($attendances->isNotEmpty()) {
    // Header
    fputcsv($fp, array_keys((array) $attendances->first()));
    // Data
    foreach ($attendances as $row) {
        fputcsv($fp, (array) $row);
    }
}
fclose($fp);
echo "   Backup tersimpan: {$backupFile}\n\n";

// --- STEP 2: Cek apakah kolom tanggal sudah ada ---
$hasTanggal = Schema::hasColumn('attendances', 'tanggal');
echo "2. Kolom 'tanggal' " . ($hasTanggal ? "sudah ada" : "belum ada") . "\n\n";

// --- STEP 3: Isi tanggal NULL dari created_at ---
if ($hasTanggal) {
    $nullCount = DB::table('attendances')->whereNull('tanggal')->count();
    echo "3. Attendances dengan tanggal NULL: {$nullCount}\n";
    if ($nullCount > 0) {
        // SQLite
        if (config('database.default') === 'sqlite') {
            DB::statement("UPDATE attendances SET tanggal = DATE(created_at) WHERE tanggal IS NULL");
        } else {
            // MySQL
            DB::statement("UPDATE attendances SET tanggal = DATE(created_at) WHERE tanggal IS NULL");
        }
        echo "   Diisi dari created_at: {$nullCount} records\n";
    }
    echo "\n";
} else {
    echo "3. (Skip: kolom tanggal belum ada, migration akan menambahkannya)\n\n";
}

// --- STEP 4: Deteksi duplikat ---
echo "4. Mendeteksi presensi duplikat...\n";

if ($hasTanggal) {
    $duplicates = DB::select("
        SELECT workcode_id, participant_id, tanggal, COUNT(*) as cnt
        FROM attendances
        WHERE tanggal IS NOT NULL
        GROUP BY workcode_id, participant_id, tanggal
        HAVING COUNT(*) > 1
    ");
} else {
    // Fallback: gunakan DATE(created_at)
    $duplicates = DB::select("
        SELECT workcode_id, participant_id, DATE(created_at) as tanggal, COUNT(*) as cnt
        FROM attendances
        GROUP BY workcode_id, participant_id, DATE(created_at)
        HAVING COUNT(*) > 1
    ");
}

echo "   Grup duplikat ditemukan: " . count($duplicates) . "\n";

if (count($duplicates) === 0) {
    echo "   ✅ Tidak ada duplikat. Aman untuk menerapkan unique constraint.\n\n";
} else {
    $totalDuplicateRows = 0;

    foreach ($duplicates as $dup) {
        echo "   - workcode_id={$dup->workcode_id}, participant_id={$dup->participant_id}, tanggal={$dup->tanggal}: {$dup->cnt} records\n";

        // Ambil semua records duplikat, sisakan yang paling awal (ID terkecil)
        if ($hasTanggal) {
            $records = DB::table('attendances')
                ->where('workcode_id', $dup->workcode_id)
                ->where('participant_id', $dup->participant_id)
                ->where('tanggal', $dup->tanggal)
                ->orderBy('id')
                ->get();
        } else {
            $records = DB::table('attendances')
                ->where('workcode_id', $dup->workcode_id)
                ->where('participant_id', $dup->participant_id)
                ->whereRaw('DATE(created_at) = ?', [$dup->tanggal])
                ->orderBy('id')
                ->get();
        }

        $keepId = $records->first()->id;
        $deleteIds = $records->skip(1)->pluck('id')->toArray();
        $totalDuplicateRows += count($deleteIds);

        echo "     Menyisakan ID {$keepId}, menghapus " . count($deleteIds) . " duplikat: [" . implode(', ', $deleteIds) . "]\n";

        DB::table('attendances')->whereIn('id', $deleteIds)->delete();
    }

    echo "\n   🧹 Total baris duplikat dihapus: {$totalDuplicateRows}\n";
    echo "   ✅ Data sudah bersih. Aman untuk menerapkan unique constraint.\n\n";
}

// --- STEP 5: Verifikasi ulang ---
echo "5. Verifikasi akhir...\n";
$finalCount = DB::table('attendances')->count();
echo "   Total attendances setelah cleanup: {$finalCount}\n";

if ($hasTanggal) {
    $stillNull = DB::table('attendances')->whereNull('tanggal')->count();
    echo "   Tanggal masih NULL: {$stillNull}\n";
    
    $verifyDupes = DB::select("
        SELECT COUNT(*) as cnt FROM (
            SELECT workcode_id, participant_id, tanggal
            FROM attendances
            WHERE tanggal IS NOT NULL
            GROUP BY workcode_id, participant_id, tanggal
            HAVING COUNT(*) > 1
        ) AS dupes
    ");
    echo "   Sisa duplikat: {$verifyDupes[0]->cnt}\n";
}

echo "\n=== AUDIT SELESAI ===\n";
echo "Backup file: {$backupFile}\n";
echo "Jalankan migration setelah verifikasi: php artisan migrate\n";
