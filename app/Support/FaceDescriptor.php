<?php

namespace App\Support;

/**
 * Utilitas descriptor wajah (face-api.js / Android).
 *
 * Data wajah peserta bisa berupa satu vector (format lama) atau beberapa vector
 * sampel wajah depan dari pendaftaran terpandu. Semua pencocokan memakai jarak terdekat ke salah satunya.
 */
final class FaceDescriptor
{
    public const DIMENSIONS = 128;

    /** Jumlah minimum sampel wajah depan dari pendaftaran terpandu. */
    public const MIN_ENROLLMENT_VECTORS = 3;

    public const MAX_ENROLLMENT_VECTORS = 10;

    /** Jarak maksimum tiap vector ke rata-ratanya; lebih dari ini berarti bukan orang yang sama. */
    public const MAX_ENROLLMENT_SPREAD = 0.55;

    /**
     * Ubah data tersimpan (array, JSON string, single atau multi) menjadi daftar vector numerik.
     *
     * @return list<list<float>>
     */
    public static function vectors(mixed $stored): array
    {
        if (is_string($stored)) {
            $stored = json_decode($stored, true);
        }

        if (! is_array($stored) || $stored === []) {
            return [];
        }

        if (self::isVector($stored)) {
            return [array_map('floatval', array_values($stored))];
        }

        $vectors = [];
        foreach ($stored as $vector) {
            if (is_array($vector) && $vector !== [] && self::isVector($vector)) {
                $vectors[] = array_map('floatval', array_values($vector));
            }
        }

        return $vectors;
    }

    /**
     * Jarak Euclidean terdekat antara input dan salah satu vector tersimpan berdimensi sama.
     * Mengembalikan null bila tidak ada vector berdimensi sama (beda model AI).
     * Untuk pencocokan presensi pakai App\Support\FaceMatcher (aturan tunggal web & Android).
     *
     * @param  bool  $normalize  L2-normalisasi kedua sisi (Android mengirim vector ternormalisasi)
     */
    public static function minDistance(array $input, mixed $stored, bool $normalize = false): ?float
    {
        $input = array_map('floatval', array_values($input));
        if ($normalize) {
            $input = self::normalize($input);
        }

        $best = null;
        foreach (self::vectors($stored) as $vector) {
            if (count($vector) !== count($input)) {
                continue;
            }

            $distance = self::distance($input, $normalize ? self::normalize($vector) : $vector);
            $best = $best === null ? $distance : min($best, $distance);
        }

        return $best;
    }

    /**
     * Validasi kiriman pendaftaran wajah.
     *
     * @return string|null pesan error, atau null bila valid
     */
    public static function validateEnrollment(mixed $value, bool $requireMultiple): ?string
    {
        if (! is_array($value) || $value === []) {
            return 'Data wajah tidak valid.';
        }

        $isSingle = self::isVector($value);
        if ($isSingle && $requireMultiple) {
            return 'Pendaftaran wajah harus melalui pemindaian wajah terpandu. Muat ulang halaman lalu ulangi pendaftaran.';
        }

        $vectors = $isSingle ? [$value] : $value;
        if (! $isSingle && (count($vectors) < self::MIN_ENROLLMENT_VECTORS || count($vectors) > self::MAX_ENROLLMENT_VECTORS)) {
            return 'Jumlah data wajah tidak sesuai. Ulangi pendaftaran.';
        }

        foreach ($vectors as $vector) {
            if (! is_array($vector) || count($vector) !== self::DIMENSIONS || ! self::isVector($vector)) {
                return 'Format data wajah tidak valid.';
            }
        }

        if (! $isSingle && self::spread(self::vectors($vectors)) > self::MAX_ENROLLMENT_SPREAD) {
            return 'Data wajah tidak konsisten (kemungkinan lebih dari satu orang atau wajah tertutup). Ulangi pendaftaran.';
        }

        return null;
    }

    /**
     * Jarak terjauh sebuah vector ke rata-rata seluruh vector.
     *
     * @param  list<list<float>>  $vectors
     */
    private static function spread(array $vectors): float
    {
        $dimensions = count($vectors[0]);
        $mean = array_fill(0, $dimensions, 0.0);
        foreach ($vectors as $vector) {
            foreach ($vector as $i => $value) {
                $mean[$i] += $value / count($vectors);
            }
        }

        return max(array_map(fn ($vector) => self::distance($vector, $mean), $vectors));
    }

    /**
     * Ubah angka (mis. string dari multipart) menjadi float, mempertahankan bentuk single/multi.
     */
    public static function toFloats(array $value): array
    {
        if (self::isVector($value)) {
            return array_map('floatval', array_values($value));
        }

        return array_map(fn ($vector) => is_array($vector) ? array_map('floatval', array_values($vector)) : $vector, array_values($value));
    }

    /** Benar bila nilai adalah satu vector numerik 128-d (model face-api.js). */
    public static function isCompatibleVector(mixed $value): bool
    {
        return is_array($value) && count($value) === self::DIMENSIONS && self::isVector($value);
    }

    private static function isVector(array $value): bool
    {
        foreach ($value as $item) {
            if (! is_int($item) && ! is_float($item) && ! (is_string($item) && is_numeric($item))) {
                return false;
            }
        }

        return true;
    }

    public static function distance(array $a, array $b): float
    {
        $sum = 0.0;
        foreach ($a as $i => $value) {
            $sum += ($value - $b[$i]) ** 2;
        }

        return sqrt($sum);
    }

    public static function normalize(array $vector): array
    {
        $norm = sqrt(array_sum(array_map(fn ($v) => $v * $v, $vector)));

        return $norm > 0 ? array_map(fn ($v) => $v / $norm, $vector) : $vector;
    }
}
