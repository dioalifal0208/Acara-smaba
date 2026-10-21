<?php

namespace App\Support;

/**
 * Aturan tunggal pencocokan wajah untuk SEMUA jalur presensi:
 * web peserta (1:1), scanner admin (1:N) dan aplikasi Android (POST /api/v1/attendance).
 *
 * Model kanonik: face-api.js 0.22.2 FaceRecognitionNet (dlib ResNet-34), 128-d. Web memakai
 * face-api.js, Android memakai hasil konversi TFLite di docs/android/face-parity/models.
 *
 * Aturan: normalisasi L2 kedua sisi (input & setiap sampel tersimpan), jarak Euclidean ke sampel
 * 128-d terdekat, cocok bila jarak <= threshold (config attendance.face.threshold, env FACE_THRESHOLD).
 * Sampel tersimpan yang bukan 128-d (mis. 512-d dari model Android lama) tidak kompatibel dan
 * diabaikan; peserta yang hanya punya sampel seperti itu harus mendaftar ulang wajah.
 *
 * Descriptor dan jarak adalah data biometrik: jangan pernah dicatat ke log atau dikirim ke klien.
 */
final class FaceMatcher
{
    public const MODEL_ID = 'faceapi-resnet34-128';

    public static function threshold(): float
    {
        return (float) config('attendance.face.threshold', 0.45);
    }

    /**
     * Sampel tersimpan yang kompatibel dengan model kanonik (tepat 128-d).
     *
     * @return list<list<float>>
     */
    public static function compatibleVectors(mixed $stored): array
    {
        return array_values(array_filter(
            FaceDescriptor::vectors($stored),
            fn (array $vector) => count($vector) === FaceDescriptor::DIMENSIONS,
        ));
    }

    public static function compatibleSampleCount(mixed $stored): int
    {
        return count(self::compatibleVectors($stored));
    }

    /**
     * Jarak (setelah L2 kedua sisi) ke sampel 128-d terdekat, atau null bila input bukan vector
     * 128-d atau tidak ada sampel tersimpan yang kompatibel.
     */
    public static function distance(array $input, mixed $stored): ?float
    {
        if (! FaceDescriptor::isCompatibleVector($input)) {
            return null;
        }

        $input = FaceDescriptor::normalize(array_map('floatval', array_values($input)));

        $best = null;
        foreach (self::compatibleVectors($stored) as $vector) {
            $distance = FaceDescriptor::distance($input, FaceDescriptor::normalize($vector));
            $best = $best === null ? $distance : min($best, $distance);
        }

        return $best;
    }

    public static function matches(array $input, mixed $stored): bool
    {
        $distance = self::distance($input, $stored);

        return $distance !== null && $distance <= self::threshold();
    }
}
