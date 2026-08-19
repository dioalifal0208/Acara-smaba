/**
 * Liveness / Anti-Spoofing Challenge Module
 * Digunakan untuk memverifikasi keaslian pengguna (live human presence)
 * secara dinamis dan acak pada saat pendaftaran maupun presensi wajah.
 */

export const LIVENESS_CHALLENGES = [
    {
        id: 'smile',
        label: 'Tersenyum Lebar',
        instruction: 'Tantangan: TERSENYUM LEBAR 😊',
        badge: '😁 Tersenyum Lebar',
        icon: '😁',
        description: 'Tersenyumlah dengan jelas menghadap kamera.',
        validate: (detection, displaySize) => {
            // Memeriksa probabilitas ekspresi bahagia
            if (detection.expressions && detection.expressions.happy > 0.40) {
                return true;
            }
            // Fallback geometris: rasio sudut mulut terhadap mata
            if (detection.landmarks) {
                const p = detection.landmarks.positions;
                const mouthWidth = Math.hypot(p[54].x - p[48].x, p[54].y - p[48].y);
                const eyeDistance = Math.hypot(p[45].x - p[36].x, p[45].y - p[36].y);
                if (eyeDistance > 0 && mouthWidth / eyeDistance > 0.85) {
                    return true;
                }
            }
            return false;
        }
    },
    {
        id: 'mouth',
        label: 'Buka Mulut Lebar',
        instruction: 'Tantangan: BUKA MULUT LEBAR 😲',
        badge: '😲 Buka Mulut Lebar',
        icon: '😲',
        description: 'Buka mulut Anda secara jelas ke arah kamera.',
        validate: (detection, displaySize) => {
            if (detection.expressions && detection.expressions.surprised > 0.50) {
                return true;
            }
            if (!detection.landmarks) return false;
            const p = detection.landmarks.positions;
            const innerLipDist = Math.abs(p[62].y - p[66].y);
            const outerLipDist = Math.abs(p[51].y - p[57].y);
            const faceBoxHeight = detection.detection ? detection.detection.box.height : 150;
            const threshold = Math.max(12, faceBoxHeight * 0.08);
            return innerLipDist > threshold || outerLipDist > Math.max(22, faceBoxHeight * 0.15);
        }
    },
    {
        id: 'blink',
        label: 'Kedipkan Mata',
        instruction: 'Tantangan: KEDIPKAN MATA 😉',
        badge: '😉 Kedipkan Mata',
        icon: '😉',
        description: 'Kedipkan kedua mata atau salah satu mata Anda.',
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

            // Terpejam saat EAR < 0.185 (normal terbuka adalah 0.25 - 0.38)
            return leftEyeEAR < 0.185 || rightEyeEAR < 0.185;
        }
    },
    {
        id: 'turn_left',
        label: 'Tengok ke Kiri',
        instruction: 'Tantangan: TENGOK KE KIRI 👈',
        badge: '👈 Tengok ke Kiri',
        icon: '👈',
        description: 'Tengokkan kepala Anda perlahan ke arah kiri.',
        validate: (detection) => {
            if (!detection.landmarks) return false;
            const p = detection.landmarks.positions;
            const leftJaw = p[0];
            const rightJaw = p[16];
            const noseTip = p[30];
            
            const distLeft = Math.abs(noseTip.x - leftJaw.x);
            const distRight = Math.abs(rightJaw.x - noseTip.x);
            if (distLeft === 0 || distRight === 0) return false;
            
            const ratio = distLeft / distRight;
            // Memerhitungkan mirrored webcam
            return ratio < 0.52 || ratio > 1.95;
        }
    },
    {
        id: 'turn_right',
        label: 'Tengok ke Kanan',
        instruction: 'Tantangan: TENGOK KE KANAN 👉',
        badge: '👉 Tengok ke Kanan',
        icon: '👉',
        description: 'Tengokkan kepala Anda perlahan ke arah kanan.',
        validate: (detection) => {
            if (!detection.landmarks) return false;
            const p = detection.landmarks.positions;
            const leftJaw = p[0];
            const rightJaw = p[16];
            const noseTip = p[30];
            
            const distLeft = Math.abs(noseTip.x - leftJaw.x);
            const distRight = Math.abs(rightJaw.x - noseTip.x);
            if (distLeft === 0 || distRight === 0) return false;
            
            const ratio = distRight / distLeft;
            return ratio < 0.52 || ratio > 1.95;
        }
    },
    {
        id: 'tilt_head',
        label: 'Miringkan Kepala',
        instruction: 'Tantangan: MIRINGKAN KEPALA 🙃',
        badge: '🙃 Miringkan Kepala',
        icon: '🙃',
        description: 'Miringkan kepala Anda sedikit ke samping.',
        validate: (detection) => {
            if (!detection.landmarks) return false;
            const p = detection.landmarks.positions;
            const leftEyeCenter = {
                x: (p[36].x + p[39].x) / 2,
                y: (p[36].y + p[39].y) / 2,
            };
            const rightEyeCenter = {
                x: (p[42].x + p[45].x) / 2,
                y: (p[42].y + p[45].y) / 2,
            };
            
            const dx = rightEyeCenter.x - leftEyeCenter.x;
            const dy = rightEyeCenter.y - leftEyeCenter.y;
            const angleDeg = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
            
            // Kemiringan kepala minimal 12 derajat dan maksimal 75 derajat
            return angleDeg > 11 && angleDeg < 75;
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
