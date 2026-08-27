/**
 * Liveness / Anti-Spoofing Challenge Module
 * Digunakan untuk memverifikasi kehadiran wajah dan mata terbuka
 * secara dinamis pada saat pendaftaran maupun presensi wajah.
 */

export const LIVENESS_CHALLENGES = [
    {
        id: 'eyes_open',
        label: 'Mata Terbuka',
        instruction: 'Tahan posisi. Mendeteksi wajah...',
        badge: 'Deteksi Wajah',
        icon: '👀',
        description: 'Pastikan wajah Anda terlihat jelas dan mata terbuka.',
        validate: (detection) => {
            if (!detection.landmarks) return false;
            const p = detection.landmarks.positions;
            
            // Eye Aspect Ratio (EAR) helper
            const calcEAR = (eyePts) => {
                const v1 = Math.hypot(eyePts[1].x - eyePts[5].x, eyePts[1].y - eyePts[5].y);
                const v2 = Math.hypot(eyePts[2].x - eyePts[4].x, eyePts[2].y - eyePts[4].y);
                const h = Math.hypot(eyePts[0].x - eyePts[3].x, eyePts[0].y - eyePts[3].y);
                if (h === 0) return 0.3;
                return (v1 + v2) / (2.0 * h);
            };

            const leftEyeEAR = calcEAR([p[36], p[37], p[38], p[39], p[40], p[41]]);
            const rightEyeEAR = calcEAR([p[42], p[43], p[44], p[45], p[46], p[47]]);

            // Mata dianggap terbuka jika EAR > 0.20
            return leftEyeEAR > 0.20 && rightEyeEAR > 0.20;
        }
    }
];

/**
 * Mengambil satu tantangan acak dari daftar yang tersedia.
 * @param {string|null} excludeId - ID tantangan sebelumnya yang ingin dihindari jika di-regenerate
 * @returns {object} Tantangan terpilih
 */
export function getRandomChallenge(excludeId = null) {
    const list = excludeId 
        ? LIVENESS_CHALLENGES.filter(c => c.id !== excludeId)
        : LIVENESS_CHALLENGES;
    return list[Math.floor(Math.random() * list.length)];
}
